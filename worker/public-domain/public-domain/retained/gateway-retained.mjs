import {api as readFeed} from './read-feed-social-backend.js';
import {feed as feedMarkup} from './read-feed-social-views.js';
import {bookingForm as feedBookingForm} from './read-feed-social-booking.js';
/* Thin HTML-only overlay. Original catalogue, booking, auth and runtime retained. */
import CV3_JS from './v3-client.txt';
import CV3_CSS from './v3-style.txt';
import POLISH_JS from './polish-client.txt';
import POLISH_CSS from './polish-style.txt';
const ROOT='/communiverse/',RELEASE='communiverse-tools-20261013-v7',CACHE='20261013-tools-v7-2';
const SCRIPT=ROOT+'__cvux_v3.js',STYLE=ROOT+'__cvux_v3.css',POLISH_SCRIPT=ROOT+'__cvpolish_v5.js',POLISH_STYLE=ROOT+'__cvpolish_v5.css';
// SEARCH delegates the landing page to its HOME binding, this gateway. ROOT
// must terminate at the retained Marketplace rather than call SEARCH again.
export function upstreamFor(path){if(['discover','artists','events','communities','plug'].some(dir=>path.startsWith(ROOT+dir+'/')))return 'SEARCH';if(path.startsWith(ROOT+'artist/'))return 'BOOKING';return 'MARKETPLACE'}
const asset=(req,text,type)=>new Response(req.method==='HEAD'?null:text,{headers:{'content-type':type,'cache-control':'public,max-age=120','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','x-communiverse-release':RELEASE}});
class Head{constructor(workspace){this.workspace=workspace}element(e){e.append((this.workspace?'<link rel="stylesheet" href="'+ROOT+'__cvfix_v2.css"><link rel="stylesheet" href="'+STYLE+'?v='+CACHE+'">':'')+'<link rel="stylesheet" href="'+POLISH_STYLE+'?v='+CACHE+'">',{html:true})}}
class Body{constructor(workspace){this.workspace=workspace}element(e){e.append('<script defer src="'+POLISH_SCRIPT+'?v='+CACHE+'"></script>'+(this.workspace?'<script defer src="'+ROOT+'__cvfix_v2.js"></script><script defer src="'+SCRIPT+'?v='+CACHE+'"></script>':''),{html:true})}}
class RootClass{element(e){e.setAttribute('class',((e.getAttribute('class')||'')+' cv-polish-v5').trim())}}
class NativeWorkspace{element(e){if(['/communiverse/_public/20261009-social-12-workspace.js','/communiverse/_public/20261011-workspace-chat-heads.js'].includes((e.getAttribute('src')||'').split('?')[0]))e.remove()}}
// The initial document must agree with hydrated navigation. Keep native nodes
// and their listeners; only trusted client identity reveals role-specific tabs.
class WorkspaceNav{element(e){e.setAttribute('aria-busy','true')}}
class WorkspaceTab{element(e){
 const key=e.getAttribute('data-ws-tab');
 const labels={overview:'Focus',projects:'Work',connect:'Connect'};
 if(Object.hasOwn(labels,key))e.setInnerContent(labels[key]);
 if(['requests','team','projects','artists'].includes(key)){e.setAttribute('hidden','');e.setAttribute('aria-hidden','true')}
}}
export default{async fetch(request,env){
 const path=new URL(request.url).pathname,isRead=['GET','HEAD'].includes(request.method);
 if(isRead&&path===SCRIPT)return asset(request,CV3_JS,'text/javascript; charset=utf-8');
 if(isRead&&path===STYLE)return asset(request,CV3_CSS,'text/css; charset=utf-8');
 if(isRead&&path===POLISH_SCRIPT)return asset(request,POLISH_JS,'text/javascript; charset=utf-8');
 if(isRead&&path===POLISH_STYLE)return asset(request,POLISH_CSS,'text/css; charset=utf-8');
 if(request.method==='GET'&&path===ROOT+'__cvux_v3_health')return Response.json({ok:true,release:RELEASE,scope:'retained-html-overlay',paidCallingEnabled:false},{headers:{'cache-control':'no-store'}});
 if(request.method==='GET'&&path.replace(/\/$/,'')===ROOT+'api/feed')return readFeed(request,env);
 const binding=env[upstreamFor(path)];if(!binding)return Response.json({error:'Communiverse is temporarily unavailable.'},{status:503,headers:{'cache-control':'no-store'}});
 // Recover the two feed pages using the retained, working HTML shell. All
 // existing presentation layers still run below and outside this gateway.
 const feedPage=request.method==='GET'&&[ROOT,ROOT+'discover/'].includes(path);
 let upstream;
 if(feedPage){
  const shellURL=new URL(request.url);shellURL.pathname=ROOT+'artists/';shellURL.search='';
  const feedURL=new URL(request.url);feedURL.pathname=ROOT+'api/feed';
  const [shell,data]=await Promise.all([binding.fetch(new Request(shellURL,request)),readFeed(new Request(feedURL,{headers:request.headers}),env)]);
  const content=feedMarkup(await data.json())+(path===ROOT+'discover/'?'<section id="plan-session" class="cv-social cv-booking">'+feedBookingForm('')+'</section>':'');
  const h=new Headers(shell.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])h.delete(key);h.set('cache-control','no-store');h.set('x-communiverse-feed','readonly-20261027-v1');
  upstream=shell.ok&&shell.headers.get('content-type')?.includes('text/html')?new HTMLRewriter()
   .on('head',{element(e){e.append('<style data-cv-feed-mobile>@media(max-width:700px){#cv-work-detail .cv-work-layout{grid-template-columns:minmax(0,1fr);gap:24px}#cv-work-detail .cv-work-layout>div{min-width:0}#cv-work-detail .cv-work-facts>div{grid-template-columns:minmax(0,1fr);gap:4px}#cv-work-detail .cv-work-facts dd{margin:0;overflow-wrap:anywhere}}</style>',{html:true})}})
   .on('main',{element(e){e.setInnerContent(content,{html:true})}})
   .on('title',{element(e){e.setInnerContent('Communiverse · Your art world')}})
   .on('link[rel="canonical"]',{element(e){e.setAttribute('href',new URL(path,request.url).href)}})
   .on('meta[property="og:url"]',{element(e){e.setAttribute('content',new URL(path,request.url).href)}})
   .on('meta[property="og:title"],meta[name="twitter:title"]',{element(e){e.setAttribute('content','Communiverse · Your art world')}})
   .on('#cv-social-header nav a',{element(e){e.removeAttribute('aria-current');if(e.getAttribute('href')===ROOT+'discover/')e.setAttribute('aria-current','page')}})
   .transform(new Response(shell.body,{status:shell.status,headers:h})):shell;
 }else upstream=await binding.fetch(request);
 if(request.method!=='GET'||!path.startsWith(ROOT)||path.startsWith(ROOT+'api/')||path.startsWith(ROOT+'_public/')||!upstream.ok||!String(upstream.headers.get('content-type')||'').includes('text/html'))return upstream;
 const headers=new Headers(upstream.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);
 let csp=headers.get('content-security-policy');if(csp){csp=csp.replace(/style-src ([^;]+)/,(full,v)=>v.includes("'self'")?full:"style-src 'self' "+v).replace(/media-src ([^;]+)/,(full,v)=>v.includes('blob:')?full:full+' blob:').replace(/connect-src ([^;]+)/,(full,v)=>v.includes('wss://espacios.me')?full:full+' wss://espacios.me wss://www.espacios.me');headers.set('content-security-policy',csp)}
 headers.set('x-communiverse-release',RELEASE);const workspace=path===ROOT+'workspace/'||path===ROOT+'workspace',retainedAssets=workspace||path===ROOT;
 let rewrite=new HTMLRewriter().on('html',new RootClass()).on('head',new Head(retainedAssets)).on('body',new Body(retainedAssets));if(workspace)rewrite=rewrite.on('script[src]',new NativeWorkspace()).on('.cv-ws-tabs',new WorkspaceNav()).on('.cv-ws-tabs [data-ws-tab]',new WorkspaceTab());
 return rewrite.transform(new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers}));
}};
