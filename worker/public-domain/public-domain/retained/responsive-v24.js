(()=>{'use strict';
if(window.__cvResponsiveV24)return;window.__cvResponsiveV24=true;
const root=document.documentElement,header=document.querySelector('#cv-social-header');
let frame=0,timer=0,lastHeight=0;
function measure(){frame=0;const height=Math.round(header?.getBoundingClientRect().height||0);if(height!==lastHeight){lastHeight=height;root.style.setProperty('--cv-header-height',height+'px');}}
function schedule(){if(!frame)frame=requestAnimationFrame(measure);}
function revealEditingField(){
 const field=document.activeElement;
 if(!(field instanceof HTMLElement)||!field.matches('input:not([type=hidden]),textarea,select,[contenteditable=true]')||!field.getClientRects().length)return;
 const viewport=window.visualViewport,dialog=field.closest('dialog[open]'),bounds=dialog?.getBoundingClientRect(),rect=field.getBoundingClientRect();
 const headerBottom=!dialog&&header&&['sticky','fixed'].includes(getComputedStyle(header).position)?header.getBoundingClientRect().bottom:0;
 const top=Math.max(viewport?.offsetTop||0,bounds?.top||headerBottom)+16;
 const bottom=Math.min((viewport?.offsetTop||0)+(viewport?.height||innerHeight),bounds?.bottom||innerHeight)-16;
 if(rect.top<top||rect.bottom>bottom)field.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
function resize(){root.classList.add('cv-layout-resizing');schedule();clearTimeout(timer);timer=setTimeout(()=>{root.classList.remove('cv-layout-resizing');revealEditingField();},180);}
const observer=header&&'ResizeObserver' in window?new ResizeObserver(schedule):null;
observer?.observe(header);schedule();addEventListener('resize',resize,{passive:true});window.visualViewport?.addEventListener('resize',resize,{passive:true});
addEventListener('pagehide',event=>{cancelAnimationFrame(frame);frame=0;clearTimeout(timer);root.classList.remove('cv-layout-resizing');if(!event.persisted){observer?.disconnect();removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);}});
addEventListener('pageshow',()=>{observer?.observe(header);schedule();});
})();
