/* Communiverse public search v4 · isolated staging gateway.
 * No production routes, D1 writes, or user-account modifications.
 */
import CSS from './search-css.txt';
import JS from './search-js.txt';
import FIXTURE from './fixture.txt';
import QA from './qa.txt';
import PLUG_QA from './plug-qa.txt';
import PLUG_FIX from './plug-fix.txt';

const ROOT='/communiverse/';
const SEARCH_JS=ROOT+'__cvsearch_v4.js';
const SEARCH_CSS=ROOT+'__cvsearch_v4.css';
const QA_JS=ROOT+'__cvsearch_v4_qa.js';
const PLUG_QA_JS=ROOT+'__cvsearch_v4_plug_qa.js';
const PLUG_FIX_JS=ROOT+'__cvsearch_v4_plug_fix.js';
const QA_FIXTURE=ROOT+'__cvsearch_v4_fixture';
const PUBLIC=new Set([ROOT,ROOT+'artists/',ROOT+'events/',ROOT+'communities/',ROOT+'plug/',ROOT+'discover/']);

const response=(text,type,request)=>new Response(request.method==='HEAD'?null:text,{headers:{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','x-communiverse-stage':'search-v4'}});
const unavailable=()=>Response.json({error:'Communiverse staging temporarily unavailable'},{status:503,headers:{'cache-control':'no-store'}});
function serviceFor(path,env){
 if(path===ROOT||path===ROOT+'workspace/'||path===ROOT+'__cvux_v3.js'||path===ROOT+'__cvux_v3.css')return env.HOME;
 if(path===ROOT+'__cvfix_v2.js'||path===ROOT+'__cvfix_v2.css')return env.V2;
 if(path===ROOT+'discover/'||path.startsWith(ROOT+'artist/'))return env.BOOKING;
 return env.MARKETPLACE;
}
async function upstream(request,env){
 const path=new URL(request.url).pathname;
 const service=serviceFor(path,env);
 if(!service)return unavailable();
 const url=new URL(request.url);url.protocol='https:';url.host='espacios.me';
 return service.fetch(new Request(url,request));
}
class Head{element(e){e.append('<link rel="stylesheet" href="'+SEARCH_CSS+'" data-cv-search-stage="v4">',{html:true})}}
class Body{
 constructor(qa,plug){this.qa=qa;this.plug=plug}
 element(e){
  let scripts='<script defer src="'+SEARCH_JS+'"></script>';
  if(this.qa==='layout')scripts+='<script defer src="'+QA_JS+'"></script>';
  if(this.plug)scripts+='<script defer src="'+PLUG_FIX_JS+'"></script>';
  if(this.qa==='plug')scripts+='<script defer src="'+PLUG_QA_JS+'"></script>';
  e.append(scripts,{html:true});
 }
}
export default{
 async fetch(request,env){
  const u=new URL(request.url),path=u.pathname;
  if(path===SEARCH_JS&&['GET','HEAD'].includes(request.method))return response(JS,'text/javascript; charset=utf-8',request);
  if(path===SEARCH_CSS&&['GET','HEAD'].includes(request.method))return response(CSS,'text/css; charset=utf-8',request);
  if(path===QA_JS&&['GET','HEAD'].includes(request.method))return response(QA,'text/javascript; charset=utf-8',request);
  if(path===PLUG_QA_JS&&['GET','HEAD'].includes(request.method))return response(PLUG_QA,'text/javascript; charset=utf-8',request);
  if(path===PLUG_FIX_JS&&['GET','HEAD'].includes(request.method))return response(PLUG_FIX,'text/javascript; charset=utf-8',request);
  if(path===QA_FIXTURE&&request.method==='GET')return new Response(FIXTURE,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','content-security-policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'"}});
  if(request.method!=='GET'&&request.method!=='HEAD')return Response.json({error:'Read-only staging'} ,{status:405});
  const original=await upstream(request,env);
  if(request.method!=='GET'||!PUBLIC.has(path)||!original.ok||!String(original.headers.get('content-type')||'').includes('text/html'))return original;
  const headers=new Headers(original.headers);
  for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);
  const csp=headers.get('content-security-policy');
  if(csp&&/\bstyle-src\b/.test(csp))headers.set('content-security-policy',csp.replace(/style-src ([^;]+)/,(whole,options)=>options.includes("'self'")?whole: "style-src 'self' "+options));
  headers.set('x-communiverse-stage','search-v4');
  return new HTMLRewriter().on('head',new Head()).on('body',new Body(u.searchParams.get('cv4qa'),path===ROOT+'plug/')).transform(new Response(original.body,{status:original.status,statusText:original.statusText,headers}));
 }
};
