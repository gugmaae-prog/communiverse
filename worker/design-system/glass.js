/* Presentation and keyboard support only. Never alter multi-select input types. */
(()=>{'use strict';
const root=document.documentElement;if(!root.hasAttribute('data-cv-social')||root.dataset.cvGlassDesign)return;root.dataset.cvGlassDesign='20261011-glass';
const singles='.cv-ws-tabs,.cv-feed-tabs[aria-label="Feed view"],.cv-plug .filters';
function sweep(){
 for(const group of document.querySelectorAll(singles)){
  const buttons=[...group.querySelectorAll('button[data-ws-tab],button[data-filter],button[data-view]')];if(!buttons.length)continue;
  if(group.getAttribute('role')!=='radiogroup')group.setAttribute('role','radiogroup');
  for(const b of buttons){const checked=b.getAttribute('aria-pressed')==='true';if(b.getAttribute('role')!=='radio')b.setAttribute('role','radio');if(b.getAttribute('aria-checked')!==String(checked))b.setAttribute('aria-checked',String(checked));}
 }
 for(const group of document.querySelectorAll('[role=radiogroup]')){
  const radios=[...group.querySelectorAll('[role=radio]')].filter(b=>!b.hidden&&!b.disabled);const active=radios.find(b=>b.getAttribute('aria-checked')==='true')||radios[0];
  for(const b of radios){const index=b===active?0:-1;if(b.tabIndex!==index)b.tabIndex=index;}
 }
 for(const b of document.querySelectorAll('.cv-ws-tabs button,.filters button,.cv-feed-tabs[aria-label="Feed view"] button,.cv3-kind-tile,.cv3-mention-choice')){
  if(!b.querySelector(':scope > .cv-selection-dot')){const dot=document.createElement('span');dot.className='cv-selection-dot';dot.setAttribute('aria-hidden','true');b.prepend(dot);}
 }
}
document.addEventListener('keydown',e=>{
 const radio=e.target.closest?.('[role=radio]');const group=radio?.closest('[role=radiogroup]');if(!radio||!group||!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key))return;
 const choices=[...group.querySelectorAll('[role=radio]')].filter(b=>!b.hidden&&!b.disabled&&b.getClientRects().length);if(!choices.length)return;
 let index=choices.indexOf(radio);index=e.key==='Home'?0:e.key==='End'?choices.length-1:(index+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+choices.length)%choices.length;
 e.preventDefault();choices[index].focus();choices[index].click();sweep();
});
let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sweep()})}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','aria-checked','hidden']});sweep();
})();
