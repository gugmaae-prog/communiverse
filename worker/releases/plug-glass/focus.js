/* Communiverse Plug: one interruptible spring scene; no navigation or account writes on selection. */
(()=>{'use strict';
const RELEASE='20261006-plug-glass-1';
if(window.__cvPlugFocusRelease)return;
const root=document.querySelector('.cv-plug'),stage=root?.querySelector('.stage');
if(!root||!stage)return;
window.__cvPlugFocusRelease=window.__cvPlugRelease=RELEASE;
const data=JSON.parse(document.getElementById('cv-focus-data')?.textContent||'[]');
const bySlug=new Map(data.map(p=>[p.slug,p]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const WIDE=[ [52,48,28],[31,33,15],[72,27,12],[76,46,10],[26,55,13],[39,71,9],[65,68,11],[18,29,8],[55,18,7],[78,61,8],[34,82,7],[74,80,9],[46,32,8],[60,56,7] ];
const TIGHT=[ [50,46,32],[33,34,14],[67,33,12],[30,58,11],[69,57,13],[50,70,9],[42,22,8],[61,21,8] ];
const buttons=[...root.querySelectorAll('[data-filter]')];
let filter=new URL(location.href).searchParams.get('filter')||'all';
if(!buttons.some(b=>b.dataset.filter===filter))filter='all';
let selected=null,visible=[],frame=0,last=0,layout=null,panelAnimation=null,resizeFrame=0;
const lifetime=new AbortController(),signal=lifetime.signal;
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
const field=root.querySelector('.field');
const identity=make('div','glass-identity');identity.setAttribute('aria-hidden','true');stage.append(identity);
const panel=make('aside','glass-panel');panel.id='cv-person-work';panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','cv-person-name');panel.setAttribute('aria-hidden','true');panel.inert=true;
panel.innerHTML='<div class="glass-panel-top"><span>In their world</span><button type="button" class="glass-close" aria-label="Close person details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="glass-panel-body"></div>';
stage.append(panel);
const announcer=make('p','sr');announcer.setAttribute('role','status');announcer.setAttribute('aria-live','polite');root.append(announcer);
const stateLabel=make('p','glass-instruction','Choose a person. Discover their world.');field.prepend(stateLabel);
const nodes=[...stage.querySelectorAll('a.node')].map((el,i)=>{
 const p=bySlug.get(el.dataset.slug)||{slug:el.dataset.slug,name:el.dataset.name||'Member',role:el.querySelector('.cap small')?.textContent||'Member',summary:'',profileUrl:el.getAttribute('href'),socials:[]};
 el.setAttribute('role','button');el.setAttribute('aria-controls',panel.id);el.setAttribute('aria-expanded','false');el.setAttribute('aria-label','Explore '+p.name);el.draggable=false;
 el.querySelector('.cap')?.remove();
 const n={el,p,i,x:0,y:0,d:1,o:0,vx:0,vy:0,vd:0,tx:0,ty:0,td:1,to:0,rest:null};
 el.addEventListener('click',e=>{if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();select(n);},{signal});
 el.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();select(n);}},{signal});
 const img=el.querySelector('img');if(img){const fallback=()=>{if(el.querySelector('.ph'))return;img.hidden=true;el.append(make('span','ph',p.name.replace(/^[@_]+/,'').slice(0,1)));};img.addEventListener('error',fallback,{signal});if(img.complete&&!img.naturalWidth)fallback();}
 return n;
});
function safeUrl(s){try{const u=new URL(s,location.origin);if(u.protocol!=='https:'||u.username||u.password)return null;return u.href;}catch{return null;}}
function link(text,url,cls){const a=make('a',cls,text);const href=safeUrl(url);if(!href)return null;a.href=href;if(new URL(href).origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer';}return a;}
function card(kicker){const a=make('article','glass-card');a.append(make('p','glass-eyebrow',kicker));return a;}
function renderPanel(n){
 const body=panel.querySelector('.glass-panel-body'),p=n.p;panelAnimation?.cancel();body.replaceChildren();
 const main=card(p.group||'Member');const h=make('h2','',p.name);h.id='cv-person-name';main.append(h,make('p','glass-role',p.role||'Communiverse member'));
 const work=card('Their work');work.append(make('p','glass-description',p.summary||'Explore their public profile to discover their work and interests.'));
 if(p.focus?.length){const tags=make('div','glass-tags');p.focus.slice(0,4).forEach(t=>tags.append(make('span','',t)));work.append(tags);}
 const connect=card('Stay connected'),links=make('div','glass-links');
 for(const social of p.socials||[]){const a=link(social.label||'Instagram',social.url,'glass-link glass-social');if(a)links.append(a);}
 const profile=link(p.curated?'About this person':'View Plug profile',p.profileUrl,'glass-link');if(profile)links.append(profile);
 const contact=link('Contact Communiverse','/communiverse/contact/#contact','glass-link glass-contact');if(contact)links.append(contact);connect.append(links);
 body.append(main,work,connect);identity.replaceChildren(make('strong','',p.name),make('span','',p.group||'Member'));
 panel.scrollTop=0;
 if(!reduced.matches&&body.animate)panelAnimation=body.animate([{opacity:.2,transform:'translate3d(16px,8px,0)'},{opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
 announcer.textContent=p.name+'. '+(p.role||'Member')+'. Details open.';
}
function select(n){
 if(!visible.includes(n))return;
 if(selected===n){close(true);return;}
 selected=n;root.classList.add('is-focused');root.dataset.focusedPerson=n.p.slug;
 panel.inert=false;panel.setAttribute('aria-hidden','false');identity.setAttribute('aria-hidden','false');
 renderPanel(n);measure();targets();wake();
}
function close(focus){const old=selected;selected=null;root.classList.remove('is-focused');delete root.dataset.focusedPerson;panel.inert=true;panel.setAttribute('aria-hidden','true');identity.setAttribute('aria-hidden','true');panelAnimation?.cancel();measure();targets();wake();announcer.textContent='Back to the people.';if(focus&&old)old.el.focus({preventScroll:true});}
function measure(){
 const r=stage.getBoundingClientRect(),mobile=innerWidth<760;layout={w:r.width,h:r.height,mobile};
 const originalW=mobile?Math.min(r.width,540):Math.min(r.width-220,640),originalH=mobile?Math.min(r.height,originalW*1.25):Math.min(r.height,800);
 const slots=filter==='all'?WIDE:TIGHT;
 visible=nodes.filter(n=>filter==='all'||(n.el.dataset.facets||'').split(' ').includes(filter)).sort((a,b)=>(+b.el.dataset.score||0)-(+a.el.dataset.score||0)||a.p.name.localeCompare(b.p.name)).slice(0,slots.length);
 nodes.forEach(n=>{const i=visible.indexOf(n);if(i>=0){const s=slots[i];n.rest={x:(r.width-originalW)/2+originalW*s[0]/100,y:(r.height-originalH)/2+originalH*s[1]/100,d:Math.max(mobile?44:44,originalW*s[2]/100)};}else n.rest={x:r.width/2,y:r.height/2,d:32};});
 root.dataset.focusLayout=mobile?'mobile':'desktop';
}
function targets(){
 if(!layout)return;const {w,h,mobile}=layout;const peers=visible.filter(n=>n!==selected),cols=mobile?(w<330?1:2):3;
 for(const n of nodes){const shown=visible.includes(n);n.to=shown?1:0;n.el.style.pointerEvents=shown?'auto':'none';n.el.tabIndex=shown?0:-1;n.el.setAttribute('aria-hidden',String(!shown));n.el.setAttribute('aria-expanded',String(n===selected));n.el.classList.toggle('is-selected',n===selected);n.el.style.zIndex=n===selected?'4':'2';
  if(!selected){n.tx=n.rest.x;n.ty=n.rest.y;n.td=n.rest.d;continue;}
  if(n===selected){n.tx=w/2;n.ty=mobile?124:h*.43;n.td=mobile?Math.min(144,w*.40):Math.min(250,w*.185);continue;}
  const i=peers.indexOf(n);if(i<0){n.tx=w*.15;n.ty=h*.5;n.td=30;continue;}
  const col=i%cols,row=Math.floor(i/cols),rows=Math.ceil(peers.length/cols);
  if(mobile){n.td=44;n.tx=24+col*50;n.ty=42+row*56;}
  else{n.td=Math.min(78,Math.max(52,w*.056));const step=n.td+24,left=w*.075;const start=h*.43-(rows-1)*step/2;n.tx=left+col*step+(row%2?8:0);n.ty=start+row*step+(col===1?10:0);}
 }
}
function spring(p,v,t,dt){const nv=v+(78*(t-p)-17*v)*dt;return[p+nv*dt,nv];}
function paint(n){const d=Math.max(1,n.d);n.el.style.width='240px';n.el.style.height='240px';n.el.style.left='0px';n.el.style.top='0px';n.el.style.transform=`translate3d(${(n.x-d/2).toFixed(3)}px,${(n.y-d/2).toFixed(3)}px,0) scale(${(d/240).toFixed(5)})`;n.el.style.opacity=Math.max(0,Math.min(1,n.o)).toFixed(4);n.el.style.visibility=n.o<.002?'hidden':'visible';if(n===selected){identity.style.left=n.x+'px';identity.style.top=n.y+d/2+18+'px';}}
function snap(){for(const n of nodes){Object.assign(n,{x:n.tx,y:n.ty,d:n.td,o:n.to,vx:0,vy:0,vd:0});paint(n);}root.dataset.animating='false';}
function tick(t){frame=0;if(document.hidden)return;const dt=Math.min(.025,last?(t-last)/1000:1/60);last=t;let moving=false;for(const n of nodes){[n.x,n.vx]=spring(n.x,n.vx,n.tx,dt);[n.y,n.vy]=spring(n.y,n.vy,n.ty,dt);[n.d,n.vd]=spring(n.d,n.vd,n.td,dt);n.o+=(n.to-n.o)*(1-Math.exp(-dt*12));paint(n);if(Math.abs(n.x-n.tx)>.2||Math.abs(n.y-n.ty)>.2||Math.abs(n.d-n.td)>.2||Math.abs(n.vx)>.2||Math.abs(n.vy)>.2||Math.abs(n.vd)>.2||Math.abs(n.o-n.to)>.002)moving=true;}root.dataset.animating=String(moving);if(moving)frame=requestAnimationFrame(tick);else snap();}
function wake(){if(reduced.matches){cancelAnimationFrame(frame);frame=0;snap();return;}if(!frame){last=0;frame=requestAnimationFrame(tick);}}
for(const b of buttons)b.addEventListener('click',()=>{if(selected)close(false);filter=b.dataset.filter;for(const x of buttons)x.setAttribute('aria-pressed',String(x===b));const u=new URL(location.href);if(filter==='all')u.searchParams.delete('filter');else u.searchParams.set('filter',filter);history.replaceState(null,'',u);measure();targets();wake();},{signal});
panel.querySelector('.glass-close').addEventListener('click',()=>close(true),{signal});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected){e.preventDefault();close(true);}},{signal});
stage.addEventListener('click',e=>{if(selected&&e.target===stage)close(false);},{signal});
let sheenFrame=0;panel.addEventListener('pointermove',e=>{if(reduced.matches||!selected)return;const r=panel.getBoundingClientRect(),x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));cancelAnimationFrame(sheenFrame);sheenFrame=requestAnimationFrame(()=>{panel.style.setProperty('--glass-x',x+'%');panel.style.setProperty('--glass-y',y+'%');});},{signal,passive:true});
const ro=new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{measure();targets();wake();});});ro.observe(stage);
reduced.addEventListener('change',()=>{panelAnimation?.cancel();wake();},{signal});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake();},{signal});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame);cancelAnimationFrame(sheenFrame);frame=0;},{signal});
window.addEventListener('pageshow',()=>{measure();targets();wake();},{signal});
for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.filter===filter));
measure();targets();snap();root.dataset.glassReady='true';
window.__cvPlugFocusState=()=>({release:RELEASE,selected:selected?.p.slug||null,filter,visible:visible.map(n=>n.p.slug),animating:!!frame,reducedMotion:reduced.matches});
})();
