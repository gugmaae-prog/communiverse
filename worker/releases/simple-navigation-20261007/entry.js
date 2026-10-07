// Keep previous immutable assets available. Restore native Plug before the shared header.
import retained from './shared-plug-ui-20261007-entry.js';
import original from './home-plug-20261007-v4-entry.js';
import STYLE from './simple-navigation-20261007.css';
import SCRIPT from './simple-navigation-20261007.txt';
export const RELEASE='20261007-simple-navigation-1';
const ROOT='/communiverse',PREFIX=ROOT+'/_public/'+RELEASE;
const pages=new Set([ROOT,ROOT+'/',...['about','how-it-works','makers','for-founders','for-brands','for-startups','contact','ambassadors'].flatMap(p=>[ROOT+'/'+p,ROOT+'/'+p+'/'])]);
export default {async fetch(request,env,ctx){
 const u=new URL(request.url);if(!['espacios.me','www.espacios.me'].includes(u.hostname))return retained.fetch(request,env,ctx);
 // Exact pre-shared-header Plug responses; no CSS, JS or content injection here.
 if(/^\/communiverse\/plug(?:\/|$)/.test(u.pathname))return original.fetch(request,env,ctx);
 const asset=u.pathname===PREFIX+'.css'?['text/css; charset=utf-8',STYLE]:u.pathname===PREFIX+'.js'?['application/javascript; charset=utf-8',SCRIPT]:null;
 if(asset){const headers={'Content-Type':asset[0],'Cache-Control':'public, max-age=31536000, immutable','X-Communiverse-Release':RELEASE,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'"};return new Response(request.method==='HEAD'?null:['GET','HEAD'].includes(request.method)?asset[1]:'Method not allowed',{status:['GET','HEAD'].includes(request.method)?200:405,headers:!['GET','HEAD'].includes(request.method)?{...headers,'Cache-Control':'no-store',Allow:'GET, HEAD'}:headers});}
 if(!pages.has(u.pathname)||!['GET','HEAD'].includes(request.method))return retained.fetch(request,env,ctx);
 const rh=new Headers(request.headers);['If-None-Match','If-Modified-Since','Range'].forEach(k=>rh.delete(k));const response=await original.fetch(new Request(request,{headers:rh}),env,ctx);
 if(response.status!==200||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const h=new Headers(response.headers);h.set('X-Communiverse-Content-Release',h.get('X-Communiverse-Release')||'retained');h.set('X-Communiverse-Release',RELEASE);h.set('X-Communiverse-Design',RELEASE);h.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>h.delete(k));
 if(request.method==='HEAD'){await response.body?.cancel();return new Response(null,{status:200,headers:h});}
 return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-cv-design',RELEASE)}}).on('head',{element(el){el.append('<meta name="cv-design-release" content="'+RELEASE+'"><link rel="stylesheet" href="'+PREFIX+'.css"><script defer src="'+PREFIX+'.js"></script>',{html:true})}}).transform(new Response(response.body,{status:200,headers:h}));
}};
