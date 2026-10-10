import {body,json,limited,session} from './social-backend.js';
import {REGIONS} from './social-data.js';

export const CRAFTS=[['ceramics','Ceramics'],['textiles','Textiles'],['paper','Paper & prints'],['sculpture','Sculpture'],['glass','Glass'],['wood','Wood'],['metal','Metal & jewellery'],['painting','Painting'],['photography','Photography'],['digital','Digital art'],['mixed-media','Mixed media'],['community','Creative communities']];
const prefix='/communiverse/_public/20261008-marketplace-1/';
const covers={ceramics:'process-ceramics',textiles:'process-textiles',paper:'process-paper',sculpture:'wire',glass:'process-glass',wood:'process-wood',metal:'process-metal',painting:'paper',photography:'glass',digital:'print','mixed-media':'silver',community:'basket'};
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max+1):'';
const fold=v=>String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const key=v=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{1,79}$/.test(v)?v:'';
const tags=v=>[...new Set((Array.isArray(v)?v:String(v||'').split(',')).map(x=>clean(x,40).toLowerCase()).filter(x=>x.length>1&&x.length<=40&&!/[\u0000-\u001f]/.test(x)))].slice(0,12);
async function member(request,env,verified=false){const p=await session(request,env);if(!p)fail('Sign in to join your circle.',401);if(verified&&!p.email_verified_at)fail('Confirm your email before creating or sharing publicly.',403);return p;}
const publicCircle=(c,p)=>({id:c.id,name:c.name,description:c.description,craft:c.craft,region:c.region,tags:JSON.parse(c.tags),cover:c.cover,rules:c.rules,createdAt:c.created_at,creator:c.owner_id?'member-'+c.owner_id:'',creatorName:c.first_name||'Communiverse',followers:c.followers||0,posts:c.posts||0,following:!!c.following,canManage:!!p&&c.owner_id===p.id,invitation:'/communiverse/communities/?circle='+encodeURIComponent(c.id)+'&invite=1'});
const select=`SELECT c.id,c.owner_id,c.name,c.description,c.craft,c.region,c.tags,c.cover,c.rules,c.created_at,m.first_name,
 (SELECT count(*) FROM cv_circle_follows f JOIN cv_members fm ON fm.id=f.member_id WHERE f.circle_id=c.id AND fm.status='active') followers,
 (SELECT count(*) FROM cv_circle_posts cp JOIN cv_posts p ON p.id=cp.post_id JOIN cv_members pm ON pm.id=p.member_id WHERE cp.circle_id=c.id AND p.status='active' AND pm.status='active') posts,
 EXISTS(SELECT 1 FROM cv_circle_follows f WHERE f.circle_id=c.id AND f.member_id=?) following
 FROM cv_circles c LEFT JOIN cv_members m ON m.id=c.owner_id WHERE c.status='active' AND (c.owner_id IS NULL OR m.status='active')`;
async function getCircle(db,id,p){if(!key(id))fail('This circle is unavailable.',404);const c=await db.prepare(select+' AND c.id=?').bind(p?.id||'',id).first();if(!c)fail('This circle is unavailable.',404);return c;}
function details(b){const name=clean(b.name,64),description=clean(b.description,600),craft=clean(b.craft,30),r=clean(b.region,30),topics=tags(b.tags);if(name.length<3||name.length>64||description.length<12||description.length>600||/[\u0000-\u001f]/.test(name)||!CRAFTS.some(x=>x[0]===craft)||(r&&!REGIONS.some(x=>x.id===r)))fail('Give the circle a name, a clear purpose and a craft.');return {search:fold([name,description,...topics].join(' ')),name,description,craft,region:r,tags:[...new Set([craft,...topics])],cover:prefix+(covers[craft]||'basket')+'.jpg'};}
const safeLink=v=>{if(!v)return '';try{const u=new URL(v);if(u.protocol!=='https:'||u.username||u.password||u.hostname==='localhost'||/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)||u.hostname.endsWith('.local'))fail('Use a public https link.');return u.href.slice(0,1500)}catch{fail('Use a public https link.')}};

