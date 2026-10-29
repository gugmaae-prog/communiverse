const dialog=document.querySelector('#artwork-viewer');
if(dialog&&typeof dialog.showModal==='function'){
 let opener;
 document.querySelectorAll('[data-lightbox]').forEach(link=>link.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();opener=link;
  document.querySelector('#viewer-title').textContent=link.dataset.title;
  document.querySelector('#viewer-artist').textContent=link.dataset.artist;
  document.querySelector('#viewer-note').textContent=link.dataset.note;
  const image=document.querySelector('#viewer-image');image.src=link.href;image.alt=link.querySelector('img').alt;
  document.querySelector('#viewer-original').href=link.dataset.original;
  dialog.showModal();
 }));
 dialog.querySelector('.close-viewer').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>opener?.focus());
}
const themeButton=document.querySelector('.theme-switch'),root=document.documentElement;
let stored;try{stored=localStorage.getItem('cv-exhibition-theme');}catch{}
if(stored==='light'||stored==='dark')root.dataset.theme=stored;
const dark=()=>root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
const updateThemeLabel=()=>themeButton.setAttribute('aria-label','Switch to '+(dark()?'light':'dark')+' theme');
themeButton.hidden=false;updateThemeLabel();
themeButton.addEventListener('click',()=>{root.dataset.theme=dark()?'light':'dark';try{localStorage.setItem('cv-exhibition-theme',root.dataset.theme);}catch{}updateThemeLabel();});
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',updateThemeLabel);

