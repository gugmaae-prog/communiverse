import retained from './avatar-circles-gateway.mjs';
import LOGO from './avid-transparent-logo.png';
import CSS from './events-editorial.css';
import CLIENT from './editorial-events-client.txt';
import CARD from './editorial-past-card.html';
const ROOT='/communiverse/', BASE=ROOT+'_events/editorial-20261022-v3/', RELEASE='events-editorial-20261022-v3';
const assets=new Map([['avid-logo.png',[LOGO,'image/png']],['editorial.css',[CSS,'text/css; charset=utf-8']],['events.js',[CLIENT,'text/javascript; charset=utf-8']]]);
const prose=`<p>On 17 October, <strong>Quiet Awakenings</strong> brought four poets to the Avid Centre for Culture and Creative Expressions in Al Quoz. Hosted by Avid Learning Middle East, the evening featured <strong>Adel Awad, Tasveer Maharaj, Arpita John and Andrew Riad</strong>.</p><p>The photographs show poetry moving from the printed page into the room: a reader gesturing with a sheet in hand, listeners gathered nearby, and conversations framed by the gallery’s artworks.</p><p>Keiffer and Luna attended with the Communiverse circle. Between the readings, there was time to look at the work on the walls and gather for photographs—a record of the people around the poems as much as the performances themselves.</p>`;
export function editorialEvent(event){
 if(!event)return event;
 let result={...event};
 // The retained API labels past records with today's displayDate. Keep the real event date.
 if(event.state==='past'||event.bucket==='past')result.displayDate=event.start||event.end||event.displayDate;
 if(event.id==='event-wakos-ceramic-ties-2026'&&event.end<new Date().toISOString().slice(0,10))result.description=String(event.description||'').replace(/\s*Luna will be attending\./,'').replace('Opening Tuesday,','Opened Tuesday,').replace('The opening includes','The opening programme included');
 return result;
}
export default {async fetch(request,env,ctx){
 const u=new URL(request.url),path=u.pathname,read=['GET','HEAD'].includes(request.method),asset=path.startsWith(BASE)&&assets.get(path.slice(BASE.length));
 if(read&&asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1],'cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','x-communiverse-editorial':RELEASE}});
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||!response.ok)return response;
 const headers=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);
 if([ROOT+'api/events',ROOT+'api/event'].includes(path)&&response.headers.get('content-type')?.includes('application/json')){
  const data=await response.json();if(Array.isArray(data.events))data.events=data.events.map(editorialEvent);if(data.event)data.event=editorialEvent(data.event);headers.set('cache-control','no-store');headers.set('x-communiverse-editorial',RELEASE);return Response.json(data,{status:response.status,headers});
 }
 const blog=path===ROOT+'events/avid-learning-poetry-night/',events=path===ROOT+'events/',discovery=[ROOT,ROOT+'discover/'].includes(path);
 if((!blog&&!events&&!discovery)||!response.headers.get('content-type')?.includes('text/html'))return response;
 headers.set('cache-control','no-store');headers.set('x-communiverse-editorial',RELEASE);
 let rewrite=new HTMLRewriter().on('head',{element(e){e.append(`<link rel="stylesheet" href="${BASE}editorial.css">`,{html:true})}});
 if(blog)rewrite=rewrite
 .on('.avid-host img',{element(e){e.setAttribute('src',BASE+'avid-logo.png');e.setAttribute('width','450');e.setAttribute('height','408')}})
 .on('.avid-eyebrow',{element(e){e.setInnerContent('Culture · <time datetime="2026-10-17">17 October 2026</time>',{html:true})}})
 .on('.avid-prose',{element(e){e.setInnerContent(prose,{html:true})}})
 .on('.avid-gallery-heading',{element(e){e.setInnerContent('The evening in photographs')}})
 .on('.avid-story-footer>p:not([role])',{element(e){e.setInnerContent('More from Communiverse')}})
 .on('.avid-back,.avid-footer>a[href="/communiverse/events/"]',{element(e){e.setAttribute('href',ROOT+'events/?state=past');e.setInnerContent('← Past events')}});
 if(events)rewrite=rewrite
 .on('.cv-wetex-feature,.cv-avid-recent',{element(e){e.remove()}})
 .on('#cv-events',{element(e){e.before(CARD,{html:true})}})
 .on('[data-event-state="past"]',{element(e){e.setInnerContent('Past events')}})
 .on('script[src]',{element(e){if((e.getAttribute('src')||'').split('?')[0]===ROOT+'_brand/20261020-v21/clubs.js')e.setAttribute('src',BASE+'events.js')}});
 if(discovery&&new Date().toISOString().slice(0,10)>'2026-10-21')rewrite=rewrite
 .on('.cv-wetex-feature .cv-wetex-label',{element(e){e.setInnerContent('Past exhibition · Communiverse × NOA')}});
 return rewrite.transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
