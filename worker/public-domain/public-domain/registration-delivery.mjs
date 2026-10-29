import {DurableObject} from 'cloudflare:workers';
const notificationRecipients=env=>String(env.CV_NOTIFICATION_RECIPIENTS||'').split(',').map(v=>v.trim()).filter(v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
const retention=90*86400000;
// One object per registration: retries and receipts cannot race across visitors.
export class RegistrationDelivery extends DurableObject {
 async consumeForm(action,now){
  if(!['enquiry','rsvp','report','club','registration','signin','csp'].includes(action)||!Number.isFinite(now)||Math.abs(Date.now()-now)>10000)throw Error('Invalid limiter request');
  return this.ctx.storage.transaction(async tx=>{if(await tx.get('job'))throw Error('Notification object cannot be used for rate limits');const old=await tx.get('abuse'),hits=(old?.hits||[]).filter(at=>at>now-600000);if(old&&old.action!==action)throw Error('Invalid limiter action');if(hits.length>=5)return {allowed:false};hits.push(now);await tx.put('abuse',{action,hits});await tx.setAlarm(now+600000);return {allowed:true};});
 }
 async enqueue(message){
  if(await this.ctx.storage.get('abuse'))throw Error('Rate-limit object cannot enqueue notifications');
  if(message?.from?.email!=='welcome@communiverse.espacios.me'||typeof message.subject!=='string'||typeof message.text!=='string'||message.subject.length>160||message.text.length>5000)throw Error('Invalid registration notification');
  const fingerprint=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(message)))),v=>v.toString(16).padStart(2,'0')).join('');
  const existing=await this.ctx.storage.transaction(async tx=>{const old=await tx.get('job');if(old){if(old.fingerprint!==fingerprint)throw Error('Submission reference has already been used.');return old;}const job={message,fingerprint,createdAt:Date.now(),attempts:0,receipts:{}};await tx.put('job',job);return job;});
  if(!existing.completedAt&&!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(Date.now()+1000);
  return {queued:true,completed:!!existing.completedAt};
 }
 async status(){const job=await this.ctx.storage.get('job');return job?{attempts:job.attempts,completed:!!job.completedAt,receipts:job.receipts,next:await this.ctx.storage.getAlarm()}:{missing:true};}
 async alarm(){const abuse=await this.ctx.storage.get('abuse');if(abuse){const last=abuse.hits.at(-1)||0;if(Date.now()>=last+600000)await this.ctx.storage.deleteAll();else await this.ctx.storage.setAlarm(last+600000);return;}const job=await this.ctx.storage.get('job');if(!job)return;
  if(Date.now()-job.createdAt>=retention){await this.ctx.storage.deleteAll();return;}
  if(job.completedAt){await this.ctx.storage.setAlarm(job.createdAt+retention);return;}
  let failed=false;job.attempts++;
  for(const to of notificationRecipients(this.env)){if(job.receipts[to])continue;try{const sent=await this.env.REGISTRATION_EMAIL.send({...job.message,to});job.receipts[to]={messageId:sent.messageId||'',at:new Date().toISOString()};await this.ctx.storage.put('job',job);}catch(e){failed=true;console.error('Registration alert retry',e.name);}}
  if(!notificationRecipients(this.env).length)failed=true;
  if(!failed){job.completedAt=Date.now();job.message=null;await this.ctx.storage.put('job',job);await this.ctx.storage.setAlarm(job.createdAt+retention);}
  else{await this.ctx.storage.put('job',job);await this.ctx.storage.setAlarm(Date.now()+Math.min(86400000,60000*2**Math.min(job.attempts-1,10)));}
 }
}
export default {fetch(){return new Response('Not found',{status:404});}};
