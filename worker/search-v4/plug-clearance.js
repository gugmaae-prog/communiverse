/* Staging-only Plug orbit clearance.
 * Keep profile controls within card bounds and fade ONLY portrait nodes that
 * geometrically intersect an opened story card. Never move/replace originals.
 * Closing or changing the selected person restores unaffected nodes.
 */
(()=>{'use strict';
 if(window.__cv4PlugClearance?.ready)return;
 const state={ready:true,adjusted:0,scans:0};
 window.__cv4PlugClearance=state;
 const overlap=(a,b,padding=6)=>
  a.left<b.right+padding&&a.right>b.left-padding&&a.top<b.bottom+padding&&a.bottom>b.top-padding;
 function refresh(){
  const plug=document.querySelector('.cv-plug'),stage=plug?.querySelector('#constellation'),panel=plug?.querySelector('#cv-person-work');
  if(!stage)return;
  const nodes=[...stage.querySelectorAll('a.node[data-slug]')];
  const work=panel?.querySelector('.glass-card[data-card="work"]');
  const focused=plug?.classList.contains('is-focused')&&!panel?.inert&&panel?.getAttribute('aria-hidden')!=='true';
  const real=focused&&work&&getComputedStyle(work).display!=='none'&&work.getBoundingClientRect().width>0;
  const bounds=real?work.getBoundingClientRect():null;
  let count=0;
  for(const node of nodes){
   const r=node.getBoundingClientRect(),computed=getComputedStyle(node);
   // The selected person's focal circle may remain visible unless it physically
   // intersects the card. Hidden/removed nodes are never modified unnecessarily.
   const hasHit=!!bounds&&computed.display!=='none'&&r.width>12&&overlap(bounds,r,5);
   if(node.classList.contains('cv4-story-clearance')!==hasHit)node.classList.toggle('cv4-story-clearance',hasHit);
   if(hasHit)count++;
  }
  state.adjusted=count;state.scans++;
 }
 let scheduled=false;
 const requestScan=()=>{
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;refresh()});
 };
 function settle(){
  requestScan();
  setTimeout(requestScan,140);
  setTimeout(requestScan,460);
  setTimeout(requestScan,900);
 }
 function init(){
  if(!document.querySelector('.cv-plug'))return;
  settle();
  document.addEventListener('click',event=>{
   if(event.target.closest('.cv-plug #constellation .node, .cv-plug .cv-card-expand, .cv-plug .glass-close, .cv-plug [data-filter], .cv-plug [data-plug-next], .cv-plug [data-plug-prev]'))settle();
  },true);
  const root=document.querySelector('.cv-plug');
  const observer=new MutationObserver(requestScan);
  observer.observe(root,{subtree:true,childList:true});
  window.addEventListener('resize',settle,{passive:true});
  window.addEventListener('popstate',settle);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();