/* Communiverse public search unification, v4.
 * Pure presentation enhancement. Reuses the native input, select, AI button,
 * AI results node, listener references, form submission, and catalog APIs.
 */
(()=>{'use strict';
 if(window.__cvSearchV4?.ready)return;
 const ROOT='/communiverse/';
 const SCOPE=[
  '#cv-feed-search',
  '#cv-artist-search',
  '#cv-product-search',
  '#cv-events-filters input[type=search][name=q]',
  '#cv-circle-filters input[type=search][name=q]',
  '.cv-plug-browse input[type=search]'
 ];
 const FEEDS=['.cv-feed-controls','#cv-circle-filters','.cv-search-line','.cv-plug-browse'];
 const status={ready:true,version:'20261010-v4',fields:0,aiButtonsMoved:0};
 window.__cvSearchV4=status;
 const icon=()=>{
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.75');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.classList.add('cv4-search-symbol');
  const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx','10.8');circle.setAttribute('cy','10.8');circle.setAttribute('r','6.7');svg.append(circle);
  const line=document.createElementNS(ns,'path');line.setAttribute('d','m16 16 5 5');svg.append(line);
  return svg;
 };
 function enhanceField(input){
  if(!(input instanceof HTMLInputElement)||!input.isConnected)return;
  if(input.closest('#cv-workspace'))return;
  const label=input.closest('label');if(!label)return;
  let line=label.querySelector(':scope > .cv4-search-inner');
  if(!line){
   line=document.createElement('div');line.className='cv4-search-inner';
   input.before(line);line.append(icon(),input);
   label.classList.add('cv4-search-field');
   input.dataset.cv4Unified='yes';
   // Explicit input naming is stable when the visual label is reflowed.
   if(!input.getAttribute('aria-label')){
    const direct=[...label.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).find(Boolean);
    if(direct)input.setAttribute('aria-label',direct);
   }
   status.fields++;
  }
  // The existing identity script injects this control asynchronously.
  // Move the original node rather than replacing it: all existing listeners survive.
  const button=[...label.children].find(x=>x.matches?.('button.cv-ai-search-button'));
  if(button){
   button.classList.add('cv4-ai-button');
   button.textContent='AI Search';
   button.setAttribute('aria-label','Search Communiverse by meaning');
   button.title='Find related work and people using AI';
   line.append(button);
   status.aiButtonsMoved++;
  }
  for(const panel of label.querySelectorAll(':scope > .cv-ai-search-results')){
   panel.setAttribute('aria-label','AI search suggestions');
   panel.setAttribute('aria-live','polite');
  }
  const parent=label.parentElement;
  if(parent&&FEEDS.some(sel=>parent.matches(sel)))parent.classList.add('cv4-toolbar');
 }
 function scan(){
  for(const selector of SCOPE)for(const field of document.querySelectorAll(selector))enhanceField(field);
  // Do not attach artificial search fields or act on booking/select-only forms.
 }
 let scheduled=false;
 const observer=new MutationObserver(()=>{
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;scan()});
 });
 function boot(){scan();observer.observe(document.body,{subtree:true,childList:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
