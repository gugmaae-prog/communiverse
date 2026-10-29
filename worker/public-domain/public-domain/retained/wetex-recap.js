(()=>{'use strict';
const section=document.querySelector('#from-wetex');if(!section)return;
const links=[...section.querySelectorAll('[data-wetex-photo]')],extra=[...section.querySelectorAll('[data-recap-extra]')],more=section.querySelector('#wetex-recap-more'),dialog=document.querySelector('#wetex-photo-viewer'),image=document.querySelector('#wetex-photo-image'),caption=document.querySelector('#wetex-photo-caption');
let current=0,opener=null,expanded=false;
const setExpanded=()=>{extra.forEach(figure=>figure.hidden=!expanded);more.setAttribute('aria-expanded',String(expanded));more.textContent=expanded?'Show fewer photos ↑':'Show all '+links.length+' photos ↓';};
more.hidden=false;setExpanded();more.addEventListener('click',()=>{expanded=!expanded;setExpanded();if(!expanded)more.scrollIntoView({block:'nearest',behavior:'instant'});});
function show(index){current=(index+links.length)%links.length;const link=links[current];image.src=link.href;image.alt=link.querySelector('img').alt;caption.textContent=(current+1)+' / '+links.length+' · '+link.closest('figure').querySelector('figcaption>span').textContent;}
if(dialog&&typeof dialog.showModal==='function'){
 links.forEach((link,index)=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();opener=link;show(index);dialog.showModal();}));
 dialog.querySelector('.wetex-photo-close').addEventListener('click',()=>dialog.close());dialog.querySelector('.wetex-photo-prev').addEventListener('click',()=>show(current-1));dialog.querySelector('.wetex-photo-next').addEventListener('click',()=>show(current+1));
 dialog.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 image.addEventListener('error',()=>{caption.textContent='This photo could not load. Try another photo or open it from the gallery.';});
}
})();
