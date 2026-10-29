import {showEventPromotion} from './event-lifecycle.mjs';
import EVENT_BANNERS from './event-banners-client.txt';
import PRE_FRAMING_CLIENT from './pre-framing-artist-client.txt';
import PRE_FRAMING_EVENTS from './pre-framing-events-client.txt';
import {logout,logoutPaths} from './session-logout.mjs';
import SESSION from './session-client.txt';
import PREVIOUS_PORTRAIT_CLIENT from './previous-portrait-client.txt';
import {catalogueDatabase,records as curatedRecords} from './curated-catalogue.mjs';
import {api as localCatalogueAPI} from './read-feed-social-backend.js';
import retained from './dubai-scroll-gateway.mjs';
import CLIENT from './artist-portrait-client.txt';
import PRE_PORTRAIT_CLIENT from './pre-portrait-cards-client.txt';
import PRE_PORTRAIT_CIRCLES from './pre-portrait-first-render-circles.txt';
import {PORTRAITS,PORTRAIT_BASE,withArtistPortrait,portraitFor,portraitAttributes} from './artist-portrait-policy.mjs';
import LEGACY_CLIENT from './first-render-client.txt';
import CARD_CSS from './cards.css';
import EVENTS from './first-render-events.txt';
import CIRCLES from './first-render-circles.txt';
import BOOT from './first-render-boot.txt';
import CSS from './first-render.css';
import {artistProfile,esc,tile} from './first-render-templates.mjs';
const ROOT='/communiverse/',RELEASE='events-framing-20261027-v6',BASE=ROOT+'_render/'+RELEASE+'/';
const assets=new Map([['event-banners.js',EVENT_BANNERS],['session.js',SESSION],['boot.js',BOOT],['client.js',CLIENT],['events.js',EVENTS],['circles.js',CIRCLES]]);
const LEGACY=ROOT+'_render/first-render-20261022-v1/';
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const searchIcon='<svg class="cv4-search-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 5 5"/></svg>';
const searchInputs='#cv-feed-search,#cv-artist-search,#cv-product-search,#cv-events-filters input[type=search][name=q],#cv-circle-filters input[type=search][name=q]';
function addClass(e,name){e.setAttribute('class',((e.getAttribute('class')||'')+' '+name).trim())}
async function publicFetch(request,env,ctx){const p=new URL(request.url).pathname.replace(/\/$/,'');return request.method==='GET'&&[ROOT+'api/artists',ROOT+'api/item',ROOT+'api/comments'].includes(p)?localCatalogueAPI(request,env,ctx):retained.fetch(request,env,ctx)}
function personFor(a){return {slug:a.id,name:a.title,role:a.primaryCraft||a.organizer||'Visual artist',location:a.city||'',category:'artists',group:'Artists',eyebrow:'Communiverse',summary:a.description||'',more:a.description||'',focus:a.tags||[],image:a.image,portrait:a.portrait,profileUrl:ROOT+'artist/?id='+encodeURIComponent(a.id),galleryLabel:a.title+' · Work',socials:a.socials||[],sources:a.sources||[],films:[],workPhotos:curatedRecords.filter(w=>w.artist===a.id&&w.kind==='work').map(w=>({src:w.image,alt:w.title,title:w.title}))}}
async function dataFor(request,path,env,ctx){const u=new URL(ROOT+'api/'+path,request.url);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6000);try{const r=await publicFetch(new Request(u,{headers:request.headers,signal:controller.signal}),env,ctx);if(!r.ok)throw Error('Profile data unavailable');const d=await r.json();if(d.artists)d.artists=d.artists.map(withArtistPortrait);return d}finally{clearTimeout(timeout)}}
export default {async fetch(request,env,ctx){
 env={...env,COMMUNIVERSE_DB:catalogueDatabase(env.COMMUNIVERSE_DB)};
 const url=new URL(request.url),path=url.pathname;
 if(logoutPaths.has(path.replace(/\/$/,'')))return logout(request,env,ctx);
 if(path.startsWith(ROOT+'_render/portraits-session-20261027-v5/')){const key=path.split('/').pop(),old=key==='client.js'?PRE_FRAMING_CLIENT:key==='events.js'?PRE_FRAMING_EVENTS:assets.get(key);if(old&&['GET','HEAD'].includes(request.method))return new Response(request.method==='HEAD'?null:old,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public,max-age=31536000,immutable'}})}
 if(path.startsWith(ROOT+'_render/portraits-20261027-v4/')){const key=path.split('/').pop(),old=key==='client.js'?PREVIOUS_PORTRAIT_CLIENT:key==='events.js'?PRE_FRAMING_EVENTS:assets.get(key);if(old&&['GET','HEAD'].includes(request.method))return new Response(request.method==='HEAD'?null:old,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public,max-age=31536000,immutable'}})}
 if(['GET','HEAD'].includes(request.method)&&path.startsWith(PORTRAIT_BASE)){
  if(path.endsWith('.svg')){const name=decodeURIComponent(path.slice(PORTRAIT_BASE.length,-4)).replace(/^artist-/,'').split('-').slice(0,2).map(s=>s[0]?.toUpperCase()||'').join('');return new Response(request.method==='HEAD'?null:'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#e3e7ef"/><text x="256" y="282" text-anchor="middle" fill="#52617b" font-family="sans-serif" font-size="116">'+esc(name)+'</text></svg>',{headers:{'content-type':'image/svg+xml','cache-control':'public,max-age=86400'}})}
  return new Response('Portrait not found',{status:404});
 }
 if(path.startsWith(ROOT+'_render/cards-20261027-v3/')){const key=path.split('/').pop(),old=key==='client.js'?PRE_PORTRAIT_CLIENT:key==='circles.js'?PRE_PORTRAIT_CIRCLES:key==='events.js'?PRE_FRAMING_EVENTS:assets.get(key);if(old)return new Response(request.method==='HEAD'?null:old,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public,max-age=31536000,immutable'}})}
 const asset=path.startsWith(BASE)?assets.get(path.slice(BASE.length)):path.startsWith(LEGACY)?(path.slice(LEGACY.length)==='client.js'?LEGACY_CLIENT:path.slice(LEGACY.length)==='events.js'?PRE_FRAMING_EVENTS:assets.get(path.slice(LEGACY.length))):null;
 if(['GET','HEAD'].includes(request.method)&&asset)return new Response(request.method==='HEAD'?null:asset,{headers:{'content-type':'text/javascript; charset=utf-8','cache-control':'public,max-age=31536000,immutable','x-content-type-options':'nosniff'}});
 const isProfile=request.method==='GET'&&path===ROOT+'artist/'&&url.searchParams.has('id');
 const id=url.searchParams.get('id'),artistKey='artists?id='+encodeURIComponent(id),worksKey='feed?artist='+encodeURIComponent(id);
 // Fetch the current profile in parallel with its shell. No catalogue copy or shared user cache.
 const profileData=isProfile?Promise.all([dataFor(request,artistKey,env,ctx),dataFor(request,worksKey,env,ctx)]).catch(()=>null):Promise.resolve(null);
 const extraPeopleData=request.method==='GET'&&[ROOT+'circles/',ROOT+'plug/'].includes(path)?dataFor(request,'artists',env,ctx).catch(()=>null):Promise.resolve(null);
 const response=await publicFetch(request,env,ctx);
 if(request.method==='GET'&&[ROOT+'api/artists',ROOT+'api/item'].includes(path)&&response.ok){const d=await response.json();if(d.artists)d.artists=d.artists.map(withArtistPortrait);if(d.artistProfile)d.artistProfile=withArtistPortrait(d.artistProfile);const h=new Headers(response.headers);for(const k of ['content-length','content-encoding','etag'])h.delete(k);h.set('cache-control','no-store');return new Response(JSON.stringify(d),{status:response.status,headers:h})}
 if(request.method!=='GET'||!response.ok||!path.startsWith(ROOT)||!response.headers.get('content-type')?.includes('text/html'))return response;
 const html=await response.text();if(!html.includes('id="cv-social-header"'))return new Response(html,response);
 const [artists,works]=await profileData||[],artist=artists?.artists?.[0];
 const focusMatch=html.match(/<script[^>]+id="cv-focus-data"[^>]*>([\s\S]*?)<\/script>/),people=focusMatch?JSON.parse(focusMatch[1]).map(p=>p.category==='artists'?withArtistPortrait(p):p):[];
 const extraPeople=(await extraPeopleData)?.artists?.filter(a=>curatedRecords.some(r=>r.id===a.id&&r.kind==='artist')&&!people.some(p=>p.slug===a.id)).map(personFor)||[];people.push(...extraPeople);const bySlug=new Map(people.map(p=>[p.slug,p]));
 const aliases={all:'communiverse',team:'cool-kids',artist:'artists',founders:'artists',design:'artisans',dubai:'artisans'};let filter=url.searchParams.get('filter')||'communiverse';filter=aliases[filter]||filter;if(!['communiverse','cool-kids','ambassadors','artists'].includes(filter))filter='communiverse';
 const seed=artist?{[artistKey]:artists,...(works?{[worksKey]:works}:{})}:{};
 const headers=new Headers(response.headers);for(const key of ['content-length','content-encoding','etag','last-modified'])headers.delete(key);headers.set('cache-control','no-store');headers.set('x-communiverse-first-render',RELEASE);
 let rewrite=new HTMLRewriter()
 .on('head',{element(e){e.append('<script defer src="'+BASE+'event-banners.js"></script><script defer src="'+BASE+'session.js"></script>'+'<style data-cv-first-render>'+CSS+CARD_CSS+'</style><script src="'+BASE+'boot.js"></script>'+(artist?'<script type="application/json" id="cv-first-data">'+json(seed)+'</script>':''),{html:true})}})
 .on('script[src]',{element(e){const src=(e.getAttribute('src')||'').split('?')[0];if(src===ROOT+'_brand/20261020-v21/clubs.js')e.setAttribute('src',BASE+'client.js');if(src===ROOT+'_browse/dubai-scroll-20261022-v1/events.js')e.setAttribute('src',BASE+'events.js');if(src===ROOT+'_responsive/20261022-v25/circles.js')e.setAttribute('src',BASE+'circles.js');if(src===ROOT+'_public/20261007-plug-team-2.js')e.remove()}})
 .on('[data-event-banner]',{element(e){if(!showEventPromotion({end:e.getAttribute('data-event-end'),endAt:e.getAttribute('data-event-end-at'),timezone:e.getAttribute('data-event-timezone')}))e.remove()}})
 .on('#cv-ws-app .cv-ws-heading .cv-ws-toolbar',{element(e){e.append('<button class="cv-quiet-button cv-workspace-signout" type="button" data-ws-logout>Sign out</button>',{html:true})}})
 .on('.cv-feed-controls,#cv-circle-filters,.cv-search-line',{element(e){addClass(e,'cv4-toolbar')}})
 .on('.cv-feed-search',{element(e){addClass(e,'cv4-search-field')}})
 .on(searchInputs,{element(e){e.before('<div class="cv4-search-inner">'+searchIcon,{html:true});e.after('</div>',{html:true});e.setAttribute('data-cv4-unified','yes')}})
 .on('#cv-artists,#cv-events,#cv-circles',{element(e){e.setAttribute('data-cv-first-list','');e.setAttribute('data-cv-first-pending','');e.setAttribute('aria-busy','true')}})
 .on('#cv-artists-more,#cv-events-more,#cv-circles-more',{element(e){e.setAttribute('hidden','')}});
 if(focusMatch&&extraPeople.length)rewrite=rewrite.on('.cv-plug .stage',{element(e){e.append(extraPeople.map(p=>'<a class="node" data-slug="'+esc(p.slug)+'" data-name="'+esc(p.name)+'" data-score="0" data-facets="all artist" href="'+esc(p.profileUrl)+'"'+(filter!=='communiverse'&&filter!=='artists'?' data-cv-initial-hidden':'')+'><img '+portraitAttributes(p.portrait,'(max-width:700px) 176px,240px')+' alt="" loading="lazy"><span class="cap"><b>'+esc(p.name)+'</b><small>'+esc(p.role)+'</small></span></a>').join(''),{html:true})}});
 if(focusMatch)rewrite=rewrite.on('#cv-focus-data',{element(e){e.setInnerContent(json(people),{html:true})}})
 .on('.cv-plug .filters [data-filter]',{element(e){e.setAttribute('aria-pressed',String(e.getAttribute('data-filter')===filter))}})
 .on('.cv-plug .stage',{element(e){e.before('<div class="cv-plug-browse cv4-toolbar"><label class="cv4-search-field">Find your people<div class="cv4-search-inner">'+searchIcon+'<input type="search" maxlength="80" placeholder="Name, craft or city" aria-label="Search people"></div></label><div><button type="button" data-plug-prev hidden>Previous</button><span role="status" data-plug-page></span><button type="button" data-plug-next hidden>Next</button></div></div>',{html:true})}})
 .on('.cv-plug .stage>.node',{element(e){const p=bySlug.get(e.getAttribute('data-slug'));e.removeAttribute('style');e.setAttribute('class',(e.getAttribute('class')||'').replace(/\bhero\b/g,'').trim());if(!p||filter!=='communiverse'&&p.category!==filter)e.setAttribute('data-cv-initial-hidden','')}})
 .on('.cv-plug noscript',{element(e){e.replace('<noscript><p>Select a portrait to view a profile, or <a href="/communiverse/artists/">browse artists</a>.</p></noscript>',{html:true})}});
 for(const [portraitId,p]of Object.entries(PORTRAITS))rewrite=rewrite.on('a[href="/communiverse/artist/?id='+portraitId+'"] img,.node[data-slug="'+portraitId+'"] img',{element(e){const old=e.getAttribute('src')||'';if(old&&!old.includes(p.previousHash)&&!old.startsWith(PORTRAIT_BASE))return;e.setAttribute('src',p.url);e.setAttribute('srcset',p.variants.map(v=>v.url+' '+v.width+'w').join(', '));e.setAttribute('sizes','(max-width:700px) 176px,240px');e.setAttribute('width',String(p.width));e.setAttribute('height',String(p.height));e.setAttribute('style','object-position:'+p.position);e.setAttribute('data-artist-portrait','photo')}});
 if(isProfile)rewrite=rewrite
 .on('#cv-artist-profile',{element(e){if(artist){e.setInnerContent(artistProfile(artist),{html:true});e.setAttribute('data-cv-server-profile','true')}else{e.setInnerContent('<div></div><div><h1>Artist profile</h1><p role="status">Loading their work…</p></div>',{html:true});}}})
 .on('#cv-artist-works',{element(e){if(works)e.setInnerContent(works.items.filter(i=>i.artist===id).map(tile).join(''),{html:true})}})
 .on('#plan-session',{element(e){if(!artist||artist.kind==='ambassador'||artist.canHost===false)e.setAttribute('hidden','')}})
 .on('title',{element(e){if(artist)e.setInnerContent(artist.title+' · '+(artist.kind==='ambassador'?'Ambassador':'Artist')+' | Communiverse')}});
 return rewrite.transform(new Response(html,{status:response.status,statusText:response.statusText,headers}));
}};
