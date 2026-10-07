// Public people curation only. Preserve the complete current gallery/UI Worker.
import previous from './gallery-media-entry.js';
import {RELEASE,PHOTO_ROOT,ADDITIONS,ABDALLAH,mergePeople,serializePeople,portraitNode,profileDocument,escapeHTML} from './members-20261007-data.js';
import tariq from './members-20261007-portraits/tariq-al-salman.webp';
import viktoriya from './members-20261007-portraits/viktoriya-melny.webp';
import shakiba from './members-20261007-portraits/shakiba-binchi.webp';
import abdallah from './members-20261007-portraits/abd-allah-mahmoud.webp';
import FOCUS_SCRIPT from './members-20261007-focus.txt';
const photos=new Map([['tariq-al-salman.webp',tariq],['viktoriya-melny.webp',viktoriya],['shakiba-binchi.webp',shakiba],['abd-allah-mahmoud.webp',abdallah]]);
const profiles=new Map([...ADDITIONS,ABDALLAH].map(p=>[p.profileUrl.replace(/\/$/,''),p]));
profiles.set('/communiverse/plug/person/abd-allah-mahmoud',ABDALLAH);
export default {async fetch(request,env,ctx){
  const url=new URL(request.url),page=['/communiverse/plug','/communiverse/plug/'].includes(url.pathname);
  if(!['espacios.me','www.espacios.me'].includes(url.hostname))return previous.fetch(request,env,ctx);
  if(url.pathname===PHOTO_ROOT+'focus.js'){
    const headers={'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','X-Communiverse-People':RELEASE,'X-Content-Type-Options':'nosniff'};
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET, HEAD'}});
    return new Response(request.method==='HEAD'?null:FOCUS_SCRIPT,{headers});
  }
  const photo=url.pathname.startsWith(PHOTO_ROOT)?photos.get(url.pathname.slice(PHOTO_ROOT.length)):null;
  const profile=profiles.get(url.pathname.replace(/\/$/,''));
  if(photo||profile){
    const headers={'Content-Type':photo?'image/webp':'text/html; charset=utf-8','Cache-Control':photo?'public, max-age=31536000, immutable':'no-store','X-Communiverse-People':RELEASE,'X-Content-Type-Options':'nosniff'};
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET, HEAD'}});
    if(profile)Object.assign(headers,{'X-Communiverse-Controls':'20261007-plug-ios-2','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' https: data:"});
    return new Response(request.method==='HEAD'?null:photo||profileDocument(profile),{headers});
  }
  const response=await previous.fetch(request,env,ctx);
  if(!page||!['GET','HEAD'].includes(request.method)||response.status!==200)return response;
  const headers=new Headers(response.headers);headers.set('X-Communiverse-People','20261007-plug-team-1');headers.delete('Content-Length');headers.delete('ETag');
  if(request.method==='HEAD')return new Response(null,{status:200,headers});
  const source=await response.text();
  const pattern=/(<script\b[^>]*\bid="cv-focus-data"[^>]*>)([\s\S]*?)(<\/script>)/;
  const match=source.match(pattern);if(!match)return new Response('People view temporarily unavailable',{status:503,headers});
  const original=JSON.parse(match[2]),people=mergePeople(original).filter(p=>p.category==="cool-kids"||p.category==="ambassadors");
  if(people.filter(p=>p.category==="cool-kids").length!==10||people.filter(p=>p.category==="ambassadors").length!==3)return new Response("People view temporarily unavailable",{status:503,headers});
  const added=people.filter(p=>!original.some(o=>o.slug===p.slug));
  const html=source.replace(pattern,(_all,start,_json,end)=>start+serializePeople(people)+end)
    .replaceAll('/communiverse/_public/20261007-plug-ios-2.js',PHOTO_ROOT+'focus.js');
  const rewrite=new HTMLRewriter()
    .on('.cv-plug',{element(el){el.setAttribute('data-cv-people-release','20261007-plug-team-1');}})
    .on('button[data-filter="artisans"]',{element(el){el.remove();}})
    .on('a.node[data-slug]',{element(el){if(!people.some(p=>p.slug===el.getAttribute('data-slug')))el.remove();}})
    .on('#constellation',{element(el){el.append(added.map(portraitNode).join(''),{html:true});}})
    .on('a.node[data-slug="cv-abdallah-mahmoudd"]',{element(el){el.setAttribute('data-name',ABDALLAH.name);el.setAttribute('href',ABDALLAH.profileUrl);}})
    .on('a.node[data-slug="cv-abdallah-mahmoudd"] img',{element(el){el.setAttribute('src',ABDALLAH.image);el.removeAttribute('srcset');}})
    .on('a.node[data-slug="cv-abdallah-mahmoudd"] .cap',{element(el){el.setInnerContent('<b>'+escapeHTML(ABDALLAH.name)+'</b><small>'+escapeHTML(ABDALLAH.role)+'</small>',{html:true});}})
    .on('noscript',{element(el){el.setInnerContent('<ul>'+people.map(p=>'<li><a href="'+escapeHTML(p.profileUrl)+'">'+escapeHTML(p.name)+'</a></li>').join('')+'</ul>',{html:true});}});
  return rewrite.transform(new Response(html,{status:200,headers}));
}};
