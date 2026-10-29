/* Selection commits immediately; only the visible change is animated. */
(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),groups=[];
 for(const root of document.querySelectorAll('[data-attendance-circles]')){
  if(root.dataset.enhanced)continue;root.dataset.enhanced='true';
  const items=[...root.querySelectorAll('.cv-attendance-person')],triggers=items.map(x=>x.querySelector('.cv-attendance-trigger')),status=root.querySelector('.cv-attendance-status');let selected=null,animations=[];
  const stop=()=>{animations.forEach(a=>a.cancel());animations=[]};
  const rects=()=>items.map(e=>({item:e.getBoundingClientRect(),photo:e.querySelector('.cv-attendance-photo').getBoundingClientRect()}));
  function select(next){const before=rects();stop();const previous=selected;selected=next;
   items.forEach((item,i)=>{const active=item===next;item.dataset.expanded=String(active);triggers[i].setAttribute('aria-expanded',String(active));item.querySelector('.cv-attendance-detail').hidden=!active;});
   status.textContent=next?next.querySelector('.cv-attendance-name').textContent+' selected. View circle to open the profile.':'Circle selection cleared.';
   if(!reduced.matches&&Element.prototype.animate){const after=rects();items.forEach((item,i)=>{const from=before[i],to=after[i];animations.push(item.animate([{transform:`translate(${from.item.left-to.item.left}px,${from.item.top-to.item.top}px)`},{transform:'translate(0,0)'}],{duration:280,easing:'cubic-bezier(.2,.75,.2,1)'}));const photo=item.querySelector('.cv-attendance-photo');animations.push(photo.animate([{transform:`scale(${from.photo.width/to.photo.width})`},{transform:'scale(1)'}],{duration:280,easing:'cubic-bezier(.2,.75,.2,1)'}));});}
   if(previous&&previous!==next&&previous.querySelector('.cv-attendance-detail').contains(document.activeElement))previous.querySelector('.cv-attendance-trigger').focus({preventScroll:true});
  }
  items.forEach((item,i)=>{const trigger=triggers[i],detail=item.querySelector('.cv-attendance-detail');detail.hidden=true;item.dataset.expanded='false';trigger.setAttribute('role','button');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',detail.id);
   trigger.addEventListener('click',e=>{if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();select(selected===item?null:item);});
   trigger.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const index=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;triggers[index].focus({preventScroll:true});select(items[index]);}});
  });
  root.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected){const trigger=selected.querySelector('.cv-attendance-trigger');e.preventDefault();select(null);trigger.focus({preventScroll:true});}});
  groups.push({stop});
 }
 // The directory retains its own selection and panels; mobile grid motion follows that state.
 const directory=document.querySelector('.cv-plug'),stage=directory?.querySelector('.stage');
 if(stage){let directoryAnimations=[],queued=false;const stop=()=>{directoryAnimations.forEach(a=>a.cancel());directoryAnimations=[]};groups.push({stop});
  const capture=()=>{if(innerWidth>600||queued)return;queued=true;const selected=directory.dataset.focusedPerson,items=[...stage.querySelectorAll('.node:not([hidden])')],before=items.map(e=>({item:e.getBoundingClientRect(),photo:e.querySelector('img,.ph')?.getBoundingClientRect()}));
   queueMicrotask(()=>{queued=false;if(selected===directory.dataset.focusedPerson)return;stop();if(reduced.matches||!CSS.supports('translate','1px'))return;
    const after=items.map(e=>({item:e.getBoundingClientRect(),photo:e.querySelector('img,.ph')?.getBoundingClientRect()}));items.forEach((item,i)=>{if(item.hidden||!before[i].photo||!after[i].photo)return;const a=before[i],b=after[i],timing={duration:280,easing:'cubic-bezier(.2,.75,.2,1)'};directoryAnimations.push(item.animate([{translate:`${a.item.x-b.item.x}px ${a.item.y-b.item.y}px`},{translate:'0px 0px'}],timing));directoryAnimations.push(item.querySelector('img,.ph').animate([{scale:String(a.photo.width/b.photo.width)},{scale:'1'}],timing));});
   });
  };
  directory.addEventListener('click',capture,true);directory.addEventListener('keydown',e=>{if(['Enter',' ','Escape'].includes(e.key))capture()},true);
 }
 const stopAll=()=>groups.forEach(g=>g.stop());
 addEventListener('resize',stopAll,{passive:true});addEventListener('pagehide',stopAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});reduced.addEventListener('change',stopAll);
})();
