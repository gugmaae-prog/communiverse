/* Staging-only Plug orbit clearance.
 * Keep the story CTA unobstructed by temporarily fading ONLY the small set of
 * portrait nodes that intersect the CTA itself. Never hide the entire story card
 * area or move/replace the original people circles.
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
  const story=work?.querySelector('.cv-card-expand');
  const focused=plug?.classList.contains('is-focused')&&!panel?.inert&&panel?.getAttribute('aria-hidden')!=='true';
  const real=focused&&story&&getComputedStyle(story).display!=='none'&&story.getBoundingClientRect().width>0;
  const bounds=real?story.getBoundingClientRect():null;
  let count=0;
  for(const node of nodes){
   const r=node.getBoundingClientRect(),computed=getComputedStyle(node);
   // The selected person's focal circle may remain visible unless it physically
   // intersects the card. Hidden/removed nodes are never modified unnecessarily.
   const hasHit=!!bounds&&computed.display!=='none'&&r.width>12&&overlap(bounds,r,8);
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
 let motionFrame=0,motionUntil=0,lastCheck=0;
 function checkMotion(time){
  if(time-lastCheck>=28){lastCheck=time;refresh()}
  if(time<motionUntil)motionFrame=requestAnimationFrame(checkMotion);
  else motionFrame=0;
 }
 function settle(){
  // Only during a user-initiated Plug transition, check clearance at roughly
  // 30fps. CSS portrait transforms continue between discrete JS updates.
  motionUntil=Math.max(motionUntil,performance.now()+1150);
  if(!motionFrame)motionFrame=requestAnimationFrame(checkMotion);
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