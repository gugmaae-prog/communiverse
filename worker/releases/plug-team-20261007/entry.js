// Scoped design wrapper. Production owns all existing routes, media, forms and people data.
import previous from './home-plug-20261007-v4-entry.js';
import STYLE from './shared-plug-ui-20261007.css';
import SCRIPT from './shared-plug-ui-20261007.txt';
export const RELEASE='20261007-plug-team-1';
const ORIGINAL_RELEASE='20261007-shared-plug-ui-1';
const NAV_SCRIPT=SCRIPT.replaceAll(ORIGINAL_RELEASE,RELEASE).replace("['Plug','/communiverse/plug/']","['Communiverse','/communiverse/plug/']");
const ROOT='/communiverse',PREFIX=ROOT+'/_public/'+RELEASE;
const pages=new Set([ROOT,ROOT+'/',...['about','how-it-works','makers','for-founders','for-brands','for-startups','contact','ambassadors','plug'].flatMap(p=>[ROOT+'/'+p,ROOT+'/'+p+'/'])]);
const hosts=new Set(['espacios.me','www.espacios.me']);
export default {async fetch(request,env,ctx){const u=new URL(request.url);if(!hosts.has(u.hostname))return previous.fetch(request,env,ctx);
const OLD_PREFIX=ROOT+'/_public/'+ORIGINAL_RELEASE;
const asset=u.pathname===PREFIX+'.css'||u.pathname===OLD_PREFIX+'.css'?['text/css; charset=utf-8',STYLE]:u.pathname===PREFIX+'.js'?['application/javascript; charset=utf-8',NAV_SCRIPT]:u.pathname===OLD_PREFIX+'.js'?['application/javascript; charset=utf-8',SCRIPT]:null;
if(asset){const h={'Content-Type':asset[0],'Cache-Control':'public, max-age=31536000, immutable','X-Communiverse-Release':RELEASE,'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'SAMEORIGIN','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...h,'Cache-Control':'no-store',Allow:'GET, HEAD'}});return new Response(request.method==='HEAD'?null:asset[1],{headers:h});}
const page=pages.has(u.pathname)||/^\/communiverse\/plug\/(?:person|u)\/[^/]+\/?$/.test(u.pathname);
if(!page||!['GET','HEAD'].includes(request.method))return previous.fetch(request,env,ctx);
const rh=new Headers(request.headers);['If-None-Match','If-Modified-Since','Range'].forEach(k=>rh.delete(k));const response=await previous.fetch(new Request(request,{headers:rh}),env,ctx);
if(response.status!==200||!response.headers.get('Content-Type')?.includes('text/html'))return response;
const h=new Headers(response.headers);h.set('X-Communiverse-Content-Release',h.get('X-Communiverse-Release')||h.get('X-Communiverse-People')||'retained');h.set('X-Communiverse-Release',RELEASE);h.set('X-Communiverse-Design',RELEASE);h.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>h.delete(k));
if(request.method==='HEAD'){await response.body?.cancel();return new Response(null,{status:200,headers:h});}
return new HTMLRewriter().on('html',{element(el){el.setAttribute('data-cv-design',RELEASE)}}).on('head',{element(el){el.append('<meta name="cv-design-release" content="'+RELEASE+'"><link rel="stylesheet" href="'+PREFIX+'.css"><script defer src="'+PREFIX+'.js"></script>',{html:true})}}).transform(new Response(response.body,{status:200,headers:h}));
}};