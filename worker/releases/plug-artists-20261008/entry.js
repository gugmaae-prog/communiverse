// Public presentation wrapper around the exact marketplace runtime.
import previous from './script.js';
import STYLE from './plug-artists.css';
import FOCUS from './plug-artists-focus.txt';
import GLASS from './glass-shaping.mp4';
import {ARTISTS,RELEASE,PREFIX,portrait,profileContent,serialize,escapeHTML} from './plug-artists-data.js';
const hosts=new Set(['espacios.me','www.espacios.me']);
const profiles=new Map(ARTISTS.map(p=>[p.profileUrl.replace(/\/$/,''),p]));
const backOffice=new Set(['cv-alison-gonzalez','cv-abel-thomas','cv-louis-mitchell','cv-elferah-saidil','cv-keiffer','cv-hassan-b-mirza']);
const assetHeaders=type=>({'Content-Type':type,'Cache-Control':'public, max-age=31536000, immutable','X-Communiverse-Plug':RELEASE,'X-Content-Type-Options':'nosniff'});
export function videoResponse(request,data){
 const bytes=new Uint8Array(data),total=bytes.byteLength;
 const headers=new Headers(assetHeaders('video/mp4'));headers.set('Accept-Ranges','bytes');
 const value=request.headers.get('Range');let start=0,end=total-1,status=200;
 if(value){
  const match=/^bytes=(\d*)-(\d*)$/.exec(value);
  if(!match||(!match[1]&&!match[2])){headers.set('Content-Range','bytes */'+total);return new Response(null,{status:416,headers});}
  if(!match[1])start=Math.max(0,total-Number(match[2]));else start=Number(match[1]);
  if(match[1]&&match[2])end=Math.min(end,Number(match[2]));
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=total||end<start){headers.set('Content-Range','bytes */'+total);return new Response(null,{status:416,headers});}
  status=206;headers.set('Content-Range',`bytes ${start}-${end}/${total}`);
 }
 headers.set('Content-Length',String(end-start+1));
 return new Response(request.method==='HEAD'?null:bytes.slice(start,end+1),{status,headers});
}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);if(!hosts.has(url.hostname))return previous.fetch(request,env,ctx);
 const path=url.pathname.replace(/\/$/,''),page=path==='/communiverse/plug',profile=profiles.get(path);
 const asset=url.pathname===PREFIX+'.css'?['text/css; charset=utf-8',STYLE]:url.pathname===PREFIX+'.js'?['application/javascript; charset=utf-8',FOCUS]:null;
 if(asset||url.pathname===PREFIX+'/glass-shaping.mp4'){
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
  if(!asset)return videoResponse(request,GLASS);
  return new Response(request.method==='HEAD'?null:asset[1],{headers:assetHeaders(asset[0])});
 }
 const response=await previous.fetch(request,env,ctx);
 if((!page&&!profile)||!['GET','HEAD'].includes(request.method)||response.status!==200||!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);headers.set('X-Communiverse-Plug',RELEASE);headers.set('Cache-Control','no-store');['Content-Length','Content-Encoding','ETag','Last-Modified'].forEach(k=>headers.delete(k));
 if(request.method==='HEAD'){await response.body?.cancel();return new Response(null,{status:200,headers});}
 if(profile)return new HTMLRewriter().on('head',{element(el){el.append(`<link rel="stylesheet" href="${PREFIX}.css"><script defer src="${PREFIX}.js"></script>`,{html:true});}}).on('main',{element(el){el.setInnerContent(profileContent(profile),{html:true});}}).transform(new Response(response.body,{status:200,headers}));
 // This directory is a known, small document. Fail closed if its contract changes.
 const source=await response.text();if(source.length>512000)return new Response('People view temporarily unavailable',{status:503,headers});
 const pattern=/(<script\b[^>]*\bid="cv-focus-data"[^>]*>)([\s\S]*?)(<\/script>)/,match=source.match(pattern);
 if(!match)return new Response('People view temporarily unavailable',{status:503,headers});
 const original=JSON.parse(match[2]);
 if(original.filter(p=>p.category==='cool-kids').length!==10||original.filter(p=>p.category==='ambassadors').length!==3)return new Response('People view temporarily unavailable',{status:503,headers});
 const team=original.map(p=>backOffice.has(p.slug)?{...p,eyebrow:'Back office',team:'Back office'}:p);
 const people=[...team.filter(p=>!ARTISTS.some(a=>a.slug===p.slug)),...ARTISTS];
 const html=source.replace(pattern,(_all,start,_json,end)=>start+serialize(people)+end);
 return new HTMLRewriter().on('head',{element(el){el.append(`<link rel="stylesheet" href="${PREFIX}.css">`,{html:true});}})
  .on('.cv-plug',{element(el){el.setAttribute('data-cv-plug-release',RELEASE);}})
  .on('#constellation',{element(el){el.append(ARTISTS.map(portrait).join(''),{html:true});}})
  .on('script[src],link[as="script"]',{element(el){const key=el.tagName==='script'?'src':'href',value=el.getAttribute(key);if(value==='/communiverse/_public/20261007-plug-people-1/focus.js')el.setAttribute(key,PREFIX+'.js');}})
  .on('noscript',{element(el){el.setInnerContent('<ul>'+people.map(p=>`<li><a href="${escapeHTML(p.profileUrl)}">${escapeHTML(p.name)}</a></li>`).join('')+'</ul>',{html:true});}})
  .transform(new Response(html,{status:200,headers}));
}};
