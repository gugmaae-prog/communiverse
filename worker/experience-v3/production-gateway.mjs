/* Communiverse V3 feature-scoped release. All auth/write/data belongs to original. */
import CV3_JS from './v3-client.txt';
import CV3_CSS from './v3-style.txt';
const ROOT='/communiverse/';
const RELEASE='communiverse-ux-v3-20261009';
const V2_SCRIPT=ROOT+'__cvfix_v2.js';
const V2_STYLE=ROOT+'__cvfix_v2.css';
const SCRIPT=ROOT+'__cvux_v3.js';
const STYLE=ROOT+'__cvux_v3.css';
const htmlPaths=new Set([ROOT,ROOT+'workspace/']);
const response=(request,text,type)=>new Response(request.method==='HEAD'?null:text,{headers:{'content-type':type,'cache-control':'public,max-age=120','x-content-type-options':'nosniff','x-communiverse-release':RELEASE}});
const unavailable=()=>Response.json({error:'Communiverse is temporarily unavailable.'},{status:503,headers:{'cache-control':'no-store'}});
async function backend(req,env){if(!env.MARKETPLACE)return unavailable();const u=new URL(req.url);u.host='espacios.me';u.protocol='https:';return env.MARKETPLACE.fetch(new Request(u,req));}
class Head{element(e){e.append('<link rel="stylesheet" href="'+V2_STYLE+'"><link rel="stylesheet" href="'+STYLE+'">',{html:true})}}
class Body{element(e){e.append('<script defer src="'+V2_SCRIPT+'"></script><script defer src="'+SCRIPT+'"></script>',{html:true})}}
export default {async fetch(request,env,ctx){const u=new URL(request.url),path=u.pathname;
 if((request.method==='GET'||request.method==='HEAD')&&path===SCRIPT)return response(request,CV3_JS,'text/javascript; charset=utf-8');
 if((request.method==='GET'||request.method==='HEAD')&&path===STYLE)return response(request,CV3_CSS,'text/css; charset=utf-8');
 if(path===ROOT+'__cvux_v3_health'&&request.method==='GET')return Response.json({release:RELEASE,ok:true,scope:'html-only'},{headers:{'cache-control':'no-store'}});
 const upstream=await backend(request,env);
 if(!htmlPaths.has(path)||request.method!=='GET'||!upstream.ok||!String(upstream.headers.get('content-type')||'').includes('text/html'))return upstream;
 const headers=new Headers(upstream.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);
 headers.set('x-communiverse-release',RELEASE);
 return new HTMLRewriter().on('head',new Head()).on('body',new Body()).transform(new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers}));
 }};
