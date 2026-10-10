/* Communiverse unified Search V4 — production presentation Worker.
 * Deploy only to six approved public pages and three versioned assets.
 * Never shadow workspace, auth, booking API, marketplace API or knowledge routes.
 * Keep existing V3/booking/marketplace Workers authoritative for business logic.
 */
import SEARCH_CSS from './search-css.txt';
import SEARCH_JS from './search-js.txt';
import PLUG_CLEARANCE from './plug-fix.txt';
const BASE='/communiverse/';
const SCRIPT=BASE+'__cvsearch_v4.js';
const STYLE=BASE+'__cvsearch_v4.css';
const PLUG_SCRIPT=BASE+'__cvsearch_v4_plug_fix.js';
const VERSION='20261010-search-v4';
const PUBLIC_PAGES=new Set([
  BASE, BASE+'artists/', BASE+'events/', BASE+'communities/', BASE+'plug/', BASE+'discover/'
]);
const ASSET_MAP={
 [SCRIPT]:[SEARCH_JS,'text/javascript; charset=utf-8'],
 [STYLE]:[SEARCH_CSS,'text/css; charset=utf-8'],
 [PLUG_SCRIPT]:[PLUG_CLEARANCE,'text/javascript; charset=utf-8']
};
const asset=(request,entry)=>new Response(request.method==='HEAD'?null:entry[0],{
 status:200,headers:{
  'Content-Type':entry[1],'Cache-Control':'public, max-age=120',
  'X-Content-Type-Options':'nosniff','X-Communiverse-Search':VERSION
 }
});
const unavailable=()=>Response.json({error:'Communiverse is temporarily unavailable.'},{
 status:503,headers:{'Cache-Control':'no-store'}
});
function sourceFor(path,env){
  // Root /communiverse/ has the existing V3 inline-artwork enhancement.
  if(path===BASE||path===BASE+'workspace/'||
     path===BASE+'__cvux_v3.js'||path===BASE+'__cvux_v3.css')return env.HOME;
  // The booking Worker owns Discover and artist profile styling.
  if(path===BASE+'discover/'||path.startsWith(BASE+'discover/')||
     path.startsWith(BASE+'artist/'))return env.BOOKING;
  if(path===BASE+'__cvfix_v2.js'||path===BASE+'__cvfix_v2.css')return env.V2;
  return env.MARKETPLACE;
}
async function original(request,env){
  const url=new URL(request.url);
  const runtime=sourceFor(url.pathname,env);
  if(!runtime)return unavailable();
  // Service-binding fetch bypasses zone routing and keeps the ORIGINAL
  // runtime/authorization for requests, including POST and uploads.
  url.protocol='https:';
  url.host='espacios.me';
  return runtime.fetch(new Request(url,request));
}
class Head{
  element(head){
    head.append('<link rel="stylesheet" href="'+STYLE+'" data-cv-search-release="'+VERSION+'">',{html:true});
  }
}
class Body{
  constructor(plug){this.plug=plug}
  element(body){
    let scripts='<script defer src="'+SCRIPT+'"></script>';
    if(this.plug)scripts+='<script defer src="'+PLUG_SCRIPT+'"></script>';
    body.append(scripts,{html:true});
  }
}
export default{
 async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(Object.hasOwn(ASSET_MAP,path)&&['GET','HEAD'].includes(request.method))
    return asset(request,ASSET_MAP[path]);
  if(path===BASE+'__cvsearch_v4_health'&&request.method==='GET')
    return Response.json({ok:true,release:VERSION,scope:'six public pages',mode:'production'},{
      headers:{'Cache-Control':'no-store'}
    });
  const response=await original(request,env);
  // Even if a route pattern matches a subpage/API with query parameters,
  // its existing response is returned unmodified.
  if(request.method!=='GET'||!PUBLIC_PAGES.has(path)||!response.ok||
     !String(response.headers.get('Content-Type')||'').toLowerCase().includes('text/html'))
    return response;
  const headers=new Headers(response.headers);
  for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);
  const csp=headers.get('content-security-policy');
  if(csp&&/\bstyle-src\b/.test(csp))
    headers.set('content-security-policy',csp.replace(/style-src ([^;]+)/,
      (rule,options)=>options.includes("'self'")?rule:"style-src 'self' "+options));
  headers.set('X-Communiverse-Search',VERSION);
  return new HTMLRewriter()
    .on('head',new Head()).on('body',new Body(path===BASE+'plug/'))
    .transform(new Response(response.body,{
      status:response.status,statusText:response.statusText,headers
    }));
 }
};