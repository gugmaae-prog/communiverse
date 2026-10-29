import retained from './circles-mobile-v14-gateway.mjs';
import CLIENT from './clubs-refresh-v21.txt';
import POLISH from './clubs-polish-v21.txt';
import STYLE from './brand-clubs-v21.css';
import LOGO from './brand-logo.png';
import MARK from './brand-logo-96.png';
import ICON16 from './brand-favicon-16.png';
import ICON32 from './brand-favicon-32.png';
import ICON48 from './brand-favicon-48.png';
import TOUCH from './brand-apple-touch-icon.png';

const ROOT='/communiverse/',RELEASE='communiverse-brand-clubs-20261020-v21';
const BASE=ROOT+'_brand/20261020-v21/';
const assets=new Map([
 [BASE+'logo.png',[LOGO,'image/png']], [BASE+'logo-96.png',[MARK,'image/png']],
 [BASE+'favicon-16.png',[ICON16,'image/png']], [BASE+'favicon-32.png',[ICON32,'image/png']],
 [BASE+'favicon-48.png',[ICON48,'image/png']], [BASE+'apple-touch-icon.png',[TOUCH,'image/png']],
 [BASE+'brand.css',[STYLE,'text/css; charset=utf-8']],
 [BASE+'clubs.js',[CLIENT,'text/javascript; charset=utf-8']],
 [BASE+'workspace.js',[POLISH,'text/javascript; charset=utf-8']],
]);
export function clubCopy(value){return value.replace(/\b(Communities|communities|Community|community|Circles|circles|Circle|circle)\b/g,word=>({Communities:'Clubs',communities:'clubs',Community:'Club',community:'club',Circles:'Clubs',circles:'clubs',Circle:'Club',circle:'club'})[word]);}
const clubPath=value=>value.replace(/^\/communiverse\/communities(?=\/|\?|#|$)/,'/communiverse/clubs');
class Brand {
 element(e){
  const href=(e.getAttribute('href')||'').replace(/\/$/,'');
  if(href!=='/communiverse'&&href!=='https://espacios.me/communiverse')return;
  e.setAttribute('aria-label','Communiverse home');e.setAttribute('data-cv-brand','v21');
  e.setInnerContent(`<img class="cv-brand-mark" src="${BASE}logo-96.png" width="34" height="34" alt="" decoding="async"><span class="cv-brand-name">Communiverse</span>`,{html:true});
 }
}
// The server-rendered Clubs root contains product copy only. User club names,
// descriptions and posts arrive through the retained JSON API and are untouched.
class ClubText {
 buffer='';
 text(t){this.buffer+=t.text;t.remove();if(t.lastInTextNode){t.after(clubCopy(this.buffer),{html:true});this.buffer='';}}
}
class ClubAttributes {
 element(e){for(const key of ['aria-label','title','placeholder']){const value=e.getAttribute(key);if(value)e.setAttribute(key,clubCopy(value));}}
}
class Head {
 element(e){e.append(`<link rel="stylesheet" href="${BASE}brand.css"><link rel="icon" type="image/png" sizes="16x16" href="${BASE}favicon-16.png"><link rel="icon" type="image/png" sizes="32x32" href="${BASE}favicon-32.png"><link rel="icon" type="image/png" sizes="48x48" href="${BASE}favicon-48.png"><link rel="apple-touch-icon" sizes="180x180" href="${BASE}apple-touch-icon.png">`,{html:true});}
}
class Script {
 element(e){const src=(e.getAttribute('src')||'').split('?')[0];if(src===ROOT+'__cvcircles_refresh_20261019_v18.js')e.setAttribute('src',BASE+'clubs.js');if(src===ROOT+'__cvpolish_v5.js')e.setAttribute('src',BASE+'workspace.js');}
}
class ClubLink {
 element(e){const href=e.getAttribute('href')||'';if(/^\/communiverse\/communities(?:\/|\?|#|$)/.test(href)){e.setAttribute('href',clubPath(href));if(e.getAttribute('data-circle-id')===null&&/^\/communiverse\/communities\/?$/.test(href))e.setInnerContent('Clubs');}}
}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url),path=url.pathname,read=request.method==='GET'||request.method==='HEAD';
 if(read&&/^\/communiverse\/communities\/?$/.test(path)){url.pathname=ROOT+'clubs/';return new Response(null,{status:308,headers:{location:url.href,'cache-control':'public,max-age=300','x-communiverse-canonical':'Clubs'}});}
 if(read&&path===ROOT+'clubs'){url.pathname+='/';return new Response(null,{status:308,headers:{location:url.href,'cache-control':'public,max-age=300'}});}
 const oldIcon=path===ROOT+'icon.png';
 const asset=read&&(oldIcon?[ICON48,'image/png']:assets.get(path));
 if(asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1],'cache-control':oldIcon?'public,max-age=300':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','x-communiverse-brand':RELEASE}});
 const clubs=path===ROOT+'clubs/';
 let upstream=request;if(clubs){const internal=new URL(request.url);internal.pathname=ROOT+'communities/';upstream=new Request(internal.toString(),request);}
 const response=await retained.fetch(upstream,env,ctx);
 if(request.method!=='GET'||!path.startsWith(ROOT)||path.startsWith(ROOT+'api/')||path.startsWith(ROOT+'_public/')||!response.ok||!String(response.headers.get('content-type')||'').includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const name of ['content-length','content-encoding','etag','last-modified'])headers.delete(name);headers.set('x-communiverse-brand',RELEASE);
 let rewrite=new HTMLRewriter()
  .on('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="apple-touch-icon-precomposed"]',{element(e){e.remove();}})
  .on('head',new Head())
  .on('a.cv-universe-logo,a.cvs-brand,a.brand,a.cv-brand',new Brand())
  .on('script[src]',new Script())
  .on('a[href^="/communiverse/communities"]',new ClubLink())
  .on('footer a[href="/communiverse/circles/"]',{element(e){e.before('<a href="/communiverse/clubs/">Clubs</a>',{html:true});}});
 if(clubs)rewrite=rewrite
  .on('title',{element(e){e.setInnerContent('Clubs | Communiverse');}})
  .on('meta[property="og:title"],meta[name="twitter:title"]',{element(e){e.setAttribute('content','Clubs | Communiverse');}})
  .on('link[rel="canonical"]',{element(e){e.setAttribute('href',url.href);}})
  .on('meta[property="og:url"]',{element(e){e.setAttribute('content',url.href);}})
  .on('meta[name="description"],meta[property="og:description"]',{element(e){const value=e.getAttribute('content');if(value)e.setAttribute('content',clubCopy(value));}})
  .on('#cv-circles-page',new ClubText())
  .on('#cv-circles-page [aria-label],#cv-circles-page [title],#cv-circles-page [placeholder]',new ClubAttributes());
 return rewrite.transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
