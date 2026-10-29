const ORIGIN='https://espacios.me', BASE='/communiverse/workspace/profile/', COOKIE='__Host-cv-profile-link';
const deny=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const cookie=(value,age=600)=>`${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}});
const redirect=(path,cookies=[])=>{const h=new Headers({'Location':path,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});for(const c of cookies)h.append('Set-Cookie',c);return new Response(null,{status:303,headers:h});};
const providerFor=(env,provider)=>provider==='google'?{url:env.SUPABASE_URL,key:env.SUPABASE_PUBLIC_KEY}:{url:env.LINKEDIN_SUPABASE_URL,key:env.LINKEDIN_SUPABASE_PUBLIC_KEY};
const fetchAuth=async(env,url,options={})=>(env.AUTH_FETCH||fetch)(url,{...options,signal:AbortSignal.timeout(15000)});
const authHeaders=a=>({apikey:a.key,'Content-Type':'application/json'});
const sessionFingerprint=request=>request.headers.get('Cookie')?.split(';').map(x=>x.trim()).filter(x=>/^__Host-cv-(?:account|workspace|session)=/.test(x)).sort().join(';')||'';
export function normalizeProfile(b){
 if(!b||typeof b!=='object'||Array.isArray(b)||Object.keys(b).some(k=>!['publicTitle','bio','instagram','tiktok','revision'].includes(k)))deny('Only public profile fields can be edited.');
 const text=(k,max)=>{if(typeof b[k]!=='string')deny('Check your profile details.');const s=b[k].trim();if(s.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s))deny('Check your '+k+'.');return s;};
 const publicTitle=text('publicTitle',80);if(/[\r\n\t]/.test(publicTitle))deny('Enter a single-line role/title.');
 const bio=text('bio',1000),handle=k=>{const s=text(k,31).replace(/^@/,'');if(s&&!/^[A-Za-z0-9._]{1,30}$/.test(s))deny('Enter an Instagram or TikTok handle, without a URL.');return s;};
 if(!Number.isSafeInteger(b.revision)||b.revision<0)deny('Reload your profile before saving.');
 return {publicTitle,bio,instagram:handle('instagram'),tiktok:handle('tiktok'),revision:b.revision};
}
async function readBody(r){if(!r.headers.get('Content-Type')?.startsWith('application/json'))deny('Use the profile form.',415);const reader=r.body?.getReader();let size=0,chunks=[];if(!reader)deny('Enter your profile details.');try{while(true){const x=await reader.read();if(x.done)break;size+=x.value.length;if(size>6000){await reader.cancel();deny('Your profile is too long.',413);}chunks.push(x.value);}}finally{reader.releaseLock();}const bytes=new Uint8Array(size);let pos=0;for(const c of chunks){bytes.set(c,pos);pos+=c.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{deny('Check your profile details.');}}
async function principal(r,env){const headers=new Headers();const c=r.headers.get('Cookie');if(c)headers.set('Cookie',c);const response=await env.MARKETPLACE.fetch(new Request(ORIGIN+'/communiverse/api/identity/me',{headers}));if(!response.ok)deny('Your profile is temporarily unavailable.',503);const d=await response.json();if(!d.person?.id)deny('Sign in to edit your profile.',401);return d.person;}
async function limit(db,id,action,max){const bucket=Math.floor(Date.now()/60000);const r=await db.prepare('INSERT INTO cv_profile_rate_limits(identity_id,action,bucket,hits) VALUES(?,?,?,1) ON CONFLICT(identity_id,action) DO UPDATE SET hits=CASE WHEN bucket=excluded.bucket THEN hits+1 ELSE 1 END,bucket=excluded.bucket RETURNING hits').bind(id,action,bucket).first();if(r.hits>max)deny('Please wait a minute and try again.',429);}
const csrf=r=>{if(r.headers.get('Origin')!==ORIGIN)deny('Open this form on Communiverse.',403);};
async function details(db,p){const d=await db.prepare('SELECT public_title,bio,instagram,tiktok,revision FROM cv_profile_details WHERE identity_id=?').bind(p.id).first();const m=!d&&p.member_id?await db.prepare('SELECT instagram,tiktok FROM cv_members WHERE id=?').bind(p.member_id).first():null;return {publicTitle:d?.public_title??p.title??'',bio:d?.bio||'',instagram:d?.instagram??m?.instagram??'',tiktok:d?.tiktok??m?.tiktok??'',revision:d?.revision||0};}
async function connected(db,id){return (await db.prepare('SELECT provider,email,connected_at FROM cv_profile_connections WHERE identity_id=? ORDER BY provider').bind(id).all()).results;}
async function available(env){const result={};await Promise.all(['google','linkedin_oidc'].map(async p=>{const a=providerFor(env,p);try{if(!a.url||!a.key)throw Error();const r=await fetchAuth(env,a.url+'/auth/v1/settings',{headers:authHeaders(a)});result[p]=r.ok&&Boolean((await r.json()).external?.[p]);}catch{result[p]=false;}}));return result;}
function returnPath(value){try{const u=new URL(value||'/communiverse/workspace/?profile=edit',ORIGIN);if(u.origin!==ORIGIN||u.pathname!=='/communiverse/workspace/')return '/communiverse/workspace/?profile=edit';const out=new URL('/communiverse/workspace/',ORIGIN);for(const k of ['view','section','document']){const v=u.searchParams.get(k);if(v&&v.length<=150&&/^[A-Za-z0-9_-]+$/.test(v))out.searchParams.set(k,v);}out.searchParams.set('profile','edit');return out.pathname+out.search;}catch{return '/communiverse/workspace/?profile=edit';}}
async function start(r,env,p,provider,b){if(!['google','linkedin_oidc'].includes(provider))deny('Choose Google or LinkedIn.');if(!(await available(env))[provider])deny('This provider is temporarily unavailable.',503);if(Object.keys(b).some(k=>k!=='returnPath'))deny('Use the connected-account controls.');const session=sessionFingerprint(r);if(!session)deny('Sign in again before connecting an account.',401);await limit(env.COMMUNIVERSE_DB,p.id,'link',8);
 const state=random(),browser=random(),verifier=random(),db=env.COMMUNIVERSE_DB;
 await db.batch([db.prepare('INSERT INTO cv_profile_link_flows(hash,identity_id,provider,verifier,browser_hash,session_hash,return_path,expires_at) VALUES(?,?,?,?,?,?,?,?)').bind(await hash(state),p.id,provider,verifier,await hash(browser),await hash(session),returnPath(b.returnPath),Date.now()+600000),db.prepare('DELETE FROM cv_profile_link_flows WHERE expires_at<?').bind(Date.now())]);
 const a=providerFor(env,provider),u=new URL(a.url+'/auth/v1/authorize'),bytes=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))),challenge=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 // Reuse provider callback allowlists. Google returns through a no-store relay on mail.espacios.me.
 const callback=(provider==='google'?'https://mail.espacios.me':ORIGIN)+'/communiverse/auth/callback/?state=profile-'+state;
 u.search=new URLSearchParams({provider,redirect_to:callback,code_challenge:challenge,code_challenge_method:'s256',scopes:'openid email profile',prompt:'select_account'});
 const response=json({url:u.href});response.headers.append('Set-Cookie',cookie(browser));return response;
}
async function callback(r,env){const u=new URL(r.url),state=u.searchParams.get('state')?.replace(/^profile-/,''),browser=r.headers.get('Cookie')?.match(/(?:^|;\s*)__Host-cv-profile-link=([a-f0-9]{64})(?:;|$)/)?.[1],db=env.COMMUNIVERSE_DB;
 let path='/communiverse/workspace/?profile=edit';try{
 if(!/^[a-f0-9]{64}$/.test(state||'')||!browser)deny('Connection expired.',410);
 const p=await principal(r,env),fingerprint=sessionFingerprint(r);
 const flow=await db.prepare('DELETE FROM cv_profile_link_flows WHERE hash=? AND browser_hash=? AND session_hash=? AND identity_id=? AND expires_at>? RETURNING *').bind(await hash(state),await hash(browser),await hash(fingerprint),p.id,Date.now()).first();if(!flow)deny('Connection expired.',410);path=flow.return_path;
 const code=u.searchParams.get('code');if(u.searchParams.has('error'))return redirect(path+'&connection=cancelled',[cookie('',0)]);if(!code||code.length>4096)deny('Connection expired.',410);
 const a=providerFor(env,flow.provider),token=await fetchAuth(env,a.url+'/auth/v1/token?grant_type=pkce',{method:'POST',headers:authHeaders(a),body:JSON.stringify({auth_code:code,code_verifier:flow.verifier})});if(!token.ok)deny('Connection could not be verified.',400);const t=await token.json();if(typeof t.access_token!=='string')deny('Connection could not be verified.');
 const response=await fetchAuth(env,a.url+'/auth/v1/user',{headers:{...authHeaders(a),Authorization:'Bearer '+t.access_token}});if(!response.ok)deny('Connection could not be verified.');const user=await response.json(),identity=user.identities?.find(i=>i.provider===flow.provider),subject=identity?.identity_data?.sub||identity?.id;
 const email=String(user.email||'').trim().toLowerCase();if(identity?.identity_data?.email&&String(identity.identity_data.email).toLowerCase()!==email)deny('Provider email could not be verified.');if(!user.id||typeof subject!=='string'||subject.length>200||!user.email_confirmed_at||!identity||identity.identity_data?.email_verified===false||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)deny('A verified provider email is required.');
 const legacy=flow.provider+':'+user.id;
 const conflict=await db.prepare('SELECT identity_id FROM cv_profile_connections WHERE (issuer=? AND provider=? AND subject=?) OR (provider=? AND auth_identity=?)').bind(a.url,flow.provider,subject,flow.provider,user.id).first();if(conflict&&conflict.identity_id!==p.id)deny('That account is connected to another Communiverse profile.',409);
 const member=await db.prepare('SELECT member_id FROM cv_google_identities WHERE identity_id=?').bind(legacy).first();if(member&&member.member_id!==p.member_id)deny('That sign-in belongs to another Communiverse profile.',409);
 const owner=await db.prepare("SELECT COALESCE(a.identity_id,'member-'||m.id) AS identity_id FROM cv_members m LEFT JOIN cv_accounts a ON a.member_id=m.id WHERE lower(m.email)=? AND m.status='active' UNION SELECT s.id AS identity_id FROM cv_identity_contacts c JOIN cv_staff s ON s.id=c.identity_id AND s.status='active' WHERE lower(c.email)=? AND c.email_verified=1").bind(email,email).all();if(owner.results.some(x=>x.identity_id!==p.id))deny('That email belongs to another Communiverse profile.',409);
 const writes=[db.prepare('INSERT INTO cv_profile_connections(identity_id,provider,issuer,subject,auth_identity,email) VALUES(?,?,?,?,?,?) ON CONFLICT(identity_id,provider) DO UPDATE SET issuer=excluded.issuer,subject=excluded.subject,auth_identity=excluded.auth_identity,email=excluded.email,connected_at=CURRENT_TIMESTAMP').bind(p.id,flow.provider,a.url,subject,user.id,email)];
 if(flow.provider==='google')writes.push(db.prepare("INSERT INTO cv_identity_contacts(identity_id,email,email_verified) VALUES(?,?,1) ON CONFLICT(identity_id) DO UPDATE SET email=excluded.email,email_verified=1,pending_email='',confirmation_hash=NULL,confirmation_expires_at=NULL,updated_at=CURRENT_TIMESTAMP").bind(p.id,email));
 if(p.member_id)writes.push(db.prepare('INSERT INTO cv_google_identities(identity_id,member_id) VALUES(?,?) ON CONFLICT(identity_id) DO NOTHING').bind(legacy,p.member_id));
 await db.batch(writes);return redirect(path+'&connection='+flow.provider,[cookie('',0)]);
 }catch(e){const code=e.status===409?'conflict':e.status===410||e.status===401?'expired':'failed';return redirect(path+'&connection='+code,[cookie('',0)]);}
}
export default{async fetch(r,env){const u=new URL(r.url),path=u.pathname.replace(/\/$/,'');try{
 if(u.hostname==='mail.espacios.me'&&path==='/communiverse/auth/callback'){
  if(!u.searchParams.get('state')?.startsWith('profile-'))return env.MARKETPLACE.fetch(r);
  if(r.method!=='GET'||!/^profile-[a-f0-9]{64}$/.test(u.searchParams.get('state')))return json({error:'Invalid callback.'},400);
  const target=new URL(BASE+'callback/',ORIGIN);for(const k of ['state','code','error']){const v=u.searchParams.get(k);if(v&&v.length<=4096)target.searchParams.set(k,v);}return redirect(target.href);
 }
 if(u.origin!==ORIGIN)return json({error:'Use espacios.me to edit your profile.'},403);
 if(r.method==='GET'&&(path===BASE+'callback'||(path==='/communiverse/auth/callback'&&u.searchParams.get('state')?.startsWith('profile-'))))return callback(r,env);
 if(path===BASE+'public'&&r.method==='GET'){const slug=u.searchParams.get('person');if(!/^[A-Za-z0-9-]{1,120}$/.test(slug||''))deny('Profile not found.',404);const p=await env.COMMUNIVERSE_DB.prepare("SELECT s.id,s.title FROM cv_staff s WHERE s.profile_slug=? AND s.status='active' UNION SELECT 'member-'||m.id AS id, CASE WHEN m.kind='artist' THEN 'Artist' ELSE 'Communiverse member' END AS title FROM cv_members m WHERE 'member-'||m.id=? AND m.status='active'").bind(slug,slug).first();if(!p)deny('Profile not found.',404);const d=await details(env.COMMUNIVERSE_DB,p);return json({publicTitle:d.publicTitle,bio:d.bio,instagram:d.instagram,tiktok:d.tiktok,customized:d.revision>0});}
 const p=await principal(r,env),db=env.COMMUNIVERSE_DB;
 if(path===BASE+'api'&&r.method==='GET')return json({profileKey:p.id,profile:await details(db,p),connections:await connected(db,p.id),providers:await available(env)});
 if(r.method!=='POST')return json({error:'This profile action is unavailable.'},405);
 csrf(r);const b=await readBody(r);
 if(path===BASE+'api'){const d=normalizeProfile(b);await limit(db,p.id,'save',20);const saved=await db.prepare('INSERT INTO cv_profile_details(identity_id,public_title,bio,instagram,tiktok,revision) SELECT ?,?,?,?,?,1 WHERE ?=0 ON CONFLICT(identity_id) DO UPDATE SET public_title=excluded.public_title,bio=excluded.bio,instagram=excluded.instagram,tiktok=excluded.tiktok,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE revision=? RETURNING revision').bind(p.id,d.publicTitle,d.bio,d.instagram,d.tiktok,d.revision,d.revision).first();
 // Existing rows need an UPDATE path when revision > 0; the insert guard only handles first save.
 if(!saved&&d.revision>0){const updated=await db.prepare('UPDATE cv_profile_details SET public_title=?,bio=?,instagram=?,tiktok=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE identity_id=? AND revision=? RETURNING revision').bind(d.publicTitle,d.bio,d.instagram,d.tiktok,p.id,d.revision).first();if(!updated)deny('Your profile changed in another tab. Reload before saving.',409);}else if(!saved)deny('Your profile changed in another tab. Reload before saving.',409);
 return json({ok:true,profile:await details(db,p)});}
 if(path.startsWith(BASE+'connect/'))return await start(r,env,p,path.slice((BASE+'connect/').length),b);
 return json({error:'This profile action is unavailable.'},404);
 }catch(e){return json({error:e.status?e.message:'Your profile is temporarily unavailable. Try again.'},e.status||503);}}};
