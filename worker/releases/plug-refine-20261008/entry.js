// A scoped refinement around the exact, retained artist presentation runtime.
import previous from './plug-artists-entry.js';
import STYLE from './plug-refine.css';
import FOCUS from './plug-refine-focus.txt';
import {ARTISTS,RELEASE,PREFIX,profileContent,serialize,escapeHTML} from './plug-refine-data.js';
const profiles=new Map(ARTISTS.map(p=>[p.profileUrl.replace(/\/$/,''),p]));
export default {async fetch(request,env,ctx){
 const u=new URL(request.url);
 if(!['espacios.me','www.espacios.me'].includes(u.hostname))return previous.fetch(request,env,ctx);
 const asset=u.pathname===PREFIX+'.css'?['text/css; charset=utf-8',STYLE]:u.pathname===PREFIX+'.js'?['application/javascript; charset=utf-8',FOCUS]:null;
 if(asset){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  return new Response(request.method==='HEAD'?null:asset[1],{headers:{'Content-Type':asset[0],'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','X-Communiverse-Plug':RELEASE}});
 }
 const path=u.pathname.replace(/\/$/,''),plug=path==='/communiverse/plug',profile=profiles.get(path),enquiry=path==='/communiverse/contact'&&u.searchParams.get('intent')==='commission'&&ARTISTS.some(p=>p.slug===u.searchParams.get('artist'));
 const r=await previous.fetch(request,env,ctx);
 if((!plug&&!profile&&!enquiry)||!['GET','HEAD'].includes(request.method)||r.status!==200||!r.headers.get('Content-Type')?.includes('text/html'))return r;
 const headers=new Headers(r.headers);headers.set('X-Communiverse-Plug',RELEASE);headers.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>headers.delete(k));
 if(request.method==='HEAD'){await r.body?.cancel();return new Response(null,{status:200,headers});}
 const rewrite=new HTMLRewriter().on('head',{element(el){el.append(`<link rel="stylesheet" href="${PREFIX}.css">${plug?'':`<script defer src="${PREFIX}.js"></script>`}`,{html:true});}});
 if(enquiry){const p=ARTISTS.find(p=>p.slug===u.searchParams.get('artist'));return rewrite.on('body',{element(el){el.append(`<script type="application/json" id="cv-enquiry-data">${serialize({name:p.name,role:p.role,slug:p.slug})}</script>`,{html:true});}}).transform(new Response(r.body,{headers}));}
 // Remove the previous profile script; its retained assets remain reachable.
 if(profile)return rewrite.on('script[src]',{element(el){if(el.getAttribute('src')==='/communiverse/_public/20261008-plug-artists-1.js')el.remove();}}).on('main',{element(el){el.setInnerContent(profileContent(profile),{html:true});}}).transform(new Response(r.body,{headers}));
 const source=await r.text(),pattern=/(<script\b[^>]*\bid="cv-focus-data"[^>]*>)([\s\S]*?)(<\/script>)/,match=source.match(pattern);
 if(!match||source.length>512000)return new Response('People view temporarily unavailable',{status:503,headers});
 const people=JSON.parse(match[2]);
 if(people.length!==23||people.filter(p=>p.category==='artists').length!==10)return new Response('People view temporarily unavailable',{status:503,headers});
 const updated=people.map(p=>ARTISTS.find(a=>a.slug===p.slug)||p);
 const html=source.replace(pattern,(_,a,b,c)=>a+serialize(updated)+c);
 return rewrite.on('.cv-plug',{element(el){el.setAttribute('data-cv-plug-release',RELEASE);}})
 .on('.filters',{element(el){el.append('<button type="button" data-filter="artists" aria-pressed="false">Artists</button>',{html:true});}})
 .on('script[src],link[as="script"]',{element(el){const key=el.tagName==='script'?'src':'href';if(el.getAttribute(key)==='/communiverse/_public/20261008-plug-artists-1.js')el.setAttribute(key,PREFIX+'.js');}})
 .transform(new Response(html,{headers}));
}};
