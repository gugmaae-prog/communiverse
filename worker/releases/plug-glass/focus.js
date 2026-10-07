/* Communiverse Plug: one interruptible spring scene; no navigation or account writes on selection. */
(()=>{'use strict';
const RELEASE='20261006-plug-streamline-4';
if(window.__cvPlugFocusRelease)return;
const root=document.querySelector('.cv-plug'),stage=root?.querySelector('.stage');
if(!root||!stage)return;
window.__cvPlugFocusRelease=window.__cvPlugRelease=RELEASE;
const data=JSON.parse(document.getElementById('cv-focus-data')?.textContent||'[]');
const bySlug=new Map(data.map(p=>[p.slug,p]));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const WIDE=[[50,48,29],[22,29,18],[77,20,15],[82,48,14],[20,60,17],[37,80,14],[70,78,17],[9,10,12],[46,13,12],[92,72,12],[12,88,11]];
const TIGHT=[[50,46,31],[18,24,18],[80,20,17],[17,67,18],[80,65,18],[47,85,15],[51,8,12],[90,89,11]];
const buttons=[...root.querySelectorAll('[data-filter]')];
const normalizeFilter=v=>({all:'communiverse',team:'cool-kids',founders:'artisans',design:'artisans',dubai:'artisans'}[v]||v||'communiverse');
let filter=normalizeFilter(new URL(location.href).searchParams.get('filter'));
if(!buttons.some(b=>b.dataset.filter===filter))filter='communiverse';
let pageIndex=0,totalPages=1,allMatching=[];
let compactMotion=false,peerKey="",peerAssignment=new Map();
let selected=null,visible=[],frame=0,last=0,layout=null,panelAnimation=null,resizeFrame=0;
const lifetime=new AbortController(),signal=lifetime.signal;
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
const field=root.querySelector('.field');
const pagination=make('nav','glass-pages');pagination.setAttribute('aria-label','More people');pagination.innerHTML='<button type="button" data-people-page="prev" aria-label="Previous group of people"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m12 5-5 5 5 5"/></svg></button><span aria-live="polite"></span><button type="button" data-people-page="next" aria-label="Next group of people"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg></button>';field.append(pagination);
const identity=make('div','glass-identity');identity.setAttribute('aria-hidden','true');stage.append(identity);
const panel=make('aside','glass-panel');panel.id='cv-person-work';panel.setAttribute('role','region');panel.setAttribute('aria-labelledby','cv-person-name');panel.setAttribute('aria-hidden','true');panel.inert=true;
panel.innerHTML='<div class="glass-panel-top"><span>In their world</span></div><div class="glass-panel-body"></div>';
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
 const main=card(p.category==='cool-kids'?'Management':p.group||'Member');const h=make('h2','',p.name);h.id='cv-person-name';main.append(h,make('p','glass-role',p.role||'Communiverse member'));
 const work=card('Their work');work.append(make('p','glass-description',p.summary||'Explore their public profile to discover their work and interests.'));
 if(p.more)work.append(make('p','glass-description glass-background',p.more));if(p.sources?.length){const refs=make('div','glass-sources');refs.append(make('span','','Public sources'));for(const s of p.sources){const a=link(s.label,s.url,'');if(a)refs.append(a);}work.append(refs);}
 if(p.focus?.length){const tags=make('div','glass-tags');p.focus.slice(0,4).forEach(t=>tags.append(make('span','',t)));work.append(tags);}
 const connect=card('Stay connected'),links=make('div','glass-links');
 for(const social of p.socials||[]){const a=link('',social.url,'glass-link glass-social');if(a){a.setAttribute('aria-label','Open '+p.name+' on Instagram');a.title=social.label||'Instagram';a.innerHTML='<svg class="instagram-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.3" y="3.3" width="17.4" height="17.4" rx="5"/><circle cx="12" cy="12" r="4.1"/><circle class="instagram-dot" cx="17.5" cy="6.6" r="1"/></svg>';links.append(a);}}
 const profile=link(p.curated?'About this person':'View Plug profile',p.profileUrl,'glass-link');if(profile)links.append(profile);
 const contact=link('Contact Communiverse','/communiverse/contact/#contact','glass-link glass-contact');if(contact)links.append(contact);connect.append(links);
 body.append(main,work,connect);identity.replaceChildren(make('strong','',p.name),make('span','',p.group||'Member'));
 panel.scrollTop=0;
 if(!reduced.matches&&body.animate)panelAnimation=body.animate([{opacity:.2,transform:'translate3d(16px,8px,0)'},{opacity:1,transform:'none'}],{duration:1100,easing:'cubic-bezier(.22,1,.36,1)'});
 announcer.textContent=p.name+'. '+(p.role||'Member')+'. Details open.';
}
function select(n,writeHistory=true){
 if(!visible.includes(n))return;
 if(selected===n){close(true);return;}
 rebase();selected=n;root.classList.add('is-focused');root.dataset.focusedPerson=n.p.slug;
 panel.inert=false;panel.setAttribute('aria-hidden','false');identity.setAttribute('aria-hidden','false');
 renderPanel(n);measure();targets();wake();
 if(writeHistory){const u=new URL(location.href),alreadyFocused=u.searchParams.has('person');u.searchParams.set('person',n.p.slug);history[alreadyFocused?'replaceState':'pushState']({cvPerson:n.p.slug},'',u);}
}
function close(focus,writeHistory=true){const old=selected;rebase();selected=null;root.classList.remove('is-focused');delete root.dataset.focusedPerson;panel.inert=true;panel.setAttribute('aria-hidden','true');identity.setAttribute('aria-hidden','true');panelAnimation?.cancel();measure();targets();wake();announcer.textContent='Back to the people.';if(writeHistory){const u=new URL(location.href);u.searchParams.delete('person');history.replaceState(null,'',u);}if(focus&&old)old.el.focus({preventScroll:true});}
// Every painted frame satisfies portrait separation; selected node is the anchor.
const bound=(x,a,b)=>Math.max(a,Math.min(b,x));
function separate(items,gap,w,h,pinned=null){
 const confine=n=>{const r=Math.max(.5,n.d/2);n.x=bound(n.x,Math.max(r+4,n.loX||0),Math.min(w-r-4,n.hiX??w));n.y=bound(n.y,Math.max(r+4,n.loY||0),Math.min(h-r-4,n.hiY??h));};
 for(let iter=0;iter<100;iter++){let worst=0;items.forEach(confine);for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];let dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),need=(a.d+b.d)/2+gap;if(len>=need-.003)continue;if(len<.0001){const angle=((i*31+j*17)%360)*Math.PI/180;dx=Math.cos(angle);dy=Math.sin(angle);len=1;}const error=need-len;worst=Math.max(worst,error);const nx=dx/len,ny=dy/len,wa=a===pinned?0:1,wb=b===pinned?0:1,den=wa+wb||1;a.x-=nx*error*wa/den;a.y-=ny*error*wa/den;b.x+=nx*error*wb/den;b.y+=ny*error*wb/den;}items.forEach(confine);if(worst<.01)break;}
}
function measure(){const r=stage.getBoundingClientRect(),mobile=innerWidth<760,baseH=mobile?Math.max(520,Math.min(660,innerHeight-176)):Math.max(650,Math.min(820,innerHeight-150));layout={w:r.width,h:baseH,mobile,gap:mobile?12:18};const slots=filter==='communiverse'?WIDE:TIGHT;allMatching=nodes.filter(n=>filter==='communiverse'||n.p.category===filter).sort((a,b)=>(+b.el.dataset.score||0)-(+a.el.dataset.score||0)||a.p.name.localeCompare(b.p.name));totalPages=Math.max(1,Math.ceil(allMatching.length/slots.length));pageIndex=bound(pageIndex,0,totalPages-1);visible=allMatching.slice(pageIndex*slots.length,(pageIndex+1)*slots.length);pagination.hidden=totalPages<=1||!!selected;pagination.querySelector('span').textContent=(allMatching.length?pageIndex*slots.length+1:0)+'–'+Math.min((pageIndex+1)*slots.length,allMatching.length)+' / '+allMatching.length;pagination.querySelector('[data-people-page=prev]').disabled=pageIndex===0;pagination.querySelector('[data-people-page=next]').disabled=pageIndex>=totalPages-1;stateLabel.textContent=filter==='cool-kids'?'The Cool Kids on the Block · Management':filter==='ambassadors'?'Meet our ambassadors.':filter==='artisans'?'Discover the Plug community.':'Choose a person. Discover their world.';
 const ow=mobile?r.width-24:Math.min(720,r.width-210),oh=mobile?baseH-64:baseH-80,ox=(r.width-ow)/2+(mobile?0:70),oy=24;const rest=visible.map((n,i)=>{const s=slots[i];return {n,x:ox+ow*s[0]/100,y:oy+oh*s[1]/100,d:Math.max(44,ow*s[2]/100),loX:mobile?0:158};});separate(rest,layout.gap+4,r.width,baseH);for(const n of nodes){const a=rest.find(a=>a.n===n);n.rest=a?{x:a.x,y:a.y,d:a.d}:{x:r.width/2,y:baseH/2,d:1};}
 const top=mobile?Math.max(298,Math.ceil(visible.length/(r.width<330?1:2))*60+32):60;stage.style.setProperty('--glass-panel-top',top+'px');const sceneH=selected?Math.max(baseH,top+(panel.offsetHeight||600)+40):baseH,value=Math.ceil(sceneH)+'px';if(stage.style.getPropertyValue('--scene-height')!==value)stage.style.setProperty('--scene-height',value);layout.sceneH=sceneH;root.dataset.focusLayout=mobile?'mobile':'desktop';root.dataset.minimumPortraitGap=String(layout.gap);
}
// Minimum-distance assignment avoids peers crossing one another's routes to the left.
function assignPeers(peers,slots){const n=peers.length;if(!n)return new Map();const end=1<<n,cost=new Float64Array(end),choice=new Int16Array(end),count=new Uint8Array(end);cost.fill(Infinity);cost[0]=0;for(let mask=1;mask<end;mask++)count[mask]=count[mask>>1]+(mask&1);for(let mask=0;mask<end;mask++){const i=count[mask];if(i>=n||!Number.isFinite(cost[mask]))continue;for(let j=0;j<n;j++)if(!(mask&(1<<j))){const next=mask|(1<<j),a=peers[i],b=slots[j],c=cost[mask]+(a.x-b.x)**2+(a.y-b.y)**2;if(c<cost[next]){cost[next]=c;choice[next]=j;}}}const map=new Map();let mask=end-1;for(let i=n-1;i>=0;i--){const j=choice[mask];map.set(peers[i],j);mask^=1<<j;}return map;}
function targets(){if(!layout)return;const{w,h,mobile}=layout,cols=mobile?(w<330?1:2):3,focusD=mobile?Math.min(112,w*.35):Math.min(236,w*.18),focusY=mobile?124:h*.43,peers=visible.filter(n=>n!==selected),rows=Math.ceil(peers.length/cols),out=[];
if(selected){const key=selected.p.slug+":"+w+":"+h+":"+visible.map(n=>n.p.slug).join(",");if(key!==peerKey){peerKey=key;const dia=mobile?44:Math.min(76,Math.max(52,w*.055)),step=dia+(mobile?16:26),slots=peers.map((_,i)=>({x:mobile?27+(i%cols)*60:w*.067+(i%cols)*step+(Math.floor(i/cols)%2?8:0),y:mobile?40+Math.floor(i/cols)*60:focusY-(rows-1)*step/2+Math.floor(i/cols)*step+(i%cols===1?10:0)}));peerAssignment=assignPeers(peers,slots);}}else peerKey="";
for(const n of nodes){const shown=visible.includes(n);n.to=shown?1:0;n.el.style.pointerEvents=shown?'auto':'none';n.el.tabIndex=shown?0:-1;n.el.setAttribute('aria-hidden',String(!shown));n.el.setAttribute('aria-expanded',String(n===selected));n.el.classList.toggle('is-selected',n===selected);n.el.style.zIndex=n===selected?'4':'2';let a={n,x:n.rest.x,y:n.rest.y,d:shown?n.rest.d:1};if(selected&&shown){if(n===selected)a={n,x:w/2,y:focusY,d:focusD};else{const i=peerAssignment.get(n)??peers.indexOf(n),col=i%cols,row=Math.floor(i/cols),dia=mobile?44:Math.min(76,Math.max(52,w*.055)),step=dia+(mobile?16:26);a={n,d:dia,x:mobile?27+col*60:w*.067+col*step+(row%2?8:0),y:mobile?40+row*60:focusY-(rows-1)*step/2+row*step+(col===1?10:0),hiX:w/2-focusD/2-layout.gap-2-dia/2};}}if(shown)out.push(a);else{n.tx=n.x||w/2;n.ty=n.y||h/2;n.td=1;}}separate(out,layout.gap+4,w,Math.max(h,rows*60+70),out.find(a=>a.n===selected));if(out.some(a=>Math.hypot(a.n.tx-a.x,a.n.ty-a.y)>2))compactMotion=true;out.forEach(a=>{a.n.tx=a.x;a.n.ty=a.y;a.n.td=a.d;});calm();}
// Stiffness 18, damping 7.8: about 1.2s to settle, still moving at 400ms, overshoot under 0.1%.
function spring(p,v,t,dt){const nv=v+(18*(t-p)-7.8*v)*dt;return[p+nv*dt,nv];}
function calm(){for(const n of nodes){if((n.tx-n.x)*n.vx<0)n.vx=0;if((n.ty-n.y)*n.vy<0)n.vy=0;if((n.td-n.d)*n.vd<0)n.vd=0;}}
// Cap closing speed from the gap still left, so a crossing eases around instead of hitting and stopping.
function easeApart(){const items=nodes.filter(n=>n.o>.04||n.to>.5),gap=layout.gap,margin=120,accel=3000;for(let pass=0;pass<3;pass++)for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];let dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<.0001){dx=1;dy=0;len=1;}const slack=len-((a.d+b.d)/2+gap);if(slack>=margin)continue;const nx=dx/len,ny=dy/len,rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny,closing=Math.max(0,(a.vd+b.vd)/2)-rel;if(closing<=0)continue;const maxClose=Math.sqrt(2*accel*Math.max(slack,0));if(closing<=maxClose)continue;const excess=closing-maxClose,wa=a===selected?0.35:1,wb=b===selected?0.35:1,den=wa+wb||1;a.vx-=nx*excess*wa/den;a.vy-=ny*excess*wa/den;b.vx+=nx*excess*wb/den;b.vy+=ny*excess*wb/den;}}
function paint(n,p=n){const d=Math.max(.1,p.d);n.el.style.width='240px';n.el.style.height='240px';n.el.style.left='0px';n.el.style.top='0px';n.el.style.transform='translate3d('+(p.x-d/2).toFixed(4)+'px,'+(p.y-d/2).toFixed(4)+'px,0) scale('+(d/240).toFixed(7)+')';n.el.style.opacity=bound(n.o,0,1).toFixed(5);n.el.style.visibility=n.o<.002?'hidden':'visible';n.rendered={x:p.x,y:p.y,d};if(n===selected){identity.style.left=p.x+'px';identity.style.top=p.y+d/2+18+'px';}}
function rebase(){for(const n of nodes)if(n.rendered){n.x=n.rendered.x;n.y=n.rendered.y;n.d=n.rendered.d;}}
function resolveFrame(){const points=nodes.filter(n=>n.o>=.002).map(n=>({source:n,x:n.x,y:n.y,d:n.d}));separate(points,layout.gap,layout.w,layout.sceneH||layout.h,points.find(p=>p.source===selected));// Last-mile radius bound: projection convergence cannot cause a single-frame overlap.
// Radii only decrease in this pass, so a later pair cannot invalidate an earlier pair.
for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){
 const a=points[i],b=points[j],len=Math.hypot(a.x-b.x,a.y-b.y),gap=Math.min(layout.gap+.15,len*.45),available=Math.max(.00001,len-gap),ra=a.d/2,rb=b.d/2;
 if(ra+rb<=available)continue;
 if(a.source===selected&&available>ra+.1)b.d=2*(available-ra);
 else if(b.source===selected&&available>rb+.1)a.d=2*(available-rb);
 else {const f=available/(ra+rb);a.d*=f;b.d*=f;}
}
let minimum=Infinity;for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)minimum=Math.min(minimum,Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)-(points[i].d+points[j].d)/2);root.dataset.renderedPortraitGap=Number.isFinite(minimum)?minimum.toFixed(3):'none';const positions=new Map(points.map(p=>[p.source,p]));for(const n of nodes)paint(n,positions.get(n)||n);}
function snap(){compactMotion=false;for(const n of nodes)Object.assign(n,{x:n.tx,y:n.ty,d:n.td,o:n.to,vx:0,vy:0,vd:0});resolveFrame();root.dataset.animating='false';}
function tick(t){frame=0;if(document.hidden)return;const dt=Math.min(.025,last?(t-last)/1000:1/60);last=t;let moving=false;compactMotion=false;
 for(const n of nodes){n.vx=spring(n.x,n.vx,n.tx,dt)[1];n.vy=spring(n.y,n.vy,n.ty,dt)[1];n.vd=spring(n.d,n.vd,n.td,dt)[1];}
 easeApart();
 for(const n of nodes){n.x+=n.vx*dt;n.y+=n.vy*dt;n.d=Math.max(.1,n.d+n.vd*dt);n.o+=(n.to-n.o)*(1-Math.exp(-dt*2.8));if(Math.abs(n.x-n.tx)>=.05||Math.abs(n.y-n.ty)>=.05||Math.abs(n.d-n.td)>=.05||Math.abs(n.vx)>=.25||Math.abs(n.vy)>=.25||Math.abs(n.vd)>=.25||Math.abs(n.o-n.to)>=.001)moving=true;}
 // Projection affects display only; the spring state always converges, avoiding collision deadlocks.
 resolveFrame();root.dataset.animating=String(moving);if(moving)frame=requestAnimationFrame(tick);else snap();}
