import retained from './wetex-recap-gateway.mjs';
import CSS from './avatar-circles.css';
import JS from './avatar-circles.js';
import K384 from './circle-keiffer-384.webp';
import K1024 from './circle-keiffer-1024.webp';
import L384 from './circle-luna-384.webp';
import L1024 from './circle-luna-1024.webp';
const ROOT='/communiverse/',BASE=ROOT+'_circles/20261022-v1/',RELEASE='avatar-circles-20261022-v1';
const assets=new Map([['circles.css',[CSS,'text/css; charset=utf-8']],['circles.js',[JS,'text/javascript; charset=utf-8']],['keiffer-384.webp',[K384,'image/webp']],['keiffer-1024.webp',[K1024,'image/webp']],['luna-384.webp',[L384,'image/webp']],['luna-1024.webp',[L1024,'image/webp']]]);
const people={keiffer:'Keiffer',luna:'Luna'};
function circles(id,names=['keiffer','luna'],label='Attended by'){
 return `<div class="cv-attendance-circles" data-attendance-circles><p class="cv-attendance-label">${label}</p><ul class="cv-attendance-list" aria-label="${label}">${names.map(name=>`<li class="cv-attendance-person" data-person="${name}"><button type="button" class="cv-attendance-trigger" aria-label="Explore ${people[name]}’s circle"><span class="cv-attendance-photo"><img src="${BASE}${name}-384.webp" srcset="${BASE}${name}-384.webp 384w, ${BASE}${name}-1024.webp 1024w" sizes="128px" alt="" width="128" height="128" decoding="async" loading="lazy"></span><span class="cv-attendance-name">${people[name]}</span></button><div class="cv-attendance-detail" id="${id}-${name}"><a href="${ROOT}circles/person/${name}/">View circle <span aria-hidden="true">↗</span></a></div></li>`).join('')}</ul><span class="cv-attendance-status" role="status" aria-live="polite"></span></div>`;
}
const feature=`<section class="cv-avid-recent" aria-labelledby="avid-recent-heading"><div class="cv-avid-section-heading"><p>From our circle</p><span>Recently attended</span></div><article class="cv-avid-recap cv-avid-recap-circles"><a class="cv-avid-cover" href="${ROOT}events/avid-learning-poetry-night/" aria-label="Read Quiet Awakenings"><img src="${ROOT}_events/avid-20261022-v1/photo-4.jpg" alt="Three attendees together in the gallery at the poetry night." width="720" height="1280" loading="lazy" decoding="async"></a><div class="cv-avid-recap-copy"><h2 id="avid-recent-heading"><a href="${ROOT}events/avid-learning-poetry-night/">Quiet Awakenings with Avid Learning</a></h2><p>17 October · A poetry evening in Al Quoz.</p>${circles('avid-events')}<a class="cv-avid-recap-link" href="${ROOT}events/avid-learning-poetry-night/">Read the story <span aria-hidden="true">↗</span></a></div></article></section>`;
const wakos=`<section class="cv-wakos-attendance cv-wakos-circles" aria-label="From our circle">${circles('wakos-attendance',['luna'],'From our circle')}<div class="cv-wakos-copy"><h2>WAKOS: Ceramic Ties</h2><p>Opening · 20 October 2026 at 1:00 PM (Dubai)</p><a href="https://www.aud.edu/all-events/exhibition-wakos-ceramic-ties-peru-and-the-emirates/">Details on the AUD website ↗</a></div></section>`;
export default {async fetch(request,env,ctx){
 const u=new URL(request.url),read=['GET','HEAD'].includes(request.method),asset=u.pathname.startsWith(BASE)&&assets.get(u.pathname.slice(BASE.length));
 if(read&&asset)return new Response(request.method==='HEAD'?null:asset[0],{headers:{'content-type':asset[1],'cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff','x-communiverse-circles':RELEASE}});
 const response=await retained.fetch(request,env,ctx);
 const supported=[ROOT,ROOT+'discover/',ROOT+'events/',ROOT+'event/',ROOT+'events/avid-learning-poetry-night/'].includes(u.pathname)||u.pathname.startsWith(ROOT+'circles/');
 if(request.method!=='GET'||!supported||!response.ok||!response.headers.get('content-type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);headers.set('x-communiverse-circles',RELEASE);headers.set('cache-control','no-store');
 return new HTMLRewriter().on('head',{element(e){e.append(`<link rel="stylesheet" href="${BASE}circles.css"><script defer src="${BASE}circles.js"></script>`,{html:true})}})
 .on('.cv-avid-recent',{element(e){e.replace(feature,{html:true})}})
 .on('.avid-attendees',{element(e){e.replace(circles('avid-blog'),{html:true})}})
 .on('.cv-wakos-attendance',{element(e){e.replace(wakos,{html:true})}})
 .on('img',{element(e){const src=e.getAttribute('src')||'',match=src.match(/^\/communiverse\/_public\/(?:avatar\/cv-(keiffer|luna)(?:\?|$)|20261007-plug-ios-2-portraits\/(keiffer|luna)\.webp|portraits\/20261006\/(keiffer|luna)\.png)/);if(!match)return;const name=match[1]||match[2]||match[3];e.setAttribute('src',BASE+name+'-384.webp');e.setAttribute('srcset',BASE+name+'-384.webp 384w, '+BASE+name+'-1024.webp 1024w');e.setAttribute('sizes','(max-width:640px) 50vw, 360px');e.setAttribute('data-cv-portrait','enhanced');}})
 .transform(new Response(response.body,{status:response.status,statusText:response.statusText,headers}));
}};
