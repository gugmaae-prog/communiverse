import {body,json,limited} from './social-backend.js';
import {workspacePrincipal,project,task,targetAccess,admin} from './social-workspace.js';
import {CURRENCIES} from './social-booking.js';
import {studioArtistAccess} from './social-artist-workspace.js';

const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max+1):'';
const uuid=value=>typeof value==='string'&&/^[a-f0-9-]{36}$/.test(value);
const isStaff=p=>p.role!=='artist'&&p.kind!=='artist';
const rows=async(db,sql,...args)=>(await db.prepare(sql).bind(...args).all()).results;
const notify=(db,id,target,message)=>db.prepare('INSERT INTO cv_connect_notifications(id,identity_id,target,message) VALUES(?,?,?,?)').bind(crypto.randomUUID(),id,target,message);
const activity=(db,p,target,action,description='')=>db.prepare('INSERT INTO cv_workspace_activity(id,target,staff_id,action,description) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),target,p.id,action,description);

async function person(db,id,historical=false){
 const staff=await db.prepare("SELECT id,name,role,title,profile_slug FROM cv_staff WHERE id=? AND status='active'").bind(id).first();
 if(staff)return staff;
 if(historical&&await db.prepare('SELECT id FROM cv_staff WHERE id=?').bind(id).first())return {id,name:'Former member',role:'member',profile_slug:''};
 if(!/^member-[a-f0-9-]{36}$/.test(id))fail('Choose an active workspace member.');
 const member=await db.prepare("SELECT m.id,m.first_name name,m.craft title FROM cv_members m LEFT JOIN cv_member_preferences p ON p.member_id=m.id WHERE m.id=? AND m.status='active' AND m.email_verified_at IS NOT NULL AND (m.kind='artist' OR p.intent='artist' OR EXISTS(SELECT 1 FROM cv_artist_accounts a WHERE a.member_id=m.id))").bind(id.slice(7)).first();
 if(!member){if(historical)return{id,name:'Former member',role:'artist',profile_slug:''};fail('Choose an active workspace member.');}
 return {...member,id,role:'artist',profile_slug:id};
}
async function participants(db,list,p){
 const ids=[...new Set([p.id,...(Array.isArray(list)?list:[])])];
 if(ids.length<2||ids.length>20)fail('Choose between one and nineteen people.');
 for(const id of ids)await person(db,id);
 return ids;
}
async function thread(db,id,p){
 const t=await db.prepare('SELECT t.* FROM cv_connect_threads t JOIN cv_connect_participants p ON p.thread_id=t.id WHERE t.id=? AND p.identity_id=?').bind(id,p.id).first();
 if(!t)fail('This conversation is unavailable.',404);
 return t;
}
async function meeting(db,id,p){
 const m=await db.prepare('SELECT m.* FROM cv_connect_meetings m JOIN cv_connect_meeting_people p ON p.meeting_id=m.id WHERE m.id=? AND p.identity_id=?').bind(id,p.id).first();
 if(!m)fail('This meeting is unavailable.',404);
 return m;
}
async function access(db,target,p){
 if(await db.prepare('SELECT id FROM cv_connect_threads WHERE id=?').bind(target).first()){await thread(db,target,p);return 'conversation'}
 if(await db.prepare('SELECT id FROM cv_connect_meetings WHERE id=?').bind(target).first()){await meeting(db,target,p);return 'meeting'}
 // An artisan's own workspace media stays private until separately published.
 if(target.startsWith('artist:')){await studioArtistAccess(db,p,target.slice(7),'read');return 'artist'}
 if(!isStaff(p))fail('This item is unavailable.',404);
 await targetAccess(db,target,p);return 'workspace';
}
async function files(db,target){return (await rows(db,"SELECT id,target,uploader_id,name,content_type,bytes,checksum,tags,created_at FROM cv_connect_files WHERE target=? AND status='active' ORDER BY created_at DESC LIMIT 100",target)).map(f=>({...f,tags:JSON.parse(f.tags)}));}
async function threadDetail(db,t){
 const ps=await rows(db,'SELECT identity_id FROM cv_connect_participants WHERE thread_id=?',t.id);
 return {...t,participants:await Promise.all(ps.map(x=>person(db,x.identity_id,true)))};
}
async function meetingDetail(db,m){
 const ps=await rows(db,'SELECT identity_id,response,responded_at FROM cv_connect_meeting_people WHERE meeting_id=?',m.id);
 const delivery=await rows(db,'SELECT identity_id,kind,state,attempts,last_error FROM cv_connect_outbox WHERE meeting_id=? ORDER BY identity_id,kind',m.id);
 return {...m,participants:await Promise.all(ps.map(async x=>({...await person(db,x.identity_id,true),response:x.response,responded_at:x.responded_at}))),delivery};
}
async function contact(db,id){
 const c=await db.prepare('SELECT email FROM cv_identity_contacts WHERE identity_id=? AND email_verified=1').bind(id).first();
 if(c?.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))return c.email;
 if(/^member-[a-f0-9-]{36}$/.test(id)){const m=await db.prepare("SELECT email FROM cv_members WHERE id=? AND status='active' AND email_verified_at IS NOT NULL").bind(id.slice(7)).first();return m?.email||''}
 return '';
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icsText=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const icsDate=s=>new Date(s).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function calendar(m){return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Communiverse//Workspace//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+m.id+'@communiverse.espacios.me','DTSTAMP:'+icsDate(Date.now()),'DTSTART:'+icsDate(m.start_at),'DTEND:'+icsDate(m.end_at),'SUMMARY:'+icsText(m.title),'DESCRIPTION:'+icsText(m.note),'LOCATION:'+icsText(m.location),'STATUS:'+(m.status==='cancelled'?'CANCELLED':'CONFIRMED'),'URL:https://espacios.me/communiverse/workspace/?meeting='+m.id,'END:VEVENT','END:VCALENDAR',''].join('\r\n')}
const retryable=new Set(['E_RATE_LIMIT_EXCEEDED','E_DAILY_LIMIT_EXCEEDED','E_RECIPIENT_NOT_ALLOWED','E_SENDER_NOT_VERIFIED','E_SENDER_DOMAIN_NOT_AVAILABLE','E_VALIDATION_ERROR','E_FIELD_MISSING','E_RECIPIENT_SUPPRESSED']);
// A durable claim prevents duplicate emails from concurrent reads or retries.
// Unknown provider outcomes are held for review instead of blindly resending.
export async function flushMeetingEmails(env,meetingId){
 const db=env.COMMUNIVERSE_DB,m=await db.prepare('SELECT * FROM cv_connect_meetings WHERE id=?').bind(meetingId).first();if(!m)return;
 const jobs=await rows(db,"SELECT * FROM cv_connect_outbox WHERE meeting_id=? AND state IN ('pending','waiting-contact','failed') AND attempts<5 AND next_attempt_at<=?",meetingId,Date.now());
 for(const job of jobs){
  // Do not let a cancellation overtake this recipient's invitation at the
  // provider boundary. The invitation flush drains it after completing below.
  if(job.kind==='cancel'&&await db.prepare("SELECT id FROM cv_connect_outbox WHERE meeting_id=? AND identity_id=? AND kind='invite' AND state='sending'").bind(meetingId,job.identity_id).first())continue;
  if(job.kind==='invite'&&m.status==='cancelled'){await db.prepare("UPDATE cv_connect_outbox SET state='cancelled',updated_at=CURRENT_TIMESTAMP WHERE id=? AND state IN ('pending','waiting-contact','failed')").bind(job.id).run();continue}
  const email=await contact(db,job.identity_id);
  if(!email){await db.prepare("UPDATE cv_connect_outbox SET state='waiting-contact',last_error='Add an email in your workspace profile.',updated_at=CURRENT_TIMESTAMP WHERE id=? AND state IN ('pending','waiting-contact','failed')").bind(job.id).run();continue}
  const claim=await db.prepare("UPDATE cv_connect_outbox SET state='sending',attempts=attempts+1,last_error='',updated_at=CURRENT_TIMESTAMP WHERE id=? AND state IN ('pending','waiting-contact','failed') AND attempts<5 AND next_attempt_at<=?").bind(job.id,Date.now()).run();
  if(!claim.meta.changes)continue;
  try{
   const p=await person(db,job.identity_id),cancelled=job.kind==='cancel',subject=(cancelled?'Meeting cancelled: ':'Meeting invitation: ')+m.title;
   const when=new Intl.DateTimeFormat('en',{timeZone:m.timezone,dateStyle:'full',timeStyle:'short'}).format(new Date(m.start_at));
   const text=`Hi ${p.name},\n\n${cancelled?'This meeting has been cancelled.':'You are invited to a Communiverse meeting.'}\n\n${m.title}\n${when} (${m.timezone})\n${m.location||'Location to be agreed'}\n\n${m.note}\n\nOpen your workspace to ${cancelled?'see your calendar':'accept or decline'}: https://espacios.me/communiverse/workspace/?meeting=${m.id}`;
   const sent=await env.EMAIL.send({from:{email:'welcome@communiverse.espacios.me',name:'Communiverse'},to:email,subject,text,html:'<p>'+esc(text).replace(/\n/g,'<br>')+'</p>',attachments:[{filename:'communiverse-meeting.ics',content:new TextEncoder().encode(calendar(m)),type:'text/calendar',disposition:'attachment'}]});
   await db.prepare("UPDATE cv_connect_outbox SET state='accepted-by-provider',provider_id=?,last_error='',updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='sending'").bind(String(sent?.messageId||'').slice(0,200),job.id).run();
  }catch(e){
   const code=typeof e?.code==='string'?e.code:'unknown';
   await db.prepare("UPDATE cv_connect_outbox SET state=?,last_error=?,next_attempt_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='sending'").bind(retryable.has(code)?'failed':'delivery-unknown',retryable.has(code)?code:'Delivery could not be confirmed; review before resending.',Date.now()+Math.min(3600000,60000*2**job.attempts),job.id).run();
  }
 }
 const latest=await db.prepare('SELECT status FROM cv_connect_meetings WHERE id=?').bind(meetingId).first();
 if(m.status!=='cancelled'&&latest?.status==='cancelled')await flushMeetingEmails(env,meetingId);
}
async function enqueueEmails(db,m,ids,kind='invite'){return ids.map(id=>db.prepare('INSERT OR IGNORE INTO cv_connect_outbox(id,meeting_id,identity_id,kind) VALUES(?,?,?,?)').bind(crypto.randomUUID(),m,id,kind));}
function schedule(ctx,promise){if(ctx?.waitUntil)ctx.waitUntil(promise);return promise;}
function tags(v){const list=Array.isArray(v)?v:typeof v==='string'?v.split(','):[];return [...new Set(list.map(x=>clean(x,40).toLowerCase()).filter(x=>x&&x.length<=40))].slice(0,20)}
export function sniffFile(bytes,name){
 const text=new TextDecoder().decode(bytes.slice(0,64)),extension=name.toLowerCase().split('.').pop();
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';
 if(text.startsWith('RIFF')&&text.slice(8,12)==='WEBP')return 'image/webp';
 if(text.startsWith('%PDF-'))return 'application/pdf';
 if(text.slice(4,8)==='ftyp'&&['mp4','mov','m4v'].includes(extension))return extension==='mov'?'video/quicktime':'video/mp4';
 if(bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163&&extension==='webm')return 'video/webm';
 if(bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4){const mime={docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',zip:'application/zip'};if(mime[extension])return mime[extension]}
 if(['txt','csv','md'].includes(extension)&&!bytes.some(x=>x===0)){try{new TextDecoder('utf-8',{fatal:true}).decode(bytes);return extension==='csv'?'text/csv':'text/plain'}catch{}}
 return null;
}
async function upload(request,env,p,u){
 if(request.headers.get('Origin')!==u.origin)fail('Open the workspace upload form.',403);
 const db=env.COMMUNIVERSE_DB,target=clean(u.searchParams.get('target'),150),scope=await access(db,target,p),name=clean(u.searchParams.get('name'),180).replace(/[\/\\\u0000-\u001f]/g,'-');
 if(scope==='artist')await studioArtistAccess(db,p,target.slice(7),'write');
 if(!name||name.length>180)fail('Give the file a short name.');await limited(request,db,'connect-upload',40);
 const reader=request.body?.getReader();if(!reader)fail('Choose a file.');const chunks=[];let size=0;
 try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>32*1024*1024){await reader.cancel();fail('Use a video smaller than 32 MB.',413)}chunks.push(r.value)}}finally{reader.releaseLock()}
 if(!size)fail('Choose a file with content.');const bytes=new Uint8Array(size);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length}
 const contentType=sniffFile(bytes,name);if(!contentType)fail('Use a photo, MP4, MOV, WebM, PDF, Office document, ZIP, CSV or text file.',415);
 if(!contentType.startsWith('video/')&&size>20*1024*1024)fail('Use a document or photo smaller than 20 MB.',413);
 const checksum=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join(''),id=crypto.randomUUID(),key='workspace/connect/'+scope+'/'+target+'/'+id;
 const mediaKind=contentType.startsWith('video/')?'video':contentType.startsWith('image/')?'image':'document';
 const labels=[...new Set(['workspace',scope,mediaKind,...tags(u.searchParams.get('tags'))])].slice(0,20),createdAt=new Date().toISOString();
 await env.COMMUNIVERSE_MEDIA.put(key,bytes,{httpMetadata:{contentType},customMetadata:{id,target,uploader:p.id,scope,visibility:'workspace',checksum,tags:JSON.stringify(labels),name,createdAt}});
 try{await db.batch([db.prepare('INSERT INTO cv_connect_files(id,target,uploader_id,name,key,content_type,bytes,checksum,tags) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,target,p.id,name,key,contentType,size,checksum,JSON.stringify(labels)),activity(db,p,target,'file-uploaded',name)])}catch(e){await env.COMMUNIVERSE_MEDIA.delete(key);throw e}
 return json({ok:true,id,name,bytes:size,content_type:contentType,tags:labels,checksum},201);
}

export async function collaborationAPI(request,env,ctx){
 const u=new URL(request.url),prefix='/communiverse/api/workspace/connect/';if(!u.pathname.startsWith(prefix))return null;
 const endpoint=u.pathname.slice(prefix.length).replace(/\/$/,''),db=env.COMMUNIVERSE_DB;
 try{
  const p=await workspacePrincipal(request,env);if(!p)fail('Sign in to your workspace.',401);
  const read=['GET','HEAD'].includes(request.method);
  if(endpoint==='directory'&&read){
   const staff=await rows(db,"SELECT id,name,role,title,profile_slug FROM cv_staff WHERE status='active' ORDER BY name");
   const artists=await rows(db,"SELECT 'member-'||m.id id,m.first_name name,'artist' role,m.craft title,'member-'||m.id profile_slug FROM cv_members m LEFT JOIN cv_member_preferences p ON p.member_id=m.id WHERE m.status='active' AND m.email_verified_at IS NOT NULL AND (m.kind='artist' OR p.intent='artist' OR EXISTS(SELECT 1 FROM cv_artist_accounts a WHERE a.member_id=m.id)) ORDER BY m.first_name LIMIT 500");
   const confirmed=new Set((await rows(db,"SELECT identity_id FROM cv_identity_contacts WHERE email_verified=1 AND email<>''")).map(c=>c.identity_id));
   const members=new Set(artists.map(a=>a.id));
   return json({people:[...staff,...artists].map(q=>({...q,photo_url:'/communiverse/_public/avatar/'+encodeURIComponent(q.profile_slug||q.id),contactReady:confirmed.has(q.id)||members.has(q.id)}))});
  }
  if(endpoint==='notifications'&&read)return json({notifications:await rows(db,'SELECT id,target,message,created_at FROM cv_connect_notifications WHERE identity_id=? AND read_at IS NULL ORDER BY created_at DESC LIMIT 50',p.id)});
  if(endpoint==='notifications/read'&&request.method==='POST'){await body(request,100);await db.prepare('UPDATE cv_connect_notifications SET read_at=CURRENT_TIMESTAMP WHERE identity_id=? AND read_at IS NULL').bind(p.id).run();return json({ok:true})}
  if(endpoint==='threads'&&read){
   if(u.searchParams.get('id')){const t=await thread(db,u.searchParams.get('id'),p),messages=await rows(db,'SELECT id,thread_id,sender_id,body,reply_to,created_at FROM cv_connect_messages WHERE thread_id=? ORDER BY rowid DESC LIMIT 200',t.id),detail=await threadDetail(db,t);return json({thread:detail,participants:detail.participants,messages:messages.reverse(),files:await files(db,t.id)})}
   const list=await rows(db,"SELECT t.*,(SELECT body FROM cv_connect_messages m WHERE m.thread_id=t.id ORDER BY rowid DESC LIMIT 1) last_message,(SELECT count(*) FROM cv_connect_messages m WHERE m.thread_id=t.id AND m.sender_id<>? AND m.rowid>p.last_read_sequence) unread FROM cv_connect_threads t JOIN cv_connect_participants p ON p.thread_id=t.id WHERE p.identity_id=? ORDER BY t.updated_at DESC LIMIT 100",p.id,p.id);
   return json({threads:await Promise.all(list.map(t=>threadDetail(db,t)))});
  }
  if(endpoint==='threads'&&request.method==='POST'){
   const b=await body(request,6000);await limited(request,db,'connect-thread',40);const title=clean(b.title,120),text=clean(b.body,3000);if(!title||title.length>120||!text||text.length>3000||!uuid(b.requestId))fail('Add a conversation name and message.');
   const old=await db.prepare('SELECT id,created_by FROM cv_connect_threads WHERE request_key=?').bind(b.requestId).first();if(old){if(old.created_by!==p.id)fail('Refresh the form.',409);await thread(db,old.id,p);return json({ok:true,id:old.id},200)}
   const ids=await participants(db,b.participants,p),id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO cv_connect_threads(id,title,created_by,request_key) VALUES(?,?,?,?)').bind(id,title,p.id,b.requestId),...ids.map(x=>db.prepare('INSERT INTO cv_connect_participants(thread_id,identity_id) VALUES(?,?)').bind(id,x)),db.prepare('INSERT INTO cv_connect_messages(id,thread_id,sender_id,body,request_key) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),id,p.id,text,b.requestId),...ids.filter(x=>x!==p.id).map(x=>notify(db,x,id,p.name+' started a conversation.'))]);return json({ok:true,id},201);
  }
  if(endpoint==='threads/read'&&request.method==='POST'){const b=await body(request,500);await thread(db,b.id,p);await db.prepare('UPDATE cv_connect_participants SET last_read_at=CURRENT_TIMESTAMP,last_read_sequence=(SELECT COALESCE(MAX(rowid),0) FROM cv_connect_messages WHERE thread_id=?) WHERE thread_id=? AND identity_id=?').bind(b.id,b.id,p.id).run();return json({ok:true})}
  if(endpoint==='messages'&&request.method==='POST'){
   const b=await body(request,6000),t=await thread(db,b.thread_id,p),text=clean(b.body,3000);await limited(request,db,'connect-message',180);if(!text||text.length>3000||!uuid(b.requestId))fail('Add a message.');
   const old=await db.prepare('SELECT id,sender_id,thread_id FROM cv_connect_messages WHERE request_key=?').bind(b.requestId).first();if(old){if(old.sender_id!==p.id||old.thread_id!==t.id)fail('Refresh the form.',409);return json({ok:true,id:old.id})}
   if(b.reply_to&&!await db.prepare('SELECT id FROM cv_connect_messages WHERE id=? AND thread_id=?').bind(b.reply_to,t.id).first())fail('Reply to a message in this conversation.');
   const ps=await rows(db,'SELECT identity_id FROM cv_connect_participants WHERE thread_id=?',t.id),id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO cv_connect_messages(id,thread_id,sender_id,body,reply_to,request_key) VALUES(?,?,?,?,?,?)').bind(id,t.id,p.id,text,b.reply_to||null,b.requestId),db.prepare('UPDATE cv_connect_threads SET updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(t.id),...ps.filter(x=>x.identity_id!==p.id).map(x=>notify(db,x.identity_id,t.id,p.name+' sent a message.'))]);return json({ok:true,id},201);
  }
  if(endpoint==='meetings'&&read){const list=u.searchParams.get('id')?[await meeting(db,u.searchParams.get('id'),p)]:await rows(db,'SELECT m.* FROM cv_connect_meetings m JOIN cv_connect_meeting_people p ON p.meeting_id=m.id WHERE p.identity_id=? ORDER BY m.start_at DESC LIMIT 100',p.id);return json({meetings:await Promise.all(list.map(m=>meetingDetail(db,m)))})}
  if(endpoint==='meetings/calendar'&&read){const m=await meeting(db,u.searchParams.get('id'),p);return new Response(request.method==='HEAD'?null:calendar(m),{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'attachment; filename="communiverse-meeting.ics"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
  if(endpoint==='meetings'&&request.method==='POST'){
   const b=await body(request,6000);await limited(request,db,'connect-meeting',20);const title=clean(b.title,140),note=clean(b.note,2000),location=clean(b.location,180),timezone=clean(b.timezone,80)||'UTC',start=Date.parse(b.start_at),end=Date.parse(b.end_at);
   try{new Intl.DateTimeFormat('en',{timeZone:timezone})}catch{fail('Choose a valid time zone.')}
   if(!title||title.length>140||note.length>2000||location.length>180||!Number.isFinite(start)||!Number.isFinite(end)||start<=Date.now()||end<=start||end-start>24*3600000||!uuid(b.requestId))fail('Check the meeting name, date and duration.');
   const old=await db.prepare('SELECT id,created_by FROM cv_connect_meetings WHERE request_key=?').bind(b.requestId).first();if(old){if(old.created_by!==p.id)fail('Refresh the form.',409);await meeting(db,old.id,p);return json({ok:true,id:old.id})}
   const ids=await participants(db,b.participants,p),id=crypto.randomUUID();
   await db.batch([db.prepare('INSERT INTO cv_connect_meetings(id,title,created_by,start_at,end_at,timezone,location,note,request_key) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,title,p.id,new Date(start).toISOString(),new Date(end).toISOString(),timezone,location,note,b.requestId),...ids.map(x=>db.prepare('INSERT INTO cv_connect_meeting_people(meeting_id,identity_id,response) VALUES(?,?,?)').bind(id,x,x===p.id?'accepted':'invited')),...await enqueueEmails(db,id,ids),...ids.filter(x=>x!==p.id).map(x=>notify(db,x,id,p.name+' invited you to '+title))]);
   if(ctx?.waitUntil)schedule(ctx,flushMeetingEmails(env,id));else await flushMeetingEmails(env,id);return json({ok:true,id,meeting:await meetingDetail(db,await meeting(db,id,p))},201);
  }
  if(endpoint==='meetings/respond'&&request.method==='POST'){const b=await body(request,1000),m=await meeting(db,b.id,p);if(m.status!=='scheduled'||!['accepted','declined'].includes(b.response))fail('Choose an active meeting and response.');await db.batch([db.prepare('UPDATE cv_connect_meeting_people SET response=?,responded_at=CURRENT_TIMESTAMP WHERE meeting_id=? AND identity_id=?').bind(b.response,m.id,p.id),notify(db,m.created_by,m.id,p.name+' '+b.response+' the meeting.')]);return json({ok:true})}
  if(endpoint==='meetings/cancel'&&request.method==='POST'){const b=await body(request,500),m=await meeting(db,b.id,p);if(m.created_by!==p.id)fail('Only the meeting organizer can cancel it.',403);if(m.status==='cancelled')return json({ok:true});const ids=(await rows(db,'SELECT identity_id FROM cv_connect_meeting_people WHERE meeting_id=?',m.id)).map(x=>x.identity_id);await db.batch([db.prepare("UPDATE cv_connect_meetings SET status='cancelled' WHERE id=?").bind(m.id),db.prepare("UPDATE cv_connect_outbox SET state='cancelled' WHERE meeting_id=? AND kind='invite' AND state IN ('pending','waiting-contact','failed')").bind(m.id),...await enqueueEmails(db,m.id,ids,'cancel'),...ids.filter(x=>x!==p.id).map(x=>notify(db,x,m.id,p.name+' cancelled '+m.title))]);if(ctx?.waitUntil)schedule(ctx,flushMeetingEmails(env,m.id));else await flushMeetingEmails(env,m.id);return json({ok:true})}
  if(endpoint==='meetings/retry'&&request.method==='POST'){const b=await body(request,500),m=await meeting(db,b.id,p);if(m.created_by!==p.id)fail('Only the organizer can retry invitations.',403);await flushMeetingEmails(env,m.id);return json({ok:true,meeting:await meetingDetail(db,m)})}
  if(endpoint==='files'&&request.method==='POST')return await upload(request,env,p,u);
  if(endpoint==='files'&&read){const target=clean(u.searchParams.get('target'),150);await access(db,target,p);return json({files:await files(db,target)})}
  if(endpoint==='files/remove'&&request.method==='POST'){const b=await body(request,500),f=await db.prepare("SELECT * FROM cv_connect_files WHERE id=? AND status='active'").bind(b.id).first();if(!f)fail('This file is unavailable.',404);await access(db,f.target,p);if(f.uploader_id!==p.id)fail('Only the uploader can hide this file.',403);await db.batch([db.prepare("UPDATE cv_connect_files SET status='hidden' WHERE id=?").bind(f.id),db.prepare("UPDATE cv_studio_public_work SET status='hidden' WHERE file_id=?").bind(f.id),db.prepare('DELETE FROM cv_catalog WHERE id IN (SELECT id FROM cv_studio_public_work WHERE file_id=?)').bind(f.id)]);return json({ok:true})}
  if(endpoint==='files/file'&&read){const f=await db.prepare("SELECT * FROM cv_connect_files WHERE id=? AND status='active'").bind(u.searchParams.get('id')).first();if(!f)fail('This file is unavailable.',404);await access(db,f.target,p);const object=request.method==='HEAD'?await env.COMMUNIVERSE_MEDIA.head(f.key):await env.COMMUNIVERSE_MEDIA.get(f.key,{range:request.headers});if(!object)fail('This file is unavailable.',404);const headers=new Headers({'Content-Type':f.content_type,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(f.name),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Accept-Ranges':'bytes'});if(object.range){headers.set('Content-Range',`bytes ${object.range.offset}-${object.range.offset+object.range.length-1}/${object.size}`);headers.set('Content-Length',object.range.length)}else headers.set('Content-Length',object.size);return new Response(request.method==='HEAD'?null:object.body,{status:object.range?206:200,headers})}
  if(endpoint==='comments'&&request.method==='POST'){
   if(!isStaff(p))fail('Task discussions belong to the project team.',403);const b=await body(request,6000);await targetAccess(db,b.target,p);await limited(request,db,'connect-comment',120);const text=clean(b.body,2000),mentions=[...new Set(Array.isArray(b.mentions)?b.mentions:[])];if(!text||text.length>2000||mentions.length>20||!uuid(b.requestId))fail('Add a short update.');
   for(const id of mentions){const member=await person(db,id);if(!isStaff(member))fail('Tag a member of this project.');await targetAccess(db,b.target,member)}
   const old=await db.prepare('SELECT id,staff_id,target FROM cv_workspace_comments WHERE request_key=?').bind(b.requestId).first();if(old){if(old.staff_id!==p.id||old.target!==b.target)fail('Refresh the form.',409);return json({ok:true,id:old.id})}
   const id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO cv_workspace_comments(id,target,staff_id,body,request_key) VALUES(?,?,?,?,?)').bind(id,b.target,p.id,text,b.requestId),...mentions.map(x=>db.prepare('INSERT INTO cv_connect_comment_mentions(comment_id,identity_id) VALUES(?,?)').bind(id,x)),...mentions.filter(x=>x!==p.id).map(x=>notify(db,x,b.target,p.name+' mentioned you in a task discussion.')),activity(db,p,b.target,'comment-added',text.slice(0,120))]);return json({ok:true,id},201);
  }
  if(endpoint==='task-join'&&read){if(!isStaff(p))fail('Task participation belongs to the project team.',403);const t=await task(db,u.searchParams.get('task_id'),p);return json({requests:await rows(db,'SELECT * FROM cv_connect_task_join WHERE task_id=? ORDER BY created_at DESC LIMIT 100',t.id),members:await rows(db,'SELECT identity_id,approved_by,created_at FROM cv_connect_task_members WHERE task_id=?',t.id)})}
  if(endpoint==='task-join'&&request.method==='POST'){if(!isStaff(p))fail('Task participation belongs to the project team.',403);const b=await body(request,1500),t=await task(db,b.task_id,p),note=clean(b.note,800);await limited(request,db,'connect-task-join',30);if(note.length>800||!uuid(b.requestId))fail('Add a short participation note.');const retry=await db.prepare('SELECT id,identity_id,task_id FROM cv_connect_task_join WHERE request_key=?').bind(b.requestId).first();if(retry){if(retry.identity_id!==p.id||retry.task_id!==t.id)fail('Refresh the form.',409);return json({ok:true,id:retry.id})}const old=await db.prepare("SELECT id FROM cv_connect_task_join WHERE task_id=? AND identity_id=? AND status='pending'").bind(t.id,p.id).first();if(old)return json({ok:true,id:old.id});const pr=await project(db,t.project_id,p),id=crypto.randomUUID();await db.batch([db.prepare('INSERT INTO cv_connect_task_join(id,task_id,identity_id,note,request_key) VALUES(?,?,?,?,?)').bind(id,t.id,p.id,note,b.requestId),notify(db,t.owner_id,t.id,p.name+' asked to join '+t.title),...(pr.owner_id!==t.owner_id?[notify(db,pr.owner_id,t.id,p.name+' asked to join '+t.title)]:[])]);return json({ok:true,id},201)}
  if(endpoint==='task-join/action'&&request.method==='POST'){if(!isStaff(p))fail('Task participation belongs to the project team.',403);const b=await body(request,1500),r=await db.prepare('SELECT * FROM cv_connect_task_join WHERE id=?').bind(b.id).first();if(!r)fail('This participation request is unavailable.',404);const t=await task(db,r.task_id,p),pr=await project(db,t.project_id,p),note=clean(b.note,800);if(!admin(p)&&![t.owner_id,pr.owner_id].includes(p.id))fail('The task owner or project lead reviews participation.',403);if(!['approve','reject'].includes(b.action)||note.length>800)fail('Choose an approval action.');if(r.status!=='pending')return json({ok:true,status:r.status});await targetAccess(db,t.id,await person(db,r.identity_id));await db.batch([db.prepare("UPDATE cv_connect_task_join SET status=?,decision_by=?,decision_note=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").bind(b.action==='approve'?'approved':'rejected',p.id,note,r.id),...(b.action==='approve'?[db.prepare("INSERT OR IGNORE INTO cv_connect_task_members(task_id,identity_id,approved_by) SELECT task_id,identity_id,decision_by FROM cv_connect_task_join WHERE id=? AND status='approved'").bind(r.id)]:[]),notify(db,r.identity_id,t.id,p.name+' '+(b.action==='approve'?'approved':'declined')+' your participation request.')]);return json({ok:true,status:(await db.prepare('SELECT status FROM cv_connect_task_join WHERE id=?').bind(r.id).first()).status})}
  if(endpoint==='resources'&&read){if(!isStaff(p))fail('Team resources belong to the team workspace.',403);const all=await rows(db,'SELECT r.*,s.kind resource_kind,s.platform,s.category,s.url,s.renewal_date,s.asset_status,s.assigned_to,s.serial FROM cv_connect_resources s JOIN cv_team_requests r ON r.id=s.request_id ORDER BY r.updated_at DESC LIMIT 500');const visible=[];for(const r of all){try{await targetAccess(db,r.id,p);visible.push({...r,request_id:r.id})}catch(e){if(e.status!==404)throw e}}return json({resources:visible,requests:visible})}
  if(endpoint==='resources'&&request.method==='POST'){
   if(!isStaff(p))fail('Team resources belong to the team workspace.',403);const b=await body(request,6000),title=clean(b.title,140),text=clean(b.body,2500),kind=b.kind,platform=clean(b.platform,100),category=clean(b.category,80),url=clean(b.url,500),renewal=clean(b.renewal_date,10),currency=clean(b.currency,3)||'AED',amount=b.amount==null||b.amount===''?null:Number(b.amount);
   await limited(request,db,'connect-resource',30);if(!title||title.length>140||!text||text.length>2500||!['asset','subscription'].includes(kind)||platform.length>100||kind==='subscription'&&!platform||category.length>80||url&&(!/^https:\/\//.test(url)||url.length>500)||renewal&&(!/^\d{4}-\d{2}-\d{2}$/.test(renewal)||!Number.isFinite(Date.parse(renewal)))||amount!==null&&(!Number.isFinite(amount)||amount<0||amount>100000000)||!CURRENCIES.includes(currency)||!uuid(b.requestId))fail('Check the request and associated platform.');
   const old=await db.prepare('SELECT id,created_by FROM cv_team_requests WHERE request_key=?').bind(b.requestId).first();if(old){if(old.created_by!==p.id)fail('Refresh the form.',409);await targetAccess(db,old.id,p);return json({ok:true,id:old.id})}
   const id=crypto.randomUUID(),reviewer=p.role==='ambassador'?'keiffer':'haseeb',stage=reviewer==='keiffer'?'keiffer':'approval';await db.batch([db.prepare('INSERT INTO cv_team_requests(id,request_key,created_by,title,body,kind,stage,reviewer_id,amount,currency) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,b.requestId,p.id,title,text,kind,stage,reviewer,amount,currency),db.prepare('INSERT INTO cv_connect_resources(request_id,kind,platform,category,url,renewal_date,assigned_to) VALUES(?,?,?,?,?,?,?)').bind(id,kind,platform,category,url,renewal,p.id),notify(db,reviewer,id,p.name+' requested '+title),notify(db,'elferah',id,'A '+kind+' request is waiting for approval.'),activity(db,p,id,'resource-requested',title)]);return json({ok:true,id},201);
  }
  if(endpoint==='resources/update'&&request.method==='POST'){
   if(p.role!=='operations')fail('Elferah records approved resources.',403);const b=await body(request,2000),r=await db.prepare('SELECT r.*,s.kind resource_kind FROM cv_team_requests r JOIN cv_connect_resources s ON s.request_id=r.id WHERE r.id=?').bind(b.id).first();if(!r)fail('This resource is unavailable.',404);if(!['approved','done'].includes(r.stage))fail('Haseeb approves the request before execution.',403);const state=b.asset_status,assigned=clean(b.assigned_to,100)||r.created_by,serial=clean(b.serial,120);if(!['ordered','active','paused','returned','retired'].includes(state)||serial.length>120)fail('Choose a resource state.');await person(db,assigned);await db.batch([db.prepare('UPDATE cv_connect_resources SET asset_status=?,assigned_to=?,serial=?,updated_at=CURRENT_TIMESTAMP WHERE request_id=?').bind(state,assigned,serial,r.id),activity(db,p,r.id,'resource-recorded',state),notify(db,assigned,r.id,'Operations recorded '+r.title+': '+state)]);return json({ok:true})
  }
  return json({error:'Not found'},404);
 }catch(e){
  if(String(e?.message).includes('CV_MEETING_CONFLICT'))return json({error:'A participant already has a meeting at that time. Choose another time.'},409);
  if(!e.status)console.error('Communiverse collaboration unavailable',e.code||'service');
  return json({error:e.status?e.message:'Unable to complete this right now. Please try again.'},e.status||503);
 }
}
