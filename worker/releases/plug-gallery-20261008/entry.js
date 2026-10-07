// Gallery and mobile motion layer; every earlier runtime module is retained.
import previous from './plug-refine-entry.js';
import STYLE from './plug-gallery.css';
import FOCUS from './plug-gallery-focus.txt';
import {ARTISTS,RELEASE,PREFIX,profileContent,serialize,escapeHTML} from './plug-gallery-data.js';
const profiles=new Map(ARTISTS.map(p=>[p.profileUrl.replace(/\/$/,''),p]));
const intents=new Set(['workshop','group-session','order']);
export default {async fetch(request,env,ctx){
 const u=new URL(request.url);
 if(!['espacios.me','www.espacios.me'].includes(u.hostname))return previous.fetch(request,env,ctx);
 const asset=u.pathname===PREFIX+'.css'?['text/css; charset=utf-8',STYLE]:u.pathname===PREFIX+'.js'?['application/javascript; charset=utf-8',FOCUS]:null;
 if(asset){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  return new Response(request.method==='HEAD'?null:asset[1],{headers:{'Content-Type':asset[0],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','X-Communiverse-Plug':RELEASE}});
 }
 const path=u.pathname.replace(/\/$/,''),plug=path==='/communiverse/plug',profile=profiles.get(path),person=ARTISTS.find(p=>p.slug===u.searchParams.get('artist')),intent=u.searchParams.get('intent');
 const contact=path==='/communiverse/contact',enquiry=contact&&person&&intents.has(intent);
 if(contact&&person&&intent==='commission'&&['GET','HEAD'].includes(request.method))return Response.redirect(u.origin+person.profileUrl,302);
 const r=await previous.fetch(request,env,ctx);
 if((!plug&&!profile&&!enquiry)||!['GET','HEAD'].includes(request.method)||r.status!==200||!r.headers.get('Content-Type')?.includes('text/html'))return r;
 const headers=new Headers(r.headers);headers.set('X-Communiverse-Plug',RELEASE);headers.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>headers.delete(k));
 if(request.method==='HEAD'){await r.body?.cancel();return new Response(null,{status:200,headers});}
 const rewrite=new HTMLRewriter().on('head',{element(el){el.append(`<link rel="stylesheet" href="${PREFIX}.css">${plug?'':`<script defer src="${PREFIX}.js"></script>`}`,{html:true});}});
 if(enquiry)return rewrite.on('body',{element(el){el.append(`<script type="application/json" id="cv-enquiry-data">${serialize({name:person.name,role:person.role,slug:person.slug,intent,itemTitle:person.itemTitle})}</script>`,{html:true});}}).transform(new Response(r.body,{headers}));
 if(profile)return rewrite.on('script[src]',{element(el){if(['/communiverse/_public/20261008-plug-refine-3.js','/communiverse/_public/20261008-plug-artists-1.js'].includes(el.getAttribute('src')))el.remove();}})
 .on('title',{element(el){el.setInnerContent(escapeHTML(profile.galleryLabel+' | Communiverse'),{html:true});}})
 .on('main',{element(el){el.setInnerContent(profileContent(profile),{html:true});}}).transform(new Response(r.body,{headers}));
 const source=await r.text(),pattern=/(<script\b[^>]*\bid="cv-focus-data"[^>]*>)([\s\S]*?)(<\/script>)/,match=source.match(pattern);
 if(!match||source.length>512000)return new Response('People view temporarily unavailable',{status:503,headers});
 const people=JSON.parse(match[2]);if(people.length!==23||people.filter(p=>p.category==='artists').length!==10)return new Response('People view temporarily unavailable',{status:503,headers});
 const html=source.replace(pattern,(_,a,b,c)=>a+serialize(people.map(p=>ARTISTS.find(x=>x.slug===p.slug)||p))+c);
 return rewrite.on('.cv-plug',{element(el){el.setAttribute('data-cv-plug-release',RELEASE);}})
 .on('script[src],link[as="script"]',{element(el){const key=el.tagName==='script'?'src':'href';if(el.getAttribute(key)==='/communiverse/_public/20261008-plug-refine-3.js')el.setAttribute(key,PREFIX+'.js');}})
 .transform(new Response(html,{headers}));
}};