function wake(){if(reduced.matches){cancelAnimationFrame(frame);frame=0;snap();return;}if(!frame){last=0;frame=requestAnimationFrame(tick);}}
for(const b of buttons)b.addEventListener('click',()=>{if(selected)close(false);filter=b.dataset.filter;for(const x of buttons)x.setAttribute('aria-pressed',String(x===b));pageIndex=0;const u=new URL(location.href);if(filter==='communiverse')u.searchParams.delete('filter');else u.searchParams.set('filter',filter);u.searchParams.delete('person');history.replaceState(null,'',u);measure();targets();wake();},{signal});
pagination.addEventListener('click',e=>{const b=e.target.closest('[data-people-page]');if(!b||b.disabled)return;pageIndex+=b.dataset.peoplePage==='next'?1:-1;measure();targets();wake();},{signal});
window.addEventListener('popstate',()=>{const u=new URL(location.href),f=normalizeFilter(u.searchParams.get('filter'));if(buttons.some(b=>b.dataset.filter===f)&&f!==filter){filter=f;pageIndex=0;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));}const id=u.searchParams.get('person');if(!id){close(false,false);return;}const n=nodes.find(n=>n.p.slug===id);if(!n){close(false,false);return;}measure();const i=allMatching.indexOf(n),limit=filter==='communiverse'?WIDE.length:TIGHT.length;if(i>=0){pageIndex=Math.floor(i/limit);measure();if(selected!==n)select(n,false);}},{signal});
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
const initialPerson=new URL(location.href).searchParams.get('person');if(initialPerson){const n=nodes.find(n=>n.p.slug===initialPerson),limit=filter==='communiverse'?WIDE.length:TIGHT.length;if(n){const i=allMatching.indexOf(n);if(i>=0){pageIndex=Math.floor(i/limit);measure();select(n,false);if(reduced.matches)snap();}}}

window.__cvPlugFocusState=()=>({release:RELEASE,selected:selected?.p.slug||null,filter,pageIndex,totalPages,totalMatching:allMatching.length,visible:visible.map(n=>n.p.slug),animating:!!frame,compactMotion,residual:Math.max(...visible.map(n=>Math.hypot(n.x-n.tx,n.y-n.ty))),reducedMotion:reduced.matches});
})();
