(()=>{'use strict';
const links=[...document.querySelectorAll('[data-photo]')],dialog=document.querySelector('#avid-viewer'),image=document.querySelector('#avid-viewer-image'),caption=document.querySelector('#avid-viewer-caption');
let current=0,opener=null;
function show(index){current=(index+links.length)%links.length;const link=links[current];image.src=link.href;image.alt=link.querySelector('img').alt;caption.textContent=(current+1)+' / '+links.length+' · '+link.closest('figure').querySelector('figcaption>span').textContent;}
if(dialog&&typeof dialog.showModal==='function'){
 links.forEach((link,index)=>link.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();opener=link;show(index);dialog.showModal();}));
 dialog.querySelector('.avid-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.avid-prev').addEventListener('click',()=>show(current-1));
 dialog.querySelector('.avid-next').addEventListener('click',()=>show(current+1));
 dialog.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
 image.addEventListener('error',()=>{caption.textContent='This photo could not load. Try the next photo or open it from the gallery.';});
}
const share=document.querySelector('.avid-share'),status=document.querySelector('.avid-share-status'),url='https://espacios.me/communiverse/events/avid-learning-poetry-night/';
if(share){share.hidden=false;share.addEventListener('click',async()=>{try{if(navigator.share){await navigator.share({title:'A poetry night with Avid Learning',url});return;}await navigator.clipboard.writeText(url);status.textContent='Link copied. Ready to share.';}catch(error){if(error.name==='AbortError')return;status.replaceChildren();const link=document.createElement('a');link.href=url;link.textContent='Open this story to copy its link';status.append(link);}});}
// Keep the shared header personal without caching account information in the page.
fetch('/communiverse/api/me',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{const m=data?.member;if(!m)return;const host=document.querySelector('#cv-social-header .cv-account'),a=document.createElement('a');a.className='cv-profile-link';a.href='/communiverse/workspace/';a.setAttribute('aria-label','Open your Communiverse profile');a.textContent=String(m.first_name||'Me').slice(0,1);const path=m.photo||'/communiverse/_public/avatar/member-'+encodeURIComponent(m.id);try{const u=new URL(path,location.origin);if(u.origin===location.origin&&u.pathname.startsWith('/communiverse/')){const img=document.createElement('img');img.src=u.href;img.alt='';img.width=44;img.height=44;img.addEventListener('error',()=>{img.remove();a.textContent=String(m.first_name||'Me').slice(0,1)});a.replaceChildren(img);}}catch{}host?.replaceChildren(a);}).catch(()=>{});
})();