// Match the shared header's account state without placing private data in cached HTML.
fetch('/communiverse/api/me',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{const m=d?.member;if(!m)return;const host=document.querySelector('#cv-social-header .cv-account'),a=document.createElement('a');a.className='cv-profile-link';a.href='/communiverse/workspace/';a.setAttribute('aria-label','Open your Communiverse profile'+(m.first_name?' · '+m.first_name:''));a.title='Open profile';a.textContent=String(m.first_name||'Me').slice(0,1);const path=m.photo||'/communiverse/_public/avatar/member-'+encodeURIComponent(m.id);try{const u=new URL(path,location.origin);if(u.origin===location.origin&&u.pathname.startsWith('/communiverse/')){const img=document.createElement('img');img.src=u.href;img.alt='';img.width=44;img.height=44;img.addEventListener('error',()=>{img.remove();a.textContent=String(m.first_name||'Me').slice(0,1)});a.replaceChildren(img);}}catch{}host.replaceChildren(a);}).catch(()=>{});
const shareButton=document.querySelector('.share-exhibition'),shareStatus=document.querySelector('.share-status');shareButton?.addEventListener('click',async()=>{const url='https://espacios.me/communiverse/exhibitions/wetex-2026/';try{await navigator.clipboard.writeText(url);shareStatus.textContent='Link copied. Send it to someone you’d like to bring.';}catch{shareStatus.replaceChildren();const a=document.createElement('a');a.href=url;a.textContent='Open the exhibition link to share';shareStatus.append(a);}});
// One owner for carousel motion and lifecycle. The static first slide works without JS.
(()=>{
 const gallery=document.querySelector('.hero-gallery');if(!gallery)return;
 const slides=[...gallery.querySelectorAll('.gallery-slide')],stage=gallery.querySelector('.gallery-stage'),controls=gallery.querySelector('.gallery-controls'),play=gallery.querySelector('.gallery-play'),count=gallery.querySelector('.gallery-count'),title=gallery.querySelector('.gallery-title'),artist=gallery.querySelector('.gallery-artist'),status=gallery.querySelector('.gallery-status'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 const DELAY=6500,DURATION=480,EASING='cubic-bezier(.22,.7,.25,1)',animations=new Map(),images=new WeakMap(),wrap=n=>(n+slides.length)%slides.length;
 let index=0,requested=0,requestId=0,transitionId=0,timer,playing=!motion.matches,hover=false,visible=false,alive=true,pointerIntent=null,touchStart=null,suppressClick=false;
 const load=i=>{const img=slides[i].querySelector('img');if(images.has(img))return images.get(img);if(img.dataset.src){img.loading='eager';img.srcset=img.dataset.srcset||'';img.src=img.dataset.src;delete img.dataset.src;delete img.dataset.srcset;}const promise=img.decode?img.decode().then(()=>img.naturalWidth>0).catch(()=>false):Promise.resolve(img.complete&&img.naturalWidth>0);images.set(img,promise);return promise;};
 const clear=()=>{clearTimeout(timer);timer=undefined;};
 const label=()=>{play.textContent=playing?'Pause':'Play';play.setAttribute('aria-label',(playing?'Pause':'Start')+' artwork slideshow');gallery.dataset.playing=String(playing);};
 const schedule=()=>{clear();if(alive&&playing&&visible&&!hover&&!document.hidden&&!motion.matches)timer=setTimeout(()=>{requested=wrap(index+1);show(requested,1,false);},DELAY);};
 const stop=()=>{playing=false;label();clear();};
 const settle=()=>{transitionId++;for(const a of animations.values())a.cancel();animations.clear();slides.forEach((s,i)=>{s.hidden=i!==index;s.inert=i!==index;s.setAttribute('aria-hidden',String(i!==index));});};
 async function show(next,direction,user){
  const ticket=++requestId;clear();if(user)stop();const loaded=await load(next);if(ticket!==requestId||!alive)return;if(!loaded){requested=index;if(user)status.textContent='This photo could not load. Please try another artwork.';schedule();return;}
  if(next===index){schedule();return;}
  const snapshots=new Map(slides.filter(s=>!s.hidden).map(s=>{const c=getComputedStyle(s);return[s,{transform:c.transform==='none'?'translateX(0%)':c.transform,opacity:c.opacity}]}));
  const generation=++transitionId;for(const a of animations.values())a.cancel();animations.clear();index=next;requested=next;gallery.dataset.index=String(index);title.textContent=slides[index].dataset.title;title.href='#'+slides[index].dataset.key;artist.textContent=slides[index].dataset.artist;count.textContent=(index+1)+' / '+slides.length;
  if(user)status.textContent=slides[index].dataset.title+' by '+slides[index].dataset.artist+'. '+(index+1)+' of '+slides.length+'.';
  slides.forEach((s,i)=>{
   const active=i===index,was=snapshots.get(s);s.inert=!active;s.setAttribute('aria-hidden',String(!active));
   if(motion.matches||typeof s.animate!=='function'){s.hidden=!active;return;}
   if(!active&&!was){s.hidden=true;return;}s.hidden=false;
   const from=was||{transform:'translateX('+(-direction*100)+'%)',opacity:0},to={transform:active?'translateX(0%)':'translateX('+(direction*100)+'%)',opacity:active?1:0};
   const a=s.animate([from,to],{duration:DURATION,easing:EASING,fill:'both'});animations.set(s,a);a.finished.then(()=>{if(generation!==transitionId)return;s.hidden=!active;a.cancel();animations.delete(s);}).catch(()=>{});
  });
  load(wrap(index+1));load(wrap(index-1));schedule();
 }
 const step=delta=>{requested=wrap(requested+delta);show(requested,delta>0?1:-1,true);};
 controls.hidden=false;gallery.dataset.index='0';label();load(0);load(1);
 gallery.querySelector('.gallery-next').addEventListener('click',()=>step(1));gallery.querySelector('.gallery-previous').addEventListener('click',()=>step(-1));
 play.addEventListener('pointerdown',()=>{pointerIntent=playing;});play.addEventListener('click',()=>{playing=pointerIntent===null?!playing:!pointerIntent;pointerIntent=null;if(motion.matches)playing=false;label();schedule();});
 gallery.addEventListener('focusin',stop);
 gallery.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;clear();}});gallery.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hover=false;schedule();}});
 gallery.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
 stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')touchStart={x:e.clientX,y:e.clientY};});stage.addEventListener('pointerup',e=>{if(!touchStart)return;const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){suppressClick=true;setTimeout(()=>{suppressClick=false;},400);step(dx>0?1:-1);}});stage.addEventListener('pointercancel',()=>{touchStart=null;});stage.addEventListener('click',e=>{if(suppressClick){e.preventDefault();suppressClick=false;}},true);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.25;schedule();},{threshold:[0,.25]});observer.observe(gallery);
 document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',()=>{requestId++;requested=index;settle();stop();play.disabled=motion.matches;play.title=motion.matches?'Automatic playback is off for reduced motion':'Play or pause artworks';});play.disabled=motion.matches;play.title=motion.matches?'Automatic playback is off for reduced motion':'Play or pause artworks';
 window.addEventListener('pagehide',()=>{alive=false;requestId++;clear();settle();observer.disconnect();});window.addEventListener('pageshow',()=>{alive=true;observer.observe(gallery);schedule();});
})();
