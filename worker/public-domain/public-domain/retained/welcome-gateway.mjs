import retained from './profile-gateway.mjs';
import welcome from './welcome-api.mjs';
import CLIENT from './welcome-client.txt';
import STYLE from './welcome-style.txt';
const base='/communiverse/',release='communiverse-welcome-v12-20261013';
const assets=new Map([[base+'__cvwelcome_20261013_v12.js',[CLIENT,'text/javascript; charset=utf-8']],[base+'__cvwelcome_20261013_v12.css',[STYLE,'text/css; charset=utf-8']]]);
export default{async fetch(request,env,ctx){
 const incoming=new URL(request.url),originalPath=incoming.pathname,read=['GET','HEAD'].includes(request.method);
 if(read&&/^\/communiverse\/plug(?:\/|$)/.test(originalPath)){
  incoming.pathname=originalPath.replace(/^\/communiverse\/plug(?=\/|$)/,'/communiverse/circles');
  if(incoming.pathname==='/communiverse/circles')incoming.pathname+='/';
  return new Response(null,{status:308,headers:{Location:incoming.toString(),'Cache-Control':'public,max-age=300','X-Communiverse-Canonical':'Circles'}});
 }
 let upstreamRequest=request;
 if(/^\/communiverse\/circles(?:\/|$)/.test(originalPath)){
  const upstream=new URL(request.url);
  upstream.pathname=originalPath.replace(/^\/communiverse\/circles(?=\/|$)/,'/communiverse/plug');
  if(upstream.pathname==='/communiverse/plug')upstream.pathname+='/';
  upstreamRequest=new Request(upstream.toString(),request);
 }
 const path=originalPath,asset=read&&assets.get(path);
 if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'Content-Type':asset[1],'Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin','X-Communiverse-Welcome':release}});
 if(path.replace(/\/$/,'')===base+'workspace/welcome/api'){const r=await welcome.fetch(request,env);const h=new Headers(r.headers);h.set('X-Communiverse-Welcome',release);return new Response(r.body,{status:r.status,statusText:r.statusText,headers:h});}
 const r=await retained.fetch(upstreamRequest,env,ctx);
 if(read&&/^\/communiverse\/circles(?:\/|$)/.test(path)&&r.ok&&String(r.headers.get('Content-Type')||'').includes('text/html')){
  const h=new Headers(r.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])h.delete(key);
  const canonical=incoming.origin+path+incoming.search;
  h.set('X-Communiverse-Canonical','Circles');
  return new HTMLRewriter()
   .on('title',{element(e){e.setInnerContent('Circles | Communiverse')}})
   .on('link[rel="canonical"]',{element(e){e.setAttribute('href',canonical)}})
   .on('meta[property="og:title"]',{element(e){e.setAttribute('content','Circles | Communiverse')}})
   .on('meta[property="og:url"]',{element(e){e.setAttribute('content',canonical)}})
   .on('meta[name="twitter:title"]',{element(e){e.setAttribute('content','Circles | Communiverse')}})
   .transform(new Response(r.body,{status:r.status,statusText:r.statusText,headers:h}));
 }
 if(request.method!=='GET'||!['/communiverse/workspace/','/communiverse/profile/'].includes(path)||!r.ok||!String(r.headers.get('Content-Type')||'').includes('text/html'))return r;
 const h=new Headers(r.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])h.delete(key);h.set('X-Communiverse-Welcome',release);
 return new HTMLRewriter().on('head',{element(e){e.append('<link rel="stylesheet" href="'+base+'__cvwelcome_20261013_v12.css">',{html:true});}}).on('body',{element(e){e.append('<script defer src="'+base+'__cvwelcome_20261013_v12.js"></script>',{html:true});}}).transform(new Response(r.body,{status:r.status,statusText:r.statusText,headers:h}));
}};
