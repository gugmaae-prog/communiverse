import AVATARS from './avatar-fallback.txt';
import DATA from './public-cache.txt';
import HOME from './pages/home.txt';import DISCOVER from './pages/discover.txt';import ARTISTS from './pages/artists.txt';import EVENTS from './pages/events.txt';import CLUBS from './pages/clubs.txt';import CIRCLES from './pages/circles.txt';import ARTIST from './pages/artist.txt';
import {artistProfile,tile} from './retained/first-render-templates.mjs';
import {dateWindow,inWindow} from './retained/read-feed-social-data.js';
import {galleryPage,eventPage,referencePage} from './retained/read-feed-social-views.js';
const data=JSON.parse(DATA),revision='production-38cce4c6-20261027';
const heads={'Cache-Control':'no-store','X-Communiverse-Content':'public-backup-20261027','X-Communiverse-Content-Source':data.baseline};
const json=(v,status=200)=>Response.json(v,{status,headers:heads});
const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const serial=v=>JSON.stringify(v).replaceAll('<','\\u003c');
const search=(v,q)=>!q||v.toLowerCase().includes(q.toLowerCase());
function paginated(list,q,size,key){const n=Number(q.get('offset')||0),offset=Number.isFinite(n)?Math.max(0,Math.min(10000,Math.trunc(n))):0;return{[key]:list.slice(offset,offset+size),total:list.length,next:offset+size<list.length?offset+size:null};}
async function feed(q){
 let items=data.works.filter(i=>(!q.get('artist')||i.artist===q.get('artist'))&&(!q.get('region')||i.region===q.get('region'))&&(!q.get('gallery')||i.gallery?.id===q.get('gallery'))&&(!['work','video'].includes(q.get('type'))||i.kind===q.get('type'))&&search([i.title,i.artistName,...(i.tags||[])].join(' '),q.get('q')));
 if(q.get('saved')==='1'||q.get('following')==='1')items=[];
 const filters=[...q].filter(([k])=>k!=='cursor').sort(),fingerprint=async entries=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(revision+JSON.stringify(entries)+items.map(i=>i.id).join(',')))),b=>b.toString(16).padStart(2,'0')).join(''),digest=await fingerprint(filters.filter(([,value])=>value!==''));
 let offset=0;const cursor=q.get('cursor');if(cursor){const m=cursor.match(/^public1:([a-f0-9]{64}):(\d{1,5})$/);if(!m||(m[1]!==digest&&m[1]!==await fingerprint(filters)))return{error:'Refresh your feed to see the latest works.',status:410};offset=Number(m[2]);if(offset>items.length)return{error:'Refresh your feed.',status:400};}
 return{items:items.slice(offset,offset+16),cursor:offset+16<items.length?'public1:'+digest+':'+(offset+16):null,total:items.length,personalized:false};
}
function artists(q){const list=data.artists.filter(a=>(!q.get('id')||a.id===q.get('id'))&&(!q.get('region')||a.region===q.get('region'))&&(!q.get('related')||a.id!==q.get('related'))&&search([a.title,a.city,a.description,...(a.tags||[])].join(' '),q.get('q')));return{artists:list,total:list.length,personalized:false,recommendationBasis:'discovery'};}
export async function publicFallback(request){
 if(!['GET','HEAD'].includes(request.method))return null;
 const u=new URL(request.url),p=u.pathname.replace(/^\/communiverse(?=\/|$)/,'')||'/',q=u.searchParams;
 const avatar=p.match(/^\/_public\/avatar\/([a-zA-Z0-9-]+)$/);if(avatar&&JSON.parse(AVATARS)[avatar[1]])return new Response(null,{status:302,headers:{...heads,Location:JSON.parse(AVATARS)[avatar[1]]}});
 if(p==='/_public/member-avatar/c661455e-df47-4c55-9519-cc6add995130.svg')return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><circle cx="120" cy="120" r="120" fill="#e3eafa"/><text x="120" y="138" text-anchor="middle" font-family="Arial,sans-serif" font-size="56" fill="#253a5f">El</text></svg>',{headers:{...heads,'Content-Type':'image/svg+xml'}});
 if(p.startsWith('/api/')){
  const endpoint=p.slice(5).replace(/\/$/,'');
  if(endpoint==='artists')return json(artists(q));
  if(endpoint==='feed'){const f=await feed(q);return json(f,f.status||200);}
  if(endpoint==='item'){const d=data.details[q.get('id')];return d?json(d):json({error:'This work is unavailable.'},404);}
  if(endpoint==='comments'){const d=data.comments[q.get('target')];return d?json(d):json({error:'This work is unavailable.'},404);}
  if(endpoint==='galleries')return json({galleries:data.galleries.filter(g=>!q.get('id')||g.id===q.get('id'))});
  if(endpoint==='event'){let e=data.events.find(e=>e.id===q.get('id'));if(e&&e.end<new Date().toISOString().slice(0,10))e={...e,description:e.description.replace(/Luna will be attending\./,'Luna attended.').replace('Opening Tuesday,','Opened Tuesday,').replace('The opening includes','The opening programme included')};return e?json({event:e}):json({error:'This event is unavailable.'},404);}
  if(endpoint==='events'){
   const state=['upcoming','today','week','next-week','month','now','past','places'].includes(q.get('state'))?q.get('state'):'upcoming',bucket=state==='now'?'today':state,bounds=dateWindow(bucket,new Date(),'Asia/Dubai');
   let list=data.events.filter(e=>(!q.get('type')||e.type===q.get('type'))&&(!q.get('gallery')||e.gallery?.id===q.get('gallery'))&&search([e.title,e.city,e.organizer,...(e.tags||[])].join(' '),q.get('q'))&&inWindow(e,bucket,bounds)).map(e=>({...e,state,bucket,displayDate:bucket==='past'?(e.start||e.end):bucket==='today'?bounds.today:e.start<bounds.from?bounds.from:e.start,ongoing:!!e.start&&e.start<bounds.today&&!!e.end&&e.end>=bounds.today}));
   list.sort((a,b)=>state==='past'?(b.end||b.start||'').localeCompare(a.end||a.start||''):(a.displayDate||'9999').localeCompare(b.displayDate||'9999'));
   list=list.map(e=>e.id==='event-wakos-ceramic-ties-2026'&&bucket==='past'?{...e,description:e.description.replace(/\s*Luna will be attending\./,'').replace('Opening Tuesday,','Opened Tuesday,').replace('The opening includes','The opening programme included')}:e);return json({...paginated(list,q,18,'events'),state,window:bounds,city:'Dubai'});
  }
  if(endpoint==='circles'){
   if(q.get('id')){const c=data.circles.find(c=>c.id===q.get('id'));return c?json({circle:c}):json({error:'This club is unavailable.'},404);}
   if(q.get('following')==='1')return json({circles:[],total:0,next:null,needsSignIn:true});
   return json(paginated(data.circles.filter(c=>(!q.get('craft')||c.craft===q.get('craft'))&&(!q.get('region')||c.region===q.get('region'))&&search([c.name,c.description,...c.tags].join(' '),q.get('q'))),q,24,'circles'));
  }
  if(endpoint==='circles/posts'){const d=data.circlePosts[q.get('circle')];if(!d)return json({error:'This club is unavailable.'},404);return json({...d,...paginated(d.posts.filter(p=>!q.get('kind')||q.get('kind')==='all'||p.kind===q.get('kind')),q,20,'posts')});}
  return null;
 }
 const page=p.replace(/\/$/,'')||'/',pages={'/':HOME,'/discover':DISCOVER,'/artists':ARTISTS,'/events':EVENTS,'/clubs':CLUBS,'/communities':CLUBS,'/circles':CIRCLES,'/plug':CIRCLES,'/artist':ARTIST,'/event':ARTISTS,'/gallery':ARTISTS,'/reference':ARTISTS,'/galleries':ARTISTS,'/about':ARTISTS,'/contact':ARTISTS,'/how-it-works':ARTISTS};
 if(!pages[page])return null;
 let html=pages[page],render=new HTMLRewriter();
 if(['/about','/contact','/how-it-works','/galleries'].includes(page)){
 const content={
 '/about':'<h1>Made by people. Found by people.</h1><p>Communiverse brings artists, their work and the people who love art together. Meet the makers, explore their portfolios and find art events in Dubai.</p><p>Clubs make room for shared interests and conversations. Circles introduce the people behind the community.</p><p><a href="/artists/">Meet the artists</a></p>',
 '/contact':'<h1>Get in touch.</h1><p>For questions about Communiverse, artists or collaborations, write to <a href="mailto:hello@communiverseclubs.com">hello@communiverseclubs.com</a>.</p>',
 '/how-it-works':'<h1>Find your place in Communiverse.</h1><p>Explore the artwork in Discover. Open a piece to read its story, then visit the artist’s profile to see more.</p><p>Browse Dubai exhibitions and workshops in Events, find a shared interest in Clubs, or meet people in Circles.</p><p><a href="https://espacios.me/communiverse/join/">Join Communiverse</a> to save favourites and take part. Sign-in and your workspace currently open on Espacios.</p>',
 '/galleries':'<h1>Galleries</h1><div class="cv-directory">'+data.galleries.map(g=>'<article><h2><a href="/gallery/?id='+encodeURIComponent(g.id)+'">'+esc(g.name||g.title)+'</a></h2><p>'+esc(g.city||g.description)+'</p></article>').join('')+'</div>'
 }[page];render=render.on('main',{element(e){e.setInnerContent('<section class="cv-social cv-account-page">'+content+'</section>',{html:true});}}).on('title',{element(e){e.setInnerContent(page.slice(1).replaceAll('-',' ')+' | Communiverse');}});
 }
 if(page==='/event'&&!data.events.some(e=>e.id===q.get('id')))return json({error:'This event is unavailable.'},404);
 if(page==='/gallery'&&!data.galleries.some(e=>e.id===q.get('id')))return json({error:'This gallery is unavailable.'},404);
 if(['/event','/gallery','/reference'].includes(page)){const content=page==='/event'?eventPage():page==='/gallery'?galleryPage():referencePage(q.get('url'));render=render.on('main',{element(e){e.setInnerContent(content,{html:true});}}).on('title',{element(e){e.setInnerContent((page==='/event'?'Event':page==='/gallery'?'Gallery':'Source and credits')+' | Communiverse');}});}
 if(page==='/artist'){
  const a=data.artists.find(a=>a.id===q.get('id'));if(!a)return json({error:'This artist is unavailable.'},404);
  const works={items:data.works.filter(i=>i.artist===a.id),cursor:null,total:data.works.filter(i=>i.artist===a.id).length,personalized:false};
  render=render.on('#cv-artist-profile',{element(e){e.setInnerContent(artistProfile(a),{html:true});e.setAttribute('data-cv-server-profile','true');}}).on('#cv-artist-works',{element(e){e.setInnerContent(works.items.map(tile).join(''),{html:true});}}).on('#cv-first-data',{element(e){e.setInnerContent(serial({['artists?id='+a.id]:{artists:[a],total:1},['feed?artist='+a.id]:works}),{html:true});}}).on('title',{element(e){e.setInnerContent(a.title+' · Artist | Communiverse');}});
 }
 if(page==='/'||page==='/discover'){const f=await feed(q);render=render.on('#cv-feed-initial',{element(e){e.setInnerContent(serial(f),{html:true});}});}
 return render.transform(new Response(request.method==='HEAD'?null:html,{headers:{...heads,'Content-Type':'text/html; charset=utf-8'}}));
}
export function snapshotCursor(request){return new URL(request.url).searchParams.get('cursor')?.startsWith('public1:');}
