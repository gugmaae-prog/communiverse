import HOME from './pages/home.txt';
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function contentPage(title,content,status=200){return new HTMLRewriter().on('main',{element(e){e.setAttribute('class','cv-social cv-content-page');e.setInnerContent(content,{html:true});}}).on('title',{element(e){e.setInnerContent(escapeHTML(title)+' | Communiverse',{html:true});}}).transform(new Response(HOME,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}}));}
