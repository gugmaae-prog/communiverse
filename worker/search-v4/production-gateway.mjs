/* Communiverse Circles migration — scoped public presentation Worker.
 * Circles is the canonical public name and route for the legacy Plug directory.
 * Existing marketplace data, identity, auth, profile IDs and message handlers remain authoritative.
 * This source change does not itself update Cloudflare zone route mappings or deploy a Worker.
 */
import SEARCH_CSS from './search-css.txt';
import SEARCH_JS from './search-js.txt';
import PLUG_CLEARANCE from './plug-fix.txt';
const BASE='/communiverse/';
const SCRIPT=BASE+'__cvsearch_v4.js';
const STYLE=BASE+'__cvsearch_v4.css';
const PLUG_SCRIPT=BASE+'__cvsearch_v4_plug_fix.js';
const VERSION='20261017-circles-rebrand-1';
const PUBLIC_PAGES=new Set([
  BASE, BASE+'artists/', BASE+'events/', BASE+'communities/', BASE+'circles/', BASE+'discover/'
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
function upstreamPath(path){
  return path.replace(/^\/communiverse\/circles(?=\/|$)/, '/communiverse/plug');
}
function isCirclesPath(path){
  return path===BASE+'circles/' || /^\/communiverse\/circles\/(?:person|u)\/[^/]+\/?$/.test(path);
}
function replaceBrand(value){
  return String(value).replace(/Espacios\s+Plug/gi,'Circles').replace(/\bPlug\b/gi,'Circles');
}
function rewriteInternalHref(value){
  return value.replace(/^\/communiverse\/plug(?=\/|$)/, '/communiverse/circles');
}
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
  const path=upstreamPath(url.pathname);
  const runtime=sourceFor(path,env);
  url.pathname=path;
  if(!runtime)return unavailable();
  // Service-binding fetch bypasses zone routing and keeps the ORIGINAL
  // runtime/authorization for requests, including POST and uploads.
  url.protocol='https:';
  url.host='espacios.me';
  return runtime.fetch(new Request(url,request));
}
class BrandRewriter{
  element(el){
    for(const attr of ['title','aria-label','alt','placeholder','content']){
      const value=el.getAttribute(attr);
      if(value&&/plug/i.test(value))el.setAttribute(attr,replaceBrand(value));
    }
    const href=el.getAttribute('href');
    if(href&&href.startsWith('/communiverse/plug'))el.setAttribute('href',rewriteInternalHref(href));
  }
}
class Head{
  element(head){
    head.append('<link rel="stylesheet" href="'+STYLE+'" data-cv-search-release="'+VERSION+'">',{html:true});
  }
}
class Body{
  constructor(circles){this.circles=circles}
  element(body){
    let scripts='<script defer src="'+SCRIPT+'"></script>';
    if(this.circles)scripts+='<script defer src="'+PLUG_SCRIPT+'"></script>';
    body.append(scripts,{html:true});
  }
}
export default{
 async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(/^\/communiverse\/plug(?:\/|$)/.test(path)&&['GET','HEAD'].includes(request.method)){
    url.pathname=path.replace(/^\/communiverse\/plug(?=\/|$)/,'/communiverse/circles');
    if(url.pathname==='/communiverse/circles')url.pathname+='/';
    return new Response(null,{status:308,headers:{Location:url.toString(),'Cache-Control':'public, max-age=300','X-Communiverse-Canonical':'Circles'}});
  }
  if(Object.hasOwn(ASSET_MAP,path)&&['GET','HEAD'].includes(request.method))
    return asset(request,ASSET_MAP[path]);
  if(path===BASE+'__cvsearch_v4_health'&&request.method==='GET')
    return Response.json({ok:true,release:VERSION,scope:'public pages and Circles profiles',mode:'production'},{
      headers:{'Cache-Control':'no-store'}
    });
  const response=await original(request,env);
  // Even if a route pattern matches a subpage/API with query parameters,
  // its existing response is returned unmodified.
  if(request.method!=='GET'||(!PUBLIC_PAGES.has(path)&&!isCirclesPath(path))||!response.ok||
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
    .on('*',new BrandRewriter()).on('head',new Head()).on('body',new Body(isCirclesPath(path)))
    .transform(new Response(response.body,{
      status:response.status,statusText:response.statusText,headers
    }));
 }
};