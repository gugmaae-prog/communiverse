const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function readBody(request,max){
 const reader=request.body?.getReader();if(!reader)return '';
 const chunks=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Object.assign(Error('Please shorten your answers.'),{status:413})}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
export const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),x=>x.toString(16).padStart(2,'0')).join('');
export function validateSignup(b){
 const clean=(key,max)=>typeof b[key]==='string'?b[key].trim().slice(0,max+1):'';
 const first_name=clean('firstName',60),city=clean('city',100),craft=clean('craft',80),email=clean('email',254).toLowerCase(),phone=clean('phone',30),kind=b.kind==='artist'?'artist':'member';
 const handle=k=>clean(k,40).replace(/^@/,'');const instagram=handle('instagram'),tiktok=handle('tiktok');
 if(!first_name||first_name.length>60||/[\u0000-\u001f]/.test(first_name)||!city||city.length>100||!craft||craft.length>80)throw Error('Add your first name, city and craft or interest.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw Error('Enter a valid email address.');
 if(!/^\+?[\d\s().-]{7,30}$/.test(phone)||phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15)throw Error('Enter your phone number, including your country code.');
 for(const v of [instagram,tiktok])if(v&&!/^[A-Za-z0-9._]{1,30}$/.test(v))throw Error('Use your social handle, without a profile link.');
 if(b.consent!==true)throw Error('Please agree to publish your circle details.');
 if(!/^[\da-f-]{36}$/i.test(b.requestId||''))throw Error('Reload the form and try again.');
 return {first_name,city,craft,email,phone,kind,instagram,tiktok};
}
export function publicMember(p){
 const slug='member-'+p.id;
 return {slug,name:p.first_name,role:p.craft,location:p.city,category:p.kind==='artist'?'artists':'members',group:p.kind==='artist'?'Artists':'Member',eyebrow:'Communiverse',summary:'Discover '+p.first_name+'’s interest in '+p.craft+'.',more:'Based in '+p.city+'. Connect through their shared social handles.',focus:[p.craft],sample:false,profileUrl:'/communiverse/plug/?person='+slug,image:'/communiverse/_public/member-avatar/'+p.id+'.svg',socials:[...(p.instagram?[{label:'Instagram',url:'https://www.instagram.com/'+p.instagram+'/'}]:[]),...(p.tiktok?[{label:'TikTok',url:'https://www.tiktok.com/@'+p.tiktok}]:[])],sources:[],films:[],workPhotos:[]};
}
export async function publicMembers(db){const {results}=await db.prepare("SELECT id,first_name,city,craft,kind,instagram,tiktok FROM cv_members WHERE status='active' ORDER BY created_at DESC LIMIT 500").all();return results.map(publicMember);}
export function welcome(p,token){
 const url='https://espacios.me/communiverse/confirm/#'+token,plug='https://espacios.me/communiverse/plug/?person=member-'+p.id;
 const subject='Welcome to Communiverse '+p.first_name;
 return {to:p.email,from:{email:'welcome@communiverse.espacios.me',name:'Communiverse'},subject,text:`Hi ${p.first_name},\n\nWelcome to Communiverse. Your circle is already part of the community.\n\nSee your circle: ${plug}\nConfirm your email: ${url}\n\nYour phone number and email stay private. You can explore crafts, meet makers and plan a workshop.\n\nIf you did not join, use the same confirmation link to remove this signup.\n\nCommuniverse · Espacios`,html:`<div style="background:#f3f6fb;padding:40px 20px;font:16px/1.6 Arial,sans-serif;color:#192437"><div style="max-width:520px;margin:auto"><p style="font-weight:700">Communiverse</p><h1 style="font-size:32px;line-height:1.2">Welcome, ${h(p.first_name)}.</h1><p>Your circle is already part of the community. A place for making, discovering and meeting people through craft.</p><p><a href="${plug}" style="color:#076aff">See your circle ↗</a></p><p><a href="${url}" style="display:inline-block;padding:14px 24px;border-radius:24px;background:#076aff;color:white;text-decoration:none">Confirm my email</a></p><p>Your phone number and email stay private.</p><p style="font-size:13px">If you didn’t join, open the confirmation link and choose “Remove this signup”.</p><p>Communiverse · Espacios</p></div></div>`};
}
export async function signup(request,env){
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open the signup form on Communiverse.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Use the signup form.'},415);
 let raw;try{raw=await readBody(request,6000);if(raw.length>6000)return json({error:'Please shorten your answers.'},413);}catch(e){return json({error:e.status===413?'Please shorten your answers.':'Unable to read the form.'},e.status||400);}
 let b,p;try{b=JSON.parse(raw);if(b.website)return json({error:'Unable to submit.'},400);p=validateSignup(b);}catch(e){return json({error:e.message},400);}
 // Atomic D1 limits protect the email sender. No address/IP is stored in this table.
 const hour=Math.floor(Date.now()/3600000),bucket=await hash('cv-join:'+hour+':'+(request.headers.get('CF-Connecting-IP')||'local'));
 const limit=await env.COMMUNIVERSE_DB.prepare('INSERT INTO cv_join_limits(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,(hour+2)*3600000).first();
 if(limit.count>6)return json({error:'Too many requests. Please try again in an hour.'},429);
 await env.COMMUNIVERSE_DB.prepare('DELETE FROM cv_join_limits WHERE expires_at < ?').bind(Date.now()).run();
 const id=crypto.randomUUID(),request_key=await hash(b.requestId),token=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join(''),confirmation_hash=await hash(token),expires=new Date(Date.now()+7*86400000).toISOString();
 const result=await env.COMMUNIVERSE_DB.prepare('INSERT OR IGNORE INTO cv_members(id,request_key,email,phone,first_name,city,craft,kind,instagram,tiktok,confirmation_hash,confirmation_expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,request_key,p.email,p.phone,p.first_name,p.city,p.craft,p.kind,p.instagram,p.tiktok,confirmation_hash,expires).run();
 if(!result.meta.changes){
  const same=await env.COMMUNIVERSE_DB.prepare('SELECT id,welcome_status FROM cv_members WHERE request_key=? AND email=?').bind(request_key,p.email).first();
  return json({ok:true,...(same?{profileUrl:'/communiverse/plug/?person=member-'+same.id,emailStatus:same.welcome_status}:{}),message:same?'Your circle is saved.':'If you already joined, check your welcome email. Your existing details have not been changed.'});
 }
 let emailStatus='failed';
 try{const sent=await env.EMAIL.send(welcome({...p,id},token));emailStatus='sent';await env.COMMUNIVERSE_DB.prepare("UPDATE cv_members SET welcome_status='sent',welcome_message_id=? WHERE id=?").bind(sent.messageId||null,id).run();}catch(e){console.error('Communiverse welcome email failed',e.code||'email_unavailable');await env.COMMUNIVERSE_DB.prepare("UPDATE cv_members SET welcome_status='failed' WHERE id=?").bind(id).run();}
 return json({ok:true,profileUrl:'/communiverse/plug/?person=member-'+id,emailStatus,message:'Welcome, '+p.first_name+'. Your circle is ready.'},201);
}
export async function confirm(request,env){
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open the confirmation page.'},403);
 let b;try{const raw=await readBody(request,300);if(raw.length>300)throw Error();b=JSON.parse(raw);}catch{return json({error:'Invalid confirmation.'},400);}
 if(!/^[a-f0-9]{64}$/.test(b.token||''))return json({error:'This link is invalid or has expired.'},400);
 const value=await hash(b.token),now=new Date().toISOString(),remove=b.action==='remove';
 const p=await env.COMMUNIVERSE_DB.prepare(`UPDATE cv_members SET ${remove?"status='hidden'":"email_verified_at=?"},confirmation_hash='' WHERE confirmation_hash=? AND confirmation_expires_at>? RETURNING id`).bind(...(remove?[value,now]:[now,value,now])).first();
 return p?json({ok:true,message:remove?'This signup has been removed.':'Your email is confirmed. Welcome to Communiverse.'}):json({error:'This link has already been used or has expired.'},400);
}
export async function sessionRequest(request,env,artists){
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Open the session form on Communiverse.'},403);
 let b;try{const text=await readBody(request,4000);if(text.length>4000)throw Error();b=JSON.parse(text)}catch{return json({error:'Unable to read the request.'},400)}
 const artist=artists.find(a=>a.slug===b.artist),clean=v=>typeof v==='string'?v.trim():'';
 const name=clean(b.name),email=clean(b.email).toLowerCase(),phone=clean(b.phone),city=clean(b.city),date=clean(b.date),people=Number(b.people);
 if(b.website||!artist||b.craft!==artist.role||!name||name.length>60||!city||city.length>100||!/^\+?[\d\s().-]{7,30}$/.test(phone)||phone.replace(/\D/g,'').length<7||phone.replace(/\D/g,'').length>15||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||!Number.isInteger(people)||people<1||people>40||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date<new Date(Date.now()-86400000).toISOString().slice(0,10)||date>new Date(Date.now()+3*365*86400000).toISOString().slice(0,10)||!/^[\da-f-]{36}$/i.test(b.requestId||''))return json({error:'Check your craft, artisan, date and contact details.'},400);
 const bucket=await hash('cv-session:'+Math.floor(Date.now()/3600000)+':'+(request.headers.get('CF-Connecting-IP')||'local'));
 const limit=await env.COMMUNIVERSE_DB.prepare('INSERT INTO cv_join_limits(bucket,count,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,Date.now()+7200000).first();if(limit.count>6)return json({error:'Too many requests. Please try again in an hour.'},429);
 const id='session-'+await hash(b.requestId),message=JSON.stringify({version:2,intent:'group-session',artist:artist.slug,craft:artist.role,date,people,city,phone});
 await env.COMMUNIVERSE_DB.prepare("INSERT OR IGNORE INTO waitlist_submissions(id,name,email,subject,message,status) VALUES(?,?,?,?,?,'new')").bind(id,name,email,'Session request · '+artist.name,message).run();
 return json({ok:true,reference:id.slice(-12),message:'Your date request is saved. We’ll confirm the details with you.'},201);
}
