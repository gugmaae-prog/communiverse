import retained from './responsive-gateway.mjs';
import LOGO from './avid-official-logo.png';
import LEGACY_CSS from './avid-event-legacy.css';
import LEGACY_FEATURE_CSS from './avid-event-feature-legacy.css';
import PAGE from './avid-event.html';
import CSS from './avid-event.css';
import JS from './avid-event.js';
import FEATURE from './avid-event-feature.html';
import FEATURE_CSS from './avid-event-feature.css';
import PHOTO_1 from './avid-photo-1.jpg';
import PHOTO_2 from './avid-photo-2.jpg';
import PHOTO_3 from './avid-photo-3.jpg';
import PHOTO_4 from './avid-photo-4.jpg';
import PHOTO_5 from './avid-photo-5.jpg';
import PHOTO_6 from './avid-photo-6.jpg';
const ROOT='/communiverse/',ROUTE=ROOT+'events/avid-learning-poetry-night/',BASE=ROOT+'_events/avid-20261022-v1/',BLOG_BASE=ROOT+'_events/avid-blog-20261022-v2/',RELEASE='avid-blog-20261022-v2';
const assets=new Map([['event.css',[CSS,'text/css; charset=utf-8']],['event.js',[JS,'text/javascript; charset=utf-8']],['feature.css',[FEATURE_CSS,'text/css; charset=utf-8']],...[[PHOTO_1,1],[PHOTO_2,2],[PHOTO_3,3],[PHOTO_4,4],[PHOTO_5,5],[PHOTO_6,6]].map(([photo,n])=>['photo-'+n+'.jpg',[photo,'image/jpeg']])]);
const headers=(type,cache='public,max-age=31536000,immutable')=>({'content-type':type,'cache-control':cache,'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','x-communiverse-avid':RELEASE});
export default{async fetch(request,env,ctx){
 const u=new URL(request.url),read=['GET','HEAD'].includes(request.method);
 if(read&&(u.pathname===ROUTE.slice(0,-1)||(u.pathname===ROOT+'event/'&&u.searchParams.get('id')==='event-avid-learning-poetry-night')))return Response.redirect(new URL(ROUTE,u.origin),308);
 if(read&&u.pathname===ROUTE){const nonce=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));const h=headers('text/html; charset=utf-8','no-store');h['x-communiverse-responsive']='responsive-20261022-v25';h['content-security-policy']="default-src 'none'; img-src 'self'; style-src 'self'; script-src 'self' 'nonce-"+nonce+"' https://static.cloudflareinsights.com; frame-src 'self'; connect-src 'self' https://cloudflareinsights.com; base-uri 'none'; form-action 'none'; frame-ancestors 'self'";h['x-frame-options']='SAMEORIGIN';return new Response(request.method==='HEAD'?null:PAGE.replaceAll('<script ', '<script nonce="'+nonce+'" '),{headers:h});}
 if(read&&u.pathname.startsWith(BLOG_BASE)){const name=u.pathname.slice(BLOG_BASE.length),a=name==='avid-logo.png'?[LOGO,'image/png']:assets.get(name);if(a)return new Response(request.method==='HEAD'?null:a[0],{headers:headers(a[1])});}
 if(read&&u.pathname===BASE+'event.css')return new Response(request.method==='HEAD'?null:LEGACY_CSS,{headers:headers('text/css; charset=utf-8')});
 if(read&&u.pathname===BASE+'feature.css')return new Response(request.method==='HEAD'?null:LEGACY_FEATURE_CSS,{headers:headers('text/css; charset=utf-8')});
 const asset=u.pathname.startsWith(BASE)&&assets.get(u.pathname.slice(BASE.length));if(read&&asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:headers(asset[1])});
 const response=await retained.fetch(request,env,ctx);
 if(request.method!=='GET'||u.pathname!==ROOT+'events/'||!response.ok||!response.headers.get('content-type')?.includes('text/html'))return response;
 const h=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])h.delete(key);h.set('x-communiverse-avid',RELEASE);
 return new HTMLRewriter().on('head',{element(e){e.append('<link rel="stylesheet" href="'+BLOG_BASE+'feature.css">',{html:true})}}).on('.cv-social-intro',{element(e){e.after(FEATURE,{html:true})}}).transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers:h}));
}};