export async function circlesAPI(request,env){const u=new URL(request.url),path=u.pathname.replace(/\/$/,''),db=env.COMMUNIVERSE_DB;
try{
 if(request.method==='GET'&&path==='/communiverse/api/circles'){
  const p=await session(request,env),id=u.searchParams.get('id');if(id)return json({circle:publicCircle(await getCircle(db,id,p),p)});
  const q=fold(clean(u.searchParams.get('q'),80)),craft=clean(u.searchParams.get('craft'),30),r=clean(u.searchParams.get('region'),30),following=u.searchParams.get('following')==='1';
  if(following&&!p)return json({circles:[],total:0,next:null,needsSignIn:true});
  const where=[],params=[p?.id||''];if(q){where.push("c.search LIKE ?");params.push('%'+q.replace(/[\\%_]/g,'\\$&')+'%');where[where.length-1]+=" ESCAPE '\\'";}if(craft){where.push('c.craft=?');params.push(craft)}if(r){where.push('c.region=?');params.push(r)}if(following){where.push('EXISTS(SELECT 1 FROM cv_circle_follows f WHERE f.circle_id=c.id AND f.member_id=?)');params.push(p.id)}
  const clauses=where.length?' AND '+where.join(' AND '):'',offset=Math.max(0,Math.min(10000,Math.floor(Number(u.searchParams.get('offset')))||0));
  const count=await db.prepare("SELECT count(*) n FROM cv_circles c LEFT JOIN cv_members m ON m.id=c.owner_id WHERE c.status='active' AND (c.owner_id IS NULL OR m.status='active')"+clauses).bind(...params.slice(1)).first();
  const rows=await db.prepare(select+clauses+" ORDER BY CASE WHEN c.craft='community' THEN 1 ELSE 0 END,c.created_at DESC,c.name LIMIT 25 OFFSET ?").bind(...params,offset).all();
  return json({circles:rows.results.slice(0,24).map(c=>publicCircle(c,p)),total:count.n,next:rows.results.length>24?offset+24:null});
 }
 if(request.method==='POST'&&path==='/communiverse/api/circles'){
  const b=await body(request,3000),p=await member(request,env,true);await limited(request,db,'circle-create',5);if(!/^[a-f0-9-]{36}$/.test(b.requestId||''))fail('Refresh the form.');
  let c=await db.prepare('SELECT id FROM cv_circles WHERE owner_id=? AND request_key=?').bind(p.id,b.requestId).first();if(c)return json({ok:true,id:c.id},201);
  const d=details(b),slug=d.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)||'circle',id=slug+'-'+b.requestId.slice(0,8);
  await db.batch([db.prepare('INSERT INTO cv_circles(id,owner_id,name,description,craft,region,tags,cover,search,request_key) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,p.id,d.name,d.description,d.craft,d.region,JSON.stringify(d.tags),d.cover,d.search,b.requestId),db.prepare('INSERT INTO cv_circle_follows(circle_id,member_id) VALUES(?,?)').bind(id,p.id)]);return json({ok:true,id},201);
 }
 if(request.method==='POST'&&path==='/communiverse/api/circles/edit'){
  const b=await body(request,3000),p=await member(request,env,true),c=await getCircle(db,b.id,p);if(c.owner_id!==p.id)fail('Only the circle’s creator can edit it.',403);await limited(request,db,'circle-edit',20);const d=details(b);await db.prepare('UPDATE cv_circles SET name=?,description=?,craft=?,region=?,tags=?,cover=?,search=? WHERE id=? AND owner_id=?').bind(d.name,d.description,d.craft,d.region,JSON.stringify(d.tags),d.cover,d.search,c.id,p.id).run();return json({ok:true,id:c.id});
 }
 if(request.method==='POST'&&path==='/communiverse/api/circles/follow'){
  const b=await body(request,500),p=await member(request,env),c=await getCircle(db,b.id,p);if(typeof b.active!=='boolean')fail('Choose a circle state.');await limited(request,db,'circle-follow',120);await db.prepare(b.active?'INSERT OR IGNORE INTO cv_circle_follows(circle_id,member_id) VALUES(?,?)':'DELETE FROM cv_circle_follows WHERE circle_id=? AND member_id=?').bind(c.id,p.id).run();return json({ok:true,circle:publicCircle(await getCircle(db,c.id,p),p)});
 }
 if(request.method==='GET'&&path==='/communiverse/api/circles/posts'){
  const p=await session(request,env),c=await getCircle(db,u.searchParams.get('circle'),p),offset=Math.max(0,Math.min(10000,Math.floor(Number(u.searchParams.get('offset')))||0)),kind=clean(u.searchParams.get('kind'),20);const filter=kind==='events'?" AND p.kind IN ('event','workshop')":['work','event','workshop','discussion'].includes(kind)?' AND p.kind=?':'',params=[c.id,...(filter&&kind!=='events'?[kind]:[]),offset];
  const rows=await db.prepare("SELECT p.id,p.member_id,p.region,p.kind,p.title,p.body,p.url,p.image,p.tags,p.created_at,m.first_name,(SELECT count(*) FROM cv_comments cc JOIN cv_members cm ON cm.id=cc.member_id WHERE cc.target=p.id AND cc.status='active' AND cm.status='active') comments FROM cv_circle_posts cp JOIN cv_posts p ON p.id=cp.post_id JOIN cv_members m ON m.id=p.member_id WHERE cp.circle_id=? AND p.status='active' AND m.status='active'"+filter+' ORDER BY p.created_at DESC,p.id DESC LIMIT 21 OFFSET ?').bind(...params).all();return json({posts:rows.results.slice(0,20).map(({member_id,tags,...x})=>({...x,tags:JSON.parse(tags),author:'member-'+member_id,canRemove:!!p&&(p.id===member_id||p.id===c.owner_id)})),next:rows.results.length>20?offset+20:null,circle:publicCircle(c,p)});
 }
 if(request.method==='POST'&&path==='/communiverse/api/circles/posts'){
  const b=await body(request,10000),p=await member(request,env,true),c=await getCircle(db,b.circle,p);if(!c.following)fail('Follow this circle before sharing with it.',403);await limited(request,db,'circle-post',12);
  const title=clean(b.title,120),text=clean(b.body,1600),kind=['discussion','work','event','workshop'].includes(b.kind)?b.kind:'discussion',image=clean(b.image,200),url=safeLink(b.url);if(!title||title.length>120||!text||text.length>1600)fail('Add a title and a short story.');if(image&&!new RegExp('^/communiverse/_public/community/'+p.id+'/[a-f0-9-]{36}\\.(jpg|png|webp)$').test(image))fail('Choose your own uploaded photograph.');if(!/^[a-f0-9-]{36}$/.test(b.requestId||''))fail('Refresh the form.');
  const prior=await db.prepare('SELECT member_id FROM cv_posts WHERE id=?').bind(b.requestId).first();if(prior&&prior.member_id!==p.id)fail('Refresh the form.',409);
  await db.batch([db.prepare('INSERT OR IGNORE INTO cv_posts(id,member_id,region,kind,title,body,url,image,tags) VALUES(?,?,?,?,?,?,?,?,?)').bind(b.requestId,p.id,c.region,kind,title,text,url,image,JSON.stringify([...new Set([...JSON.parse(c.tags),...tags(b.tags),p.craft.toLowerCase()])].slice(0,24))),db.prepare('INSERT OR IGNORE INTO cv_circle_posts(circle_id,post_id) VALUES(?,?)').bind(c.id,b.requestId)]);return json({ok:true,id:b.requestId},201);
 }
 if(request.method==='POST'&&path==='/communiverse/api/circles/remove-post'){
  const b=await body(request,500),p=await member(request,env),c=await getCircle(db,b.circle,p),post=await db.prepare('SELECT p.member_id FROM cv_circle_posts cp JOIN cv_posts p ON p.id=cp.post_id WHERE cp.circle_id=? AND p.id=?').bind(c.id,b.id).first();if(!post)fail('This conversation is unavailable.',404);if(post.member_id!==p.id&&c.owner_id!==p.id)fail('Only its author or the circle’s creator can remove it.',403);if(post.member_id===p.id)await db.prepare("UPDATE cv_posts SET status='hidden' WHERE id=?").bind(b.id).run();else await db.prepare('DELETE FROM cv_circle_posts WHERE circle_id=? AND post_id=?').bind(c.id,b.id).run();return json({ok:true});
 }
 return json({error:'Not found'},404);
}catch(e){if(!e.status)console.error('Communiverse circle request unavailable',e.code||'service');return json({error:e.status?e.message:'The circle could not load. Please try again.'},e.status||503)}
}
