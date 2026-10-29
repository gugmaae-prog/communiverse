// Promotion eligibility uses the event's own end time, or the end of its local calendar day.
export function eventDay(at=new Date(),zone='Asia/Dubai'){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(at);
 return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
}
export function isEventComplete(event,at=new Date()){
 if(!event||event.kind==='venue')return false;
 if(event.endAt){const end=Date.parse(event.endAt);if(Number.isFinite(end))return +at>=end}
 const end=event.end||event.expiresOn||event.start;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(end||''))return false;
 try{return eventDay(at,event.timezone||'Asia/Dubai')>end}catch{return eventDay(at)>end}
}
export function showEventPromotion(event,at=new Date()){
 const day=event?.end||event?.expiresOn||event?.start;
 const dateValid=/^\d{4}-\d{2}-\d{2}$/.test(day||'')&&Number.isFinite(Date.parse(day+'T00:00:00Z'));
 const timeValid=!!event?.endAt&&Number.isFinite(Date.parse(event.endAt));
 return event?.kind!=='venue'&&(timeValid||dateValid)&&!isEventComplete(event,at);
}
