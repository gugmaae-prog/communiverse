import previous from './plug-orbits-entry.js';
import STYLE from './market.css';
import SCRIPT from './market.txt';
import JOIN_LINKS from './market-join-links.txt';
import FOCUS from './market-focus.txt';
import ORBITS from './market-orbits.css';
import IMAGES from './market-images.js';
import RATE_SNAPSHOT from './market-rates.txt';
import {ARTISTS,ITEMS,CATEGORIES,CURRENCIES,CITIES,SESSION_PRICES,RELEASE,PREFIX} from './market-data.js';
import {home,join,confirmation,workshops,artistExtras,h,serialize,disclosure} from './market-views.js';
import {signup,confirm,publicMembers,sessionRequest} from './market-members.js';
const snapshot=JSON.parse(RATE_SNAPSHOT);
const PATCH_RELEASE='20261008-marketplace-1b';
const JOIN_ASSET='/communiverse/_public/20261008-marketplace-1b-join.js';
const readMethods=new Set(['GET','HEAD']);
function asset(body,type,request){return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}})}
async function priceResponse(currency,people,ctx){
 if(!CURRENCIES.includes(currency))return Response.json({error:'Unsupported currency'},{status:400});
 const key=new Request('https://espacios.me/communiverse/_rates-cache/v1');let rates=snapshot.rates,updated=snapshot.updated;
 try{let r=await caches.default.match(key);if(!r){const upstream=await fetch('https://open.er-api.com/v6/latest/USD',{signal:AbortSignal.timeout(3000)});if(upstream.ok){const d=await upstream.json();if(d.result==='success'&&CURRENCIES.every(c=>Number.isFinite(d.rates[c])&&d.rates[c]>0)){r=Response.json({rates:Object.fromEntries(CURRENCIES.map(c=>[c,d.rates[c]])),updated:d.time_last_update_utc},{headers:{'Cache-Control':'public,max-age=86400'}});ctx.waitUntil(caches.default.put(key,r.clone()));}}}if(r){const d=await r.json();rates=d.rates;updated=d.updated;}}catch{}
 const values=[...new Set([...ITEMS.map(i=>i.price),...SESSION_PRICES,...SESSION_PRICES.map(p=>p*people)])];
 return Response.json({currency,quotes:Object.fromEntries(values.map(v=>[v,v*rates[currency]])),updated:new Date(updated).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})},{headers:{'Cache-Control':'public,max-age=3600'}});
}
const nav='<a href="/communiverse/">Discover</a><a href="/communiverse/plug/?filter=artists">Artists</a><a href="/communiverse/workshops/">Workshops</a><a href="/communiverse/plug/">Plug</a>';
export default {async fetch(request,env,ctx){
 const u=new URL(request.url),path=u.pathname.replace(/\/$/,'');
 if(!['espacios.me','www.espacios.me'].includes(u.hostname))return previous.fetch(request,env,ctx);
 if(path.startsWith('/communiverse/api/members')||path==='/communiverse/api/session-requests'||path==='/communiverse/api/prices'){
  try{
   if(path==='/communiverse/api/members'&&request.method==='POST')return await signup(request,env);
   if(path==='/communiverse/api/members'&&readMethods.has(request.method))return Response.json(request.method==='HEAD'?null:await publicMembers(env.COMMUNIVERSE_DB),{headers:{'Cache-Control':'no-store'}});
   if(path==='/communiverse/api/members/confirm'&&request.method==='POST')return await confirm(request,env);
   if(path==='/communiverse/api/session-requests'&&request.method==='POST')return await sessionRequest(request,env,ARTISTS);
   if(path==='/communiverse/api/prices'&&readMethods.has(request.method))return await priceResponse(u.searchParams.get('currency')||'USD',Math.max(1,Math.min(40,Math.floor(Number(u.searchParams.get('people')))||4)),ctx);
   return new Response('Method not allowed',{status:405});
  }catch(e){console.error('Communiverse request unavailable',e.code||'service_unavailable');return Response.json({error:'Unable to save right now. Please try again shortly.'},{status:503,headers:{'Cache-Control':'no-store'}})}
 }
 if(path===JOIN_ASSET)return readMethods.has(request.method)?asset(JOIN_LINKS,'application/javascript; charset=utf-8',request):new Response('Method not allowed',{status:405});
 const staticAsset=path===PREFIX+'.css'?[STYLE,'text/css; charset=utf-8']:path===PREFIX+'.js'?[SCRIPT,'application/javascript; charset=utf-8']:path===PREFIX+'-focus.js'?[FOCUS,'application/javascript; charset=utf-8']:null;
 if(staticAsset)return readMethods.has(request.method)?asset(...staticAsset,request):new Response('Method not allowed',{status:405});
 const image=IMAGES[path];if(image)return readMethods.has(request.method)?asset(image,'image/jpeg',request):new Response('Method not allowed',{status:405});
 const avatar=path.match(/^\/communiverse\/_public\/member-avatar\/([a-f0-9-]{36})\.svg$/);
 if(avatar&&readMethods.has(request.method)){const p=await env.COMMUNIVERSE_DB.prepare("SELECT first_name FROM cv_members WHERE id=? AND status='active'").bind(avatar[1]).first();if(!p)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#d7e7ff"/><stop offset="1" stop-color="#cfc3ff"/></linearGradient></defs><circle cx="120" cy="120" r="120" fill="url(#a)"/><text x="120" y="140" text-anchor="middle" font-family="Arial,sans-serif" font-size="72" fill="#263953">${h(Array.from(p.first_name).slice(0,2).join('').toUpperCase())}</text></svg>`,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
 const isHome=path==='/communiverse'||path==='/communiverse/discover',isJoin=path==='/communiverse/join'||/^\/communiverse\/apply\/(artist|belong|client|ambassador)$/.test(path),isConfirm=path==='/communiverse/confirm',isWorkshops=path==='/communiverse/workshops',isPlug=path==='/communiverse/plug',artist=ARTISTS.find(a=>a.profileUrl.replace(/\/$/,'')===path);
 if(!readMethods.has(request.method)||!path.startsWith('/communiverse'))return previous.fetch(request,env,ctx);
 const baseRequest=(isJoin||isConfirm||isWorkshops||path==='/communiverse/discover')?new Request(u.origin+'/communiverse/',request):request;
 const r=await previous.fetch(baseRequest,env,ctx);
 if(r.status!==200||!r.headers.get('Content-Type')?.includes('text/html'))return r;
 const headers=new Headers(r.headers);headers.set('X-Communiverse-Market',PATCH_RELEASE);headers.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>headers.delete(k));
 if(request.method==='HEAD'){await r.body?.cancel();return new Response(null,{headers});}
 let html=await r.text();
 // Remove repeated preview badges and misleading image alt labels. One collection note remains.
 html=html.replace(/<span\b[^>]*class="(?:sample-badge|cv-sample)"[^>]*>[\s\S]*?<\/span>/g,'').replace(/Artist names and images below are generated concept previews\./g,'').replace(/Fictional portrait of /g,'').replace(/Fictional preview/g,'').replace(/artist feature · fictional preview/g,'Artist feature');
 if(path==='/communiverse/contact'&&u.searchParams.get('intent')==='order'){
  const item=ITEMS.find(i=>i.id===u.searchParams.get('item')&&i.artist===u.searchParams.get('artist'));
  if(item){const re=/(<script\b[^>]*id="cv-enquiry-data"[^>]*>)([\s\S]*?)(<\/script>)/;html=html.replace(re,(_,a,b,c)=>{const context=JSON.parse(b);context.itemTitle=item.title+'\nGuide price: USD '+item.price+'\nMaterial: '+item.material+'\nSize: '+item.size;return a+serialize(context)+c});}
 }
 html=html.replace(/(<a\b[^>]*href=")(\/communiverse\/contact\/?(?:#contact)?)("[^>]*>)([\s\S]*?)(<\/a>)/gi,(_,a,url,b,inner,c)=>/\bjoin\s+(?:the\s+)?waitlist\b|^\s*waitlist\s*$/i.test(inner.replace(/<[^>]*>/g,'').trim())?a+'/communiverse/join/'+b+inner+c:a+url+b+inner+c);
 if(isPlug){const re=/(<script\b[^>]*id="cv-focus-data"[^>]*>)([\s\S]*?)(<\/script>)/,m=html.match(re);if(!m)throw Error('People data unavailable');const members=await publicMembers(env.COMMUNIVERSE_DB);html=html.replace(re,(_,a,b,c)=>a+serialize([...JSON.parse(b),...members])+c);const portraits=members.map(p=>`<a class="node" data-slug="${h(p.slug)}" data-name="${h(p.name)}" href="${h(p.profileUrl)}"><img src="${h(p.image)}" alt="" width="240" height="240" decoding="async"><span class="cap"><b>${h(p.name)}</b><small>${h(p.role)}</small></span></a>`).join('');const rewrite=new HTMLRewriter().on('#constellation',{element(el){el.append(portraits,{html:true})}}).on('head',{element(el){el.append('<style data-cv-market="'+PATCH_RELEASE+'">'+STYLE+'</style><style>'+ORBITS+'</style><script defer src="'+JOIN_ASSET+'"></script>',{html:true})}}).on('script[src],link[as=script]',{element(el){const key=el.tagName==='script'?'src':'href';if(el.getAttribute(key)==='/communiverse/_public/20261008-plug-orbits-1.js')el.setAttribute(key,PREFIX+'-focus.js')}}).on('main',{element(el){el.append('<div class="cv-market">'+disclosure+'</div>',{html:true})}});return rewrite.transform(new Response(html,{headers}));}
 const content=isHome?home():isJoin?join(path.endsWith('/artist')?'artist':'member'):isConfirm?confirmation():isWorkshops?workshops():null;
 const pageData={items:ITEMS,artists:ARTISTS,categories:CATEGORIES,currencies:CURRENCIES,cities:CITIES,sessionPrices:SESSION_PRICES};
 let rewrite=new HTMLRewriter().on('html',{element(el){if(content||artist)el.setAttribute('data-cv-market-theme','auto')}}).on('.top nav.nav',{element(el){const active=isHome?'/communiverse/':artist?'/communiverse/plug/?filter=artists':isWorkshops?'/communiverse/workshops/':null;el.setInnerContent(active?nav.replace('href="'+active+'"','aria-current="page" href="'+active+'"'):nav,{html:true})}}).on('head',{element(el){el.append(`<style data-cv-market="${PATCH_RELEASE}">${STYLE}</style><script defer src="${JOIN_ASSET}"></script>${(content||artist)?`<script defer src="${PREFIX}.js"></script>`:''}`,{html:true})}});
 if(content)rewrite=rewrite.on('main',{element(el){el.setInnerContent(content,{html:true})}}).on('title',{element(el){el.setInnerContent(isJoin?'Join Communiverse':isConfirm?'Welcome to Communiverse':isWorkshops?'Workshops | Communiverse':'Communiverse Marketplace')}}).on('script[src]',{element(el){if(el.getAttribute('src')==='/communiverse/_public/20261008-marketplace-6.js')el.remove()}});
 if(artist)rewrite=rewrite.on('#gallery-sessions,#gallery-store,.cv-artist-note',{element(el){el.remove()}}).on('.cv-gallery-page',{element(el){el.append(artistExtras(artist),{html:true})}}).on('.cv-gallery-nav a',{element(el){if(el.getAttribute('href')==='#gallery-sessions')el.setAttribute('href','#plan-session');if(el.getAttribute('href')==='#gallery-store')el.setAttribute('href','#cv-store')}});
 if(content||artist)rewrite=rewrite.on('body',{element(el){el.append(`<script type="application/json" id="cv-market-data">${serialize(pageData)}</script>`,{html:true})}});
 if(!content&&!artist)rewrite=rewrite.on('main',{element(el){el.append('<div class="cv-market">'+disclosure+'</div>',{html:true})}});
 return rewrite.transform(new Response(html,{headers}));
}};
