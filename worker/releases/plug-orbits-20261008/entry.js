// Keep the complete current runtime and change only Plug's presentation assets.
import previous from './simple-nav-entry.js';
import STYLE from './plug-orbits.css';
import FOCUS from './plug-orbits-focus.txt';
export const RELEASE='20261008-plug-orbits-1';
const PREFIX='/communiverse/_public/'+RELEASE;
export default {async fetch(request,env,ctx){
 const u=new URL(request.url);
 if(!['espacios.me','www.espacios.me'].includes(u.hostname))return previous.fetch(request,env,ctx);
 const asset=u.pathname===PREFIX+'.js'?['application/javascript; charset=utf-8',FOCUS]:u.pathname===PREFIX+'.css'?['text/css; charset=utf-8',STYLE]:null;
 if(asset){if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});return new Response(request.method==='HEAD'?null:asset[1],{headers:{'Content-Type':asset[0],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','X-Communiverse-Plug':RELEASE}});}
 const r=await previous.fetch(request,env,ctx);
 if(u.pathname.replace(/\/$/,'')!=='/communiverse/plug'||!['GET','HEAD'].includes(request.method)||r.status!==200||!r.headers.get('Content-Type')?.includes('text/html'))return r;
 const headers=new Headers(r.headers);headers.set('X-Communiverse-Plug',RELEASE);headers.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>headers.delete(k));
 if(request.method==='HEAD'){await r.body?.cancel();return new Response(null,{status:200,headers});}
 return new HTMLRewriter().on('head',{element(el){el.append('<style data-cv-plug-orbits="'+RELEASE+'">'+STYLE+'</style>',{html:true});}})
 .on('.cv-plug',{element(el){el.setAttribute('data-cv-plug-release',RELEASE);}})
 .on('script[src],link[as=script]',{element(el){const key=el.tagName==='script'?'src':'href';if(el.getAttribute(key)==='/communiverse/_public/20261008-plug-gallery-1.js')el.setAttribute(key,PREFIX+'.js');}})
 .transform(new Response(r.body,{status:200,headers}));
}};
