import retained from './events-editorial-gateway.mjs';
import {dubaiEvents} from './dubai-events.mjs';
import TOOLS from './natural-browsing-tools.txt';
import EVENTS from './dubai-events-client.txt';
const ROOT='/communiverse/',RELEASE='dubai-scroll-20261022-v1',BASE=ROOT+'_browse/'+RELEASE+'/';
const assets=new Map([['tools.js',TOOLS],['events.js',EVENTS]]);
export default {async fetch(request,env,ctx){
 const u=new URL(request.url),path=u.pathname,read=['GET','HEAD'].includes(request.method),asset=path.startsWith(BASE)&&assets.get(path.slice(BASE.length));
 if(read&&asset)return new Response(request.method==='HEAD'?null:asset,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','x-communiverse-browse':RELEASE}});
 if(request.method==='GET'&&path===ROOT+'api/events'){
  try{const response=await dubaiEvents(request,r=>retained.fetch(r,env,ctx));const headers=new Headers(response.headers);headers.set('x-communiverse-browse',RELEASE);return new Response(response.body,{status:response.status,headers})}
  catch(error){console.error('Dubai event list unavailable:',error.message);return Response.json({error:'Events could not be loaded. Please try again.'},{status:502,headers:{'cache-control':'no-store','x-communiverse-browse':RELEASE}})}
 }
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||!response.ok||!path.startsWith(ROOT)||!response.headers.get('content-type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);headers.set('cache-control','no-store');headers.set('x-communiverse-browse',RELEASE);
 const events=path===ROOT+'events/';
 let rewrite=new HTMLRewriter().on('script[src]',{element(e){const src=(e.getAttribute('src')||'').split('?')[0];if(src===ROOT+'_public/20261013-cosmos-tools.js')e.setAttribute('src',BASE+'tools.js');if(events&&src===ROOT+'_events/editorial-20261022-v3/events.js')e.setAttribute('src',BASE+'events.js')}});
 if(events)rewrite=rewrite
 .on('head',{element(e){e.append('<style data-cv-dubai-filters>html[data-cv-social] .cv-social #cv-events-filters.cv4-toolbar{grid-template-columns:minmax(0,1fr) minmax(160px,210px)!important;gap:12px 16px!important}html[data-cv-social] .cv-social #cv-events-filters.cv4-toolbar>.cv-feed-search{grid-column:1!important;grid-row:1!important}html[data-cv-social] .cv-social #cv-events-filters.cv4-toolbar>label:not(.cv-feed-search){grid-column:2!important;grid-row:1!important}@media(max-width:600px){html[data-cv-social] .cv-social #cv-events-filters.cv4-toolbar{grid-template-columns:minmax(0,1fr)!important}html[data-cv-social] .cv-social #cv-events-filters.cv4-toolbar>label:not(.cv-feed-search){grid-column:1!important;grid-row:2!important}html[data-cv-social] .cv-social #cv-event-states{border-radius:20px!important}}</style>',{html:true})}})
 .on('title',{element(e){e.setInnerContent('Art events in Dubai · Communiverse')}})
 .on('.cv-social-intro .cv-kicker',{element(e){e.setInnerContent('Art in Dubai')}})
 .on('.cv-social-intro h1',{element(e){e.setInnerContent('Make a date<br>with Dubai.',{html:true})}})
 .on('.cv-social-intro p:not([class])',{element(e){e.setInnerContent('Exhibitions, festivals and workshops around Dubai.')}})
 .on('html[data-cv-social] .cv-social #cv-events-filters>label',{index:0,element(e){if(this.index++===0)e.replace('<input type="hidden" name="region" value="uae">',{html:true})}})
 .on('#cv-event-location,#cv-event-location-status',{element(e){e.remove()}})
 .on('.cv-source-note',{element(e){e.setInnerContent('From Dubai’s organizers and cultural institutions. Check the organizer’s page for dates, tickets and availability. Year-round venues are listed under Places.')}});
 return rewrite.transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
