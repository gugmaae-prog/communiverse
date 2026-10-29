import {body,json} from './read-feed-social-backend.js';
const sessions=[['__Host-cv-account','cv_account_sessions'],['__Host-cv-session','cv_sessions'],['__Host-cv-workspace','cv_staff_sessions']];
export const logoutPaths=new Set(['account','auth','workspace'].map(p=>'/communiverse/api/'+p+'/logout'));
async function revoke(db,request){
 const cookie=request.headers.get('cookie')||'';
 const results=await Promise.allSettled(sessions.map(async([name,table])=>{
  const token=cookie.match(new RegExp('(?:^|;\\s*)'+name+'=([a-f0-9]{64})(?:;|$)'))?.[1];
  if(!token)return;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  await db.prepare('DELETE FROM '+table+' WHERE hash=?').bind(hash).run();
 }));
 if(results.some(r=>r.status==='rejected'))console.warn('Communiverse logout: browser cookies cleared; session record cleanup unavailable.');
}
export async function logout(request,env,ctx){
 if(request.method!=='POST')return json({error:'Use the Sign out button.'},405,{Allow:'POST'});
 try{await body(request,100)}catch(e){return json({error:e.status?e.message:'Unable to read the request.'},e.status||400)}
 // Local sign-out must succeed even when D1 is unavailable. Cleanup is best effort,
 // limited to the current tokens; this is not an all-device revocation endpoint.
 const cleanup=revoke(env.COMMUNIVERSE_DB,request);if(ctx?.waitUntil)ctx.waitUntil(cleanup);else await cleanup;
 const response=json({ok:true,scope:'browser'});
 for(const[name]of sessions)response.headers.append('Set-Cookie',name+'=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
 return response;
}
