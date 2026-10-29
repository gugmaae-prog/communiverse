import HOME from './pages/home.txt';
const snapshot=HOME.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,s=>s.includes('/cdn-cgi/challenge-platform/')?'':s);
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function contentPage(title,content,status=200,pageClass=''){return new HTMLRewriter().on('main',{element(e){e.setAttribute('class','cv-social cv-content-page '+pageClass);e.setInnerContent(content,{html:true});}}).on('title',{element(e){e.setInnerContent(escapeHTML(title)+' | Communiverse',{html:true});}}).transform(new Response(snapshot,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}}));}
