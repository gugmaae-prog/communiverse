// Replace the old shared navigation on legacy HTML pages; retain every runtime module.
import previous from './plug-gallery-entry.js';
import STYLE from './simple-nav.css';
import SCRIPT from './simple-nav.txt';
export const RELEASE='20261008-simple-nav-1';
const PREFIX='/communiverse/_public/'+RELEASE;
const legacy=new Set(['about','how-it-works','makers','for-founders','for-brands','for-startups','contact','ambassadors'].map(p=>'/communiverse/'+p));
const oldScripts=new Set(['/communiverse/_public/20261007-plug-team-2.js','/communiverse/_public/20261007-shared-plug-ui-1.js']);
export default {async fetch(request,env,ctx){
 const u=new URL(request.url);
 if(!['espacios.me','www.espacios.me'].includes(u.hostname))return previous.fetch(request,env,ctx);
 if(u.pathname===PREFIX+'.js'){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  return new Response(request.method==='HEAD'?null:SCRIPT,{headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','X-Communiverse-Navigation':RELEASE}});
 }
 const r=await previous.fetch(request,env,ctx),path=u.pathname.replace(/\/$/,'');
 const page=legacy.has(path)||/^\/communiverse\/plug\/(?:person|u)\/[^/]+$/.test(path);
 if(!page||!['GET','HEAD'].includes(request.method)||r.status!==200||!r.headers.get('Content-Type')?.includes('text/html'))return r;
 const headers=new Headers(r.headers);headers.set('X-Communiverse-Navigation',RELEASE);headers.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>headers.delete(k));
 if(request.method==='HEAD'){await r.body?.cancel();return new Response(null,{status:200,headers});}
 return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-cv-simple-nav',RELEASE);}})
 .on('head',{element(el){el.append('<style data-cv-simple-nav="'+RELEASE+'">'+STYLE+'</style>',{html:true});}})
 .on('script[src],link[as=script]',{element(el){const key=el.tagName==='script'?'src':'href';if(oldScripts.has(el.getAttribute(key)))el.setAttribute(key,PREFIX+'.js');}})
 .transform(new Response(r.body,{status:200,headers}));
}};
