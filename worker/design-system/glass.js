/* Presentation and keyboard support only. Never alter multi-select input types. */
(()=>{'use strict';
const root=document.documentElement;if(!root.hasAttribute('data-cv-social')||root.dataset.cvGlassDesign)return;root.dataset.cvGlassDesign='20261011-glass';
function sweep(){
 for(const group of document.querySelectorAll('[role=radiogroup]')){
  const radios=[...group.querySelectorAll('[role=radio]')].filter(b=>!b.hidden&&!b.disabled);const active=radios.find(b=>b.getAttribute('aria-checked')==='true')||radios[0];
  for(const b of radios){const index=b===active?0:-1;if(b.tabIndex!==index)b.tabIndex=index;}
 }
 for(const b of document.querySelectorAll('.cv3-kind-tile,.cv3-mention-choice')){
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
