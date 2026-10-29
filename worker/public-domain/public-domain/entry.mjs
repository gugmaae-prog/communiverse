import ACCOUNT_CLIENT from './account-client.js.txt';
import JOIN_LINKS from './join-links.js.txt';
import {accessibilitySupport} from './accessibility.mjs';
import ACCESSIBILITY_CLIENT from './accessibility.js.txt';
import {seoSupport,sitemap} from './seo.mjs';
import {securityPolicy,communiverseRequest,privateArtifactPath,cspReport,securityText,robots} from './security-policy.mjs';
import {brandedAccountRoute,accountSupport} from './account-origin.mjs';
import {formSupport} from './form-support.mjs';
import FORM_CLIENT from './form-support.js.txt';
import {guardForm,FORM_ACTIONS,formEndpoint,withoutChallengeToken} from './form-security.mjs';
import {reportAPI} from './report.mjs';
import {artistPath,artistSlugs,artistIdFromSlug,workIdFromSlugs} from './record-routes.mjs';
import {artistById,catalogue,knownPersonIds,worksPage,artistPage,workPage,selectedCircleHTML,recordStyle,eventRecordPage} from './record-pages.mjs';
import RECORD_ACTIONS from './record-actions.js.txt';
import {clubDiscovery} from './discovery-policy.mjs';
import {discoveryConfig,discoveryStyle,ambassadorsPage} from './discovery-pages.mjs';
import DISCOVERY_UI from './discovery-ui.js.txt';
import {homeFeed} from './home-feed.mjs';
import {tile as homeTile} from './retained/first-render-templates.mjs';
import {brandResponse} from './brand-copy.mjs';
import {legalPage,legalSupport} from './legal.mjs';
import LEGAL_CLIENT from './legal-links.js.txt';
import {identityResponse,CLIENT as IDENTITY_CLIENT} from './identity-response.mjs';
import {accountAPI as updatedAccountAPI} from './accounts.mjs';
export {RegistrationDelivery} from './registration-delivery.mjs';
import {notificationPaths,observeRegistration,publicRegistration,readRegistrationBody} from './registration-notifications.mjs';
import {programmeResponse} from './dubai-programme.mjs';
import REGISTRATION_CLIENT from './registrations.js.txt';
import EVENT_REFRESH from './event-refresh.txt';
import retained from './retained/first-render-gateway.mjs';
import {portraitData} from './portrait-refresh.mjs';
import {circlePeople,directoryHTML} from './circles-directory.mjs';
import {circleLayout} from './circles-layout.mjs';
import {circleScene} from './circles-scene.mjs';
import CONSTELLATION_STYLE from './circles-constellation.css.txt';
import CIRCLE_STYLE from './circles-directory.css.txt';
import CIRCLE_CLIENT from './circles-directory.js.txt';
import ORBIT_STYLE from './circles-orbit.css.txt';
import SEARCH_STYLE from './search-sizing.css.txt';
import ARTWORK_CLIENT from './artwork-experience.js.txt';
import {artworkContext,artistWorks} from './artwork-catalogue.mjs';
import {workshopPromo,featuredArtist,discoveryData,workshopResponse} from './workshops.mjs';
import WORKSHOP_STYLE from './workshops.css.txt';
import WORKSHOP_CLIENT from './workshops.js.txt';
import FEED_DISCOVERY from './feed-discovery.js.txt';
import {featuredArtistIndex} from './daily-feature.mjs';
import {workshopEnquiryMail} from './workshop-enquiry.mjs';
import FAVICON from './retained/transparent-favicon-48.png';
import TOUCH_ICON from './retained/transparent-apple-touch-icon.png';
import {publicFallback,snapshotCursor} from './public-fallback.mjs';
import {OLD,ORIGIN,PREVIEW,PREFIX,RELEASE,CLIENT_BASE,read,clean,internal,accountPath,technical,link,rewrite,canonical,legacyPublicRedirect} from './urls.mjs';
const refreshedEvents=JSON.parse(EVENT_REFRESH);
const background=(ctx,task)=>ctx.waitUntil(task.catch(error=>console.error('Communiverse notification pending',error.name)));
const hosts=new Set(['communiverseclubs.com','www.communiverseclubs.com','preview.communiverseclubs.com']);
const peopleAliases={"hira-e-silsby":"cv-hira-e-silsby","haseeb-wasim":"cv-haseeb-wasim","alison-gonzalez":"cv-alison-gonzalez","abel-thomas":"cv-abel-thomas","louis-mitchell":"cv-louis-mitchell","elferah-saidil":"cv-elferah-saidil","keiffer":"cv-keiffer","hassan-b-mirza":"cv-hassan-b-mirza","luna":"cv-luna","turbooz":"cv-turbooz","abdallah-mahmoudd":"cv-abdallah-mahmoudd","tariq-al-salman":"cv-tariq-al-salman","viktoriya-melny":"cv-viktoriya-melny","shakiba-binchi":"cv-shakiba-binchi"};
const pages=new Set(['discover','artists','artist','events','event','exhibitions','clubs','circles','communities','plug','about','contact','how-it-works','reference','galleries','gallery','privacy','terms','workshops','ambassadors']);
const publicAPIs=new Set(['artists','feed','item','events','event','galleries','community','comments','circles','circles/posts','location','prices']);
let retryLiveAt=0;
const guestAPIs=new Map([['me',{member:null}],['identity/me',{person:null,contact:null}],['account/me',{account:null}],['workspace/me',{staff:null}]]);
const headers=()=>({'Cache-Control':'private, no-store','Referrer-Policy':'strict-origin-when-cross-origin','X-Content-Type-Options':'nosniff','X-Communiverse-Domain':RELEASE});
const redirect=(to,status=302)=>new Response(null,{status,headers:{...headers(),Location:to}});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function error(status,title,text){return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Communiverse</title><style>body{margin:0;padding:clamp(24px,7vw,100px);background:#edf2f8;color:#23334a;font:18px/1.6 system-ui}main{max-width:680px}h1{font-size:clamp(32px,6vw,64px);line-height:1.1}nav{display:flex;flex-wrap:wrap;gap:20px}a{color:inherit}</style></head><body><main><a href="/">Communiverse</a><h1>${title}</h1><p>${text}</p><nav><a href="/discover/">Discover</a><a href="/artists/">Artists</a><a href="/events/">Events</a><a href="/clubs/">Clubs</a></nav></main></body></html>`,{status,headers:{...headers(),'Content-Type':'text/html; charset=utf-8'}});}
function adjusted(response,origin){const h=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified','set-cookie','access-control-allow-origin','access-control-allow-credentials'])h.delete(key);for(const[k,v]of Object.entries(headers()))h.set(k,v);if(origin===PREVIEW)h.set('X-Robots-Tag','noindex, nofollow');if(h.has('Location'))h.set('Location',link(h.get('Location'),origin));return h;}
async function guest(request,env,ctx,path){
 // The retained application uses its historical path as an internal router.
 // This is exclusively anonymous GET/HEAD through existing service bindings.
 // No credentials, origin claims or unsafe methods cross this adapter.
 if(!read(request.method))throw Error('Read-only public route');
 const fallbackRequest=new Request(new URL(path+new URL(request.url).search,OLD),{method:request.method});
 if(Date.now()<retryLiveAt||snapshotCursor(request)){const fallback=await publicFallback(fallbackRequest);if(fallback)return fallback;}
 const u=new URL(request.url);u.protocol='https:';u.hostname='espacios.me';u.port='';u.pathname=path;
 const h=new Headers();for(const k of ['accept','accept-language','range','if-range','CF-Connecting-IP','CF-IPCountry'])if(request.headers.has(k))h.set(k,request.headers.get(k));
 const target=/^\/communiverse\/__cvsearch_v4/.test(path)?env.SEARCH:retained;
 try{const response=await target.fetch(new Request(u,{method:request.method,headers:h,redirect:'manual'}),env,ctx);if(response.status>=500){const fallback=await publicFallback(fallbackRequest);if(fallback){retryLiveAt=Date.now()+60000;await response.body?.cancel();return fallback;}}return response;}
 catch(error){const fallback=await publicFallback(fallbackRequest);if(fallback){retryLiveAt=Date.now()+60000;return fallback;}throw error;}
}
function jsonLinks(v,origin){return typeof v==='string'?(/^(?:\/communiverse\/|https:\/\/(?:www\.)?espacios\.me\/communiverse\/)/.test(v)?link(v,origin):v):Array.isArray(v)?v.map(x=>jsonLinks(x,origin)):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,jsonLinks(x,origin)])):v;}
async function adapt(response,request,readFeed){response=brandResponse(legalSupport(response,request));const u=new URL(request.url),h=adjusted(response,u.origin),type=h.get('Content-Type')||'';
 if(request.method==='HEAD')return new Response(null,{status:response.status,headers:h});
 if(type.includes('application/json')){let data=portraitData(await response.json());if(clean(u.pathname).replace(/\/$/,'')==='/api/galleries'&&u.searchParams.has('id')&&!data.galleries?.some(g=>g.id===u.searchParams.get('id')))return Response.json({error:'Gallery not found.'},{status:404,headers:h});if(clean(u.pathname).startsWith('/api/circles')){const fix=c=>c&&c.cover?.startsWith('/communiverse/_public/20261008-marketplace-1/')?{...c,cover:c.cover+'?cv_original=1'}:c;if(data.circles)data.circles=data.circles.map(fix);if(data.circle)data.circle=fix(data.circle);}return new Response(JSON.stringify(jsonLinks(data,u.origin)),{status:response.status,headers:h});}
 if(!type.includes('text/html'))return new Response(response.body,{status:response.status,headers:h});
 if(response.status>=500)return error(response.status,'We’ll be right back','This part of Communiverse is temporarily unavailable. Please try again shortly.');
 const html=rewrite(await response.text(),u.origin),isEvent=clean(u.pathname)==='/event/',isCircles=['/circles/','/plug/'].includes(clean(u.pathname)),people=isCircles?circlePeople(html,artistWorks):null,featured=['/','/discover/'].includes(clean(u.pathname)),isWorkshops=clean(u.pathname)==='/workshops/';
 if(people&&u.searchParams.has('person')&&!people.some(p=>p.slug===u.searchParams.get('person')))return error(404,'Person not found','Explore the people in Communiverse.');
 let home=null;if(featured){const feedURL=new URL(request.url);feedURL.pathname='/api/feed';feedURL.searchParams.set('surface','home');const result=await homeFeed(new Request(feedURL),readFeed||publicFallback);if(result.ok)home=await result.json();}
 return identityResponse(new HTMLRewriter()
 .on('head',{element(e){e.append('<style data-cv-records>'+recordStyle+'</style><script defer src="'+CLIENT_BASE+'record-actions.js"></script><style data-cv-discovery>'+discoveryStyle+'</style><script type="application/json" id="cv-discovery-config">'+JSON.stringify(discoveryConfig).replaceAll('<','\\u003c')+'</script>',{html:true});}})
 .on('head',{element(e){e.prepend('<script defer src="'+CLIENT_BASE+'discovery-ui.js"></script>'+(featured?'<script defer src="'+CLIENT_BASE+'feed-discovery.js"></script>':'')+'<script defer src="'+CLIENT_BASE+'navigation.js"></script><script type="application/json" id="cv-runtime-config">'+JSON.stringify({publicOrigin:u.origin,pageBase:'/',apiBase:PREFIX+'/api/',assetBase:PREFIX+'/_',accountOrigin:OLD,accountBase:OLD+PREFIX+'/'})+'</script>'+(u.origin===PREVIEW?'<meta name="robots" content="noindex,nofollow">':''),{html:true});}})
 .on('a[href],form[action]',{element(e){const attr=e.tagName==='form'?'action':'href';const value=e.getAttribute(attr);try{if(e.tagName==='a'&&['/for-founders','/for-brands','/for-startups'].includes(new URL(value,u.origin).pathname.replace(/\/$/,''))){e.remove();return;}}catch{}e.setAttribute(attr,link(value,u.origin));}})
 .on('#cv-circle-filters > label:first-child',{element(e){const classes=new Set((e.getAttribute('class')||'').split(/\s+/).filter(Boolean));classes.add('cv4-search-field');e.setAttribute('class',[...classes].join(' '));}})
 .on('#cv-social-header nav a[href*="artists"],#cv-marketplace-nav a[href*="artists"]',{element(e){e.remove();}})
 .on('#cv-social-header nav a[href*="circles"],#cv-marketplace-nav a[href*="circles"]',{element(e){if(clean(u.pathname)==='/artist/')e.setAttribute('aria-current','page');}})
 .on('link[rel~="icon"],link[rel="apple-touch-icon"]',{element(e){e.remove();}})
 .on('head',{element(e){e.append('<link rel="icon" type="image/png" sizes="48x48" href="/favicon.png?v=20261028-v1"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20261028-v1"><style data-cv-workshops>'+WORKSHOP_STYLE+'</style>'+((people||featured||isWorkshops)?'<style data-cv-people>'+CIRCLE_STYLE+(featured?'.cv-home-intro{margin:0 0 24px;max-width:780px}.cv-home-intro h1{font-size:clamp(30px,4vw,46px)!important;line-height:1.15!important;margin:0 0 12px!important}.cv-home-intro p{font-size:16px;line-height:1.6;margin:0;max-width:66ch}':'')+(people?CONSTELLATION_STYLE:'')+'</style>':'')+(people?'<script defer src="'+CLIENT_BASE+'circles-directory.js"></script>':'')+(isWorkshops?'<script defer src="'+CLIENT_BASE+'workshops.js"></script>':''),{html:true});}})
 .on('head',{element(e){e.append('<style data-cv-search-sizing>'+SEARCH_STYLE+'</style><style data-cv-artwork-glass>'+ORBIT_STYLE+'</style><script defer src="'+CLIENT_BASE+'artwork-experience.js"></script><script type="application/json" id="cv-artwork-context">'+JSON.stringify(artworkContext).replaceAll('<','\\u003c')+'</script>',{html:true});}})
 .on('head',{element(e){if(isEvent||isWorkshops)e.append('<script defer src="'+CLIENT_BASE+'registrations.js"></script>',{html:true});}})
 .on('.cv-feed-page',{element(e){if(featured)e.prepend('<section class="cv-home-intro"><h1>Your Communiverse</h1><p>We connect culture, commerce and community. Discover artists and artisans, learn their craft, and collect their work.</p></section>'+featuredArtist(),{html:true});}})
 .on('h1.cv-visually-hidden',{element(e){if(featured)e.remove();}})
 .on('#cv-feed-initial',{element(e){if(home)e.setInnerContent(JSON.stringify(home).replaceAll('<','\\u003c'),{html:true});}})
 .on('#cv-feed',{element(e){if(home)e.setInnerContent(home.items.map((item,i)=>rewrite(homeTile(item),u.origin)+(i===2?workshopPromo(0):i===10?workshopPromo(1):'')).join(''),{html:true});}})
 .on('#cv-feed',{element(e){if(featured)e.after(discoveryData(),{html:true});}})
 .on('#cv-circles-page h1',{element(e){e.setInnerContent('Discover clubs');}})
 .on('footer a[href^="mailto:hello@communiverseclubs.com"]',{element(e){e.setInnerContent('hello@communiverseclubs.com');}})
 .on('footer a[href="/works/"],footer a[href="/communiverse/works/"]',{element(e){e.setInnerContent('Works');}})
 .on('nav[aria-label="Footer navigation"]',{element(e){e.append('<a href="/workshops/">Office workshops</a>',{html:true});}})
 .on('#cv-artist-profile',{element(e){if(u.searchParams.get('id')==='artist-sophiko')e.after('<aside class="cv-artist-workshop-note"><h2>Paint with Sophiko.</h2><p>Bring an aura painting workshop to your office.</p><a class="cv-workshop-button" href="/workshops/?session=aura-painting#enquire">Plan a team workshop</a></aside>',{html:true});}})
 .on('.cv-plug',{element(e){if(people)e.replace(directoryHTML(people,u,selectedCircleHTML(people.find(p=>p.slug===u.searchParams.get('person')),u.searchParams.get('art'))),{html:true});}})
 .on('#cv-focus-data',{element(e){if(people)e.remove();}})
 .on('link[rel="stylesheet"]',{element(e){if(people&&/\/_public\/2026100[678]-plug-/.test(e.getAttribute('href')||''))e.remove();}})
 .on('script[src]',{element(e){if(people&&/(?:\/circles\.js|\/__cvsearch_v4(?:_plug_fix)?\.js|\/__cvprofile_20261013_v11\.js|\/__cvmobile_20261013_v8\.js)(?:\?|$)/.test(e.getAttribute('src')||''))e.remove();}})
 .on('script[src],link[as="script"]',{element(e){const attr=e.tagName==='script'?'src':'href',src=e.getAttribute(attr)||'';if(/\/__cvfix_v2\.js(?:[?#]|$)/.test(src)){e.remove();return;}if(technical(src)&&/\.js(?:[?#]|$)/.test(src)&&!src.startsWith(CLIENT_BASE))e.setAttribute(attr,CLIENT_BASE+clean(src).slice(1));}})
 .on('link[rel="canonical"],meta[property="og:url"]',{element(e){e.setAttribute(e.tagName==='link'?'href':'content',canonical(request.url));}})
 .on('#plan-session',{element(e){const q=new URLSearchParams(u.search);q.set('cv_account','1');e.setInnerContent('<h2>Plan a group session</h2><p>Choose a time and we will help you arrange your session.</p><a class="cv-button" href="'+OLD+internal(clean(u.pathname))+'?'+escape(q.toString())+'#plan-session">Plan a session</a>',{html:true});}})
 .transform(new Response(html,{status:response.status,headers:h})),request);
}
const browserNavigation=`(()=>{'use strict';window.CV_URLS=Object.freeze(JSON.parse(document.getElementById('cv-runtime-config')?.textContent||'{}'));const artistRoutes=${JSON.stringify(artistSlugs)},old='https://espacios.me',prefix='/communiverse',protectedPath=/^\\/(workspace|sign-in|signin|join|profile|onboarding|confirm|apply|host|auth|account|events\\/host)(\\/|$)/;function target(value){let u;try{u=new URL(value,location.href)}catch{return value}if(![location.origin,old].includes(u.origin))return value;if(u.origin===old&&u.searchParams.get('cv_account')==='1')return value;const p=u.pathname.replace(/^\\/communiverse(?=\\/|$)/,'')||'/';if((p==='/artist/'||p==='/artist')&&artistRoutes[u.searchParams.get('id')]){u.pathname='/artists/'+artistRoutes[u.searchParams.get('id')]+'/';u.searchParams.delete('id');return u.pathname+u.search+u.hash}if(p==='/artists/'||p==='/artists'){u.pathname='/circles/';u.searchParams.set('filter','artists');return u.pathname+u.search+u.hash}if(p.startsWith('/account/'))return value;if(protectedPath.test(p))return old+prefix+p+u.search+u.hash;if(u.origin===old&&u.pathname.startsWith(prefix+'/')&&!/^\\/(api(?:\\/|$)|_)/.test(p))return p+u.search+u.hash;return value}function update(root){for(const a of root.querySelectorAll('#cv-social-header nav a,#cv-marketplace-nav a'))if(a.textContent.trim()==='Artists')a.remove();for(const e of root.querySelectorAll('a[href],form[action]')){const a=e.tagName==='FORM'?'action':'href',v=e.getAttribute(a),n=target(v);if(n!==v)e.setAttribute(a,n)}}document.addEventListener('DOMContentLoaded',()=>{update(document);new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1){if(n.matches('a[href],form[action]')){const a=n.tagName==='FORM'?'action':'href';n.setAttribute(a,target(n.getAttribute(a)))}update(n)}}).observe(document.body,{childList:true,subtree:true})});document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;const n=target(a.href);if(n.startsWith(old+prefix+'/')){e.preventDefault();e.stopImmediatePropagation();location.assign(n)}},true);})();`;
const application={async fetch(request,env,ctx){const u=new URL(request.url);
 env={...env,EMAIL:env.EMAIL||env.REGISTRATION_EMAIL};
 if(hosts.has(u.hostname)&&u.pathname==='/sitemap.xml')return sitemap();
 if(hosts.has(u.hostname)&&u.pathname.startsWith('/communiverse/_share/20261029-v1/')&&read(request.method))return env.ASSETS?env.ASSETS.fetch(request):error(404,'Image not found','This image is unavailable.');
 if(communiverseRequest(request)&&privateArtifactPath(u.pathname))return error(404,'Page not found','Explore Communiverse through the links below.');
 if(communiverseRequest(request)&&clean(u.pathname)==='/api/csp-report')return cspReport(request,env);
 if(hosts.has(u.hostname)&&u.pathname==='/.well-known/security.txt')return new Response(request.method==='HEAD'?null:securityText('https://communiverseclubs.com'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});
 if(hosts.has(u.hostname)&&u.pathname==='/robots.txt')return new Response(request.method==='HEAD'?null:robots(u.origin),{headers:{'Content-Type':'text/plain; charset=utf-8'}});
 if(u.pathname===CLIENT_BASE+'account-client.js')return new Response(request.method==='HEAD'?null:ACCOUNT_CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'_public/20261008-marketplace-1b-join.js')return new Response(request.method==='HEAD'?null:JOIN_LINKS,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'accessibility.js')return new Response(request.method==='HEAD'?null:ACCESSIBILITY_CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'form-support.js')return new Response(request.method==='HEAD'?null:FORM_CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'record-actions.js')return new Response(request.method==='HEAD'?null:RECORD_ACTIONS,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'discovery-ui.js')return new Response(request.method==='HEAD'?null:DISCOVERY_UI,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'legal-links.js')return new Response(request.method==='HEAD'?null:LEGAL_CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'identity.js')return new Response(request.method==='HEAD'?null:IDENTITY_CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 const isLegacy=['espacios.me','www.espacios.me'].includes(u.hostname)&&u.pathname.startsWith(PREFIX+'/');
 if(request.method==='POST'&&isLegacy&&FORM_ACTIONS[formEndpoint(request)]&&!['workshop-enquiry','event-rsvp','report'].includes(formEndpoint(request))){try{const b=await readRegistrationBody(request.clone()),blocked=await guardForm(request,env,b);if(blocked)return blocked;request=withoutChallengeToken(request,b);}catch(e){return Response.json({error:e.status?e.message:'Check your form details.'},{status:e.status||400,headers:headers()});}}
 if(request.method==='POST'&&isLegacy&&formEndpoint(request)==='report')return reportAPI(request,env);
 if(!hosts.has(u.hostname)){
  if(['espacios.me','www.espacios.me'].includes(u.hostname)&&/^\/communiverse\/api\/account\/(login|register|credentials|recover)\/?$/.test(u.pathname)){const response=await updatedAccountAPI(request,env);if(response.status===201)background(ctx,observeRegistration(request,response.clone(),env,ctx));return response;}

  // Public page redirects are activated only after destination acceptance.
  const pageMove=legacyPublicRedirect(request,env.PUBLIC_DOMAIN_REDIRECTS);
  if(pageMove)return new Response(null,{status:pageMove.status,headers:{...headers(),Location:pageMove.location,Vary:'Cookie'}});
  if(request.method==='POST'&&notificationPaths.has(u.pathname.replace(/\/$/,''))){
   const observation=request.clone();let body;
   if(['/communiverse/api/booking/request','/communiverse/api/session-requests'].includes(u.pathname.replace(/\/$/,'')))try{body=await readRegistrationBody(observation)}catch{}
   const response=await retained.fetch(request,env,ctx);
   if(response.status===201)background(ctx,observeRegistration(request,response.clone(),env,ctx,body));
   return response;
  }
  const response=await retained.fetch(request,env,ctx);
  if(/^\/communiverse\/api\/(account|auth|workspace)\/logout\/?$/.test(u.pathname)&&response.ok){for(const name of ['__Host-cv-oauth','__Host-cv-onboard','__Host-cv-auth-flow'])response.headers.append('Set-Cookie',name+'=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0');}
  return legalSupport(await identityResponse(response,request),request);
 }
 if(u.protocol==='http:'||u.hostname==='www.communiverseclubs.com'){u.protocol='https:';if(u.hostname.startsWith('www.'))u.hostname='communiverseclubs.com';return redirect(u.href,308);}
 const p=clean(u.pathname),origin=request.headers.get('Origin');
 const accountResponse=await brandedAccountRoute(request,env,ctx);if(accountResponse)return accountResponse;
 if(origin&&origin!==u.origin)return new Response('Request origin denied',{status:403,headers:headers()});
 if(['/api/event-rsvp','/api/workshop-enquiry'].includes(p))return publicRegistration(request,env,ctx,refreshedEvents);
 if(!read(request.method)||request.headers.get('Upgrade'))return Response.json({error:'Sign in to continue.',signInUrl:OLD+PREFIX+'/sign-in/'},{status:request.method==='OPTIONS'?403:401,headers:headers()});
 if(accountPath(p))return redirect(OLD+internal(p)+u.search,302);
 if(['/circles/','/plug/'].includes(p)&&u.searchParams.has('work')&&artworkContext[u.searchParams.get('work')]){const work=u.searchParams.get('work');u.searchParams.set('art',work);u.searchParams.delete('work');if(!u.searchParams.has('person'))u.searchParams.set('person',artworkContext[work].artist);return redirect(u.href,302);}
 if(['/circles/','/plug/'].includes(p)){const art=u.searchParams.get('art')||u.searchParams.get('work');if(art&&(!artworkContext[art]||(u.searchParams.has('person')&&u.searchParams.get('person')!==artworkContext[art].artist)))return error(404,'Artwork not found','Explore the works in Communiverse.');}
 if(p==='/artist/'||p==='/artist'){const id=u.searchParams.get('id');if(!artistById.has(id))return error(404,'Artist not found','Explore the artists in Communiverse.');u.pathname=artistPath(id);u.searchParams.delete('id');return redirect(u.href,301);}
 const recordRoute=p.match(/^\/artists\/([^/]+)(?:\/works\/([^/]+))?\/?$/);if(recordRoute){const id=artistIdFromSlug(recordRoute[1]),work=recordRoute[2]?workIdFromSlugs(id,recordRoute[2]):null;if(!id||(recordRoute[2]&&!work))return error(404,'Page not found','Explore Communiverse through the links below.');if(!u.pathname.endsWith('/')){u.pathname+='/';return redirect(u.href,301);}return adapt(work?workPage(work):artistPage(id),request);}
 if(['/works','/works/'].includes(p)){if(u.searchParams.has('artist')&&!artistById.has(u.searchParams.get('artist')))return error(404,'Artist not found','Explore the artists in Communiverse.');if(p==='/works'){u.pathname='/works/';return redirect(u.href,301);}return adapt(worksPage(u),request);}
 if(p==='/api/artists'&&u.searchParams.has('id')&&!artistById.has(u.searchParams.get('id')))return Response.json({error:'Artist not found.'},{status:404,headers:headers()});
 if(p==='/api/item'&&!artworkContext[u.searchParams.get('id')])return Response.json({error:'Artwork not found.'},{status:404,headers:headers()});
 if(p==='/event/'){const checkURL=new URL(request.url);checkURL.pathname='/api/event';const result=await programmeResponse(new Request(checkURL),r=>guest(r,env,ctx,internal('/api/event')));const data=await result.json();if(!result.ok||data.event?.id!==u.searchParams.get('id'))return error(404,'Event not found','Explore the events in Communiverse.');return adapt(eventRecordPage(data.event),request);}
 if(p==='/gallery/'){const check=await guest(request,env,ctx,internal(p==='/event/'?'/api/event':'/api/galleries'));const data=await check.json();if(!check.ok||!(p==='/event/'?data.event?.id===u.searchParams.get('id'):data.galleries?.some(g=>g.id===u.searchParams.get('id'))))return error(404,'Page not found','Explore Communiverse through the links below.');}
 if(['/clubs/','/communities/'].includes(p)&&u.searchParams.has('circle')){const checkURL=new URL(request.url);checkURL.search='?id='+encodeURIComponent(u.searchParams.get('circle'));const check=await guest(new Request(checkURL),env,ctx,internal('/api/circles'));if(!check.ok||(await check.json()).circle?.id!==u.searchParams.get('circle'))return error(404,'Club not found','Explore the clubs in Communiverse.');}
 if(p==='/ambassadors/')return adapt(ambassadorsPage(),request);
 if(p==='/api/circles')return adapt(await clubDiscovery(request,r=>guest(r,env,ctx,internal('/api/circles'))),request);
 if(['/plug/','/communities/'].includes(p)){u.pathname=p==='/plug/'?'/circles/':'/clubs/';return redirect(u.href,301);}
 if(p==='/discover/'){u.pathname='/';return redirect(u.href,301);}
 if(p==='/api/feed'&&u.searchParams.get('surface')==='home')return adapt(await homeFeed(request,r=>guest(r,env,ctx,internal('/api/feed'))),request);
 if(['/privacy/','/terms/'].includes(p))return adapt(legalPage(p),request);
 if(p==='/workshops')return redirect(u.origin+'/workshops/'+u.search,308);
 if(p==='/workshops/')return adapt(workshopResponse(request),request);
 if(p==='/favicon.png'||p==='/favicon.ico'||p==='/apple-touch-icon.png')return new Response(request.method==='HEAD'?null:p==='/apple-touch-icon.png'?TOUCH_ICON:FAVICON,{headers:{...headers(),'Content-Type':'image/png','Cache-Control':'public,max-age=300'}});
 if(p.replace(/\/$/,'')==='/artists')return redirect(link(u.href,u.origin),308);
 const person=p.match(/^\/circles\/person\/([^/]+)\/?$/);if(person&&peopleAliases[person[1]]){const q=new URLSearchParams(u.search);q.set('person',peopleAliases[person[1]]);return redirect(u.origin+'/circles/?'+q,302);}
 const alias={'/people':'/circles/?filter=people','/ambassadors':'/circles/?filter=ambassadors'}[p.replace(/\/$/,'')];if(alias){const to=new URL(alias,u.origin);for(const[k,v]of u.searchParams)if(!to.searchParams.has(k))to.searchParams.append(k,v);return redirect(to.href,301);}
 if(u.pathname===CLIENT_BASE+'registrations.js')return new Response(request.method==='HEAD'?null:REGISTRATION_CLIENT,{headers:{...headers(),'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'navigation.js')return new Response(request.method==='HEAD'?null:browserNavigation,{headers:{...headers(),'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'circles-directory.js')return new Response(request.method==='HEAD'?null:CIRCLE_CLIENT.replace('/* CIRCLE_LAYOUT */',circleLayout.toString()).replace('/* CIRCLE_SCENE */',circleScene.toString()),{headers:{...headers(),'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'artwork-experience.js')return new Response(request.method==='HEAD'?null:ARTWORK_CLIENT,{headers:{...headers(),'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'feed-discovery.js')return new Response(request.method==='HEAD'?null:FEED_DISCOVERY.replace('/* DAILY_INDEX */',featuredArtistIndex.toString()),{headers:{...headers(),'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname===CLIENT_BASE+'workshops.js')return new Response(request.method==='HEAD'?null:WORKSHOP_CLIENT.replace('/* ENQUIRY_BUILDER */',workshopEnquiryMail.toString()),{headers:{...headers(),'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=31536000,immutable'}});
 if(u.pathname.startsWith(CLIENT_BASE)){
  const path=PREFIX+'/'+u.pathname.slice(CLIENT_BASE.length);if(!technical(path)||!path.endsWith('.js'))return error(404,'Page not found','Explore Communiverse through the links below.');
  const r=await guest(request,env,ctx,path);if(!r.ok||!/javascript/.test(r.headers.get('Content-Type')||''))return adapt(r,request);
  const h=adjusted(r,u.origin);h.set('Cache-Control','public,max-age=31536000,immutable');return new Response(request.method==='HEAD'?null:rewrite(await r.text(),u.origin),{status:r.status,headers:h});
 }
 if(['/api/event','/api/events'].includes(p))return adapt(await programmeResponse(request,r=>guest(r,env,ctx,internal(p))),request);
 if(p.startsWith('/api/')){const endpoint=p.slice(5).replace(/\/$/,'');if(guestAPIs.has(endpoint))return Response.json(guestAPIs.get(endpoint),{headers:headers()});if(!publicAPIs.has(endpoint))return Response.json({error:'Sign in to continue.',signInUrl:OLD+PREFIX+'/sign-in/'},{status:401,headers:headers()});return adapt(await guest(request,env,ctx,internal(p)),request);}
 if(technical(p)){if(!u.pathname.startsWith(PREFIX+'/'))return redirect(u.origin+(p.endsWith('.js')?CLIENT_BASE+p.slice(1):internal(p))+u.search,308);return adapt(await guest(request,env,ctx,internal(p)),request);}
 if(p==='/robots.txt')return new Response(u.origin===PREVIEW?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /workspace/\nDisallow: /communiverse/api/\nSitemap: ${ORIGIN}/sitemap.xml\n`,{headers:{...headers(),'Content-Type':'text/plain'}});
 if(p==='/sitemap.xml'){const list=['/','/discover/','/events/','/clubs/','/circles/','/exhibitions/wetex-2026/','/events/avid-learning-poetry-night/','/workshops/'];for(const id of ['artist-tamer-karam','artist-cristina-gabriela','artist-chandni-padia','artist-ms-petunya','artist-sophiko','artist-gemma-gallagher'])list.push('/artist/?id='+id);return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+list.map(path=>'<url><loc>'+escape(ORIGIN+path)+'</loc></url>').join('')+'</urlset>',{headers:{...headers(),'Content-Type':'application/xml'}});}
 if(['/for-founders','/for-brands','/for-startups'].includes(p.replace(/\/$/,'')))return error(410,'This page has retired','Find artists, exhibitions and clubs in the new Communiverse.');
 if(p.replace(/\/$/,'')==='/makers'){const q=new URLSearchParams(u.search);q.set('filter','artists');return redirect(u.origin+'/circles/?'+q,308);}
 if(p!=='/'&&(!pages.has(p.split('/')[1])||(/^\/(?:privacy|terms|workshops|exhibitions)\/?$/.test(p))||(p.split('/').filter(Boolean).length>1&&!['/exhibitions/wetex-2026/','/events/avid-learning-poetry-night/'].includes(p.endsWith('/')?p:p+'/'))))return error(404,'Page not found','Explore Communiverse through the links below.');
 if(p!==u.pathname||!p.endsWith('/'))return redirect(u.origin+p+(p.endsWith('/')?'':'/')+u.search,308);
 try{return await adapt(await guest(request,env,ctx,internal(p)),request,r=>guest(r,env,ctx,internal('/api/feed')));}catch(e){console.error('Public domain read unavailable',e.message);return error(503,'We’ll be right back','This part of Communiverse is temporarily unavailable. Please try again shortly.');}
}};

export default {async fetch(request,env,ctx){return securityPolicy(seoSupport(accessibilitySupport(await accountSupport(formSupport(await application.fetch(request,env,ctx),request,env),request,env),request),request),request,env);}};
