/* Production adapter: delegates all non-Plug routes to the exact retained Worker. */
import previous from './people-entry.js';
import {loadPlugDirectory,renderPlugDocument} from './people-plug.js';
import {PEOPLE} from './portrait-media.js';
import SCRIPT from './focus-script.txt';
import CSS from './focus-style.txt';
import PROFILE_TEXT from './focus-profiles.txt';
export const RELEASE='20261006-plug-glass-1';
const ROOT='/communiverse',PREFIX=ROOT+'/_public/'+RELEASE,HOSTS=new Set(['espacios.me','www.espacios.me']);
const DETAILS=JSON.parse(PROFILE_TEXT);
const normalize=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
const named=new Map(PEOPLE.map(p=>[normalize(p.name),p.id]));
named.set('keiffer japeth','keiffer');named.set('keiffer japeth cantara','keiffer');
function clean(v,max=240){return String(v||'').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);}
function publicData(m){
 const id=m.slug?.startsWith('cv-')?m.slug.slice(3):named.get(normalize(m.name));
 const bio=DETAILS[id]||{},curated=!!m.curatedGroup;
 const socials=[];
 if(bio.instagram){const u=new URL(bio.instagram);socials.push({label:'Instagram · @'+u.pathname.replace(/^\/|\/$/g,''),url:u.href});}
 // Only explicitly supplied public social handles are introduced. Existing profile links remain.
 return {slug:m.slug,name:clean(m.name,120),group:m.curatedGroup||'',curated,role:bio.role||clean(m.spec,140)||'Member',summary:bio.summary||clean(m.summary,300),focus:bio.focus||(m.chips||[]).slice(0,4).map(x=>clean(x,64)),profileUrl:m.profileUrl,socials};
}
function fallback(){return PEOPLE.map((p,i)=>({slug:'cv-'+p.id,name:p.name,spec:p.group,summary:'',chips:[],image:'https://espacios.me/communiverse/_public/portraits/20261006/'+p.file,initial:p.name.replace(/^[@_]+/,'').charAt(0),profileUrl:ROOT+'/plug/person/'+p.id+'/',curatedGroup:p.group,curatedOrder:i}));}
function headers(type,cache='no-store'){return new Headers({'Content-Type':type,'Cache-Control':cache,'X-Communiverse-Release':RELEASE,'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' https: data:"});}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);if(!HOSTS.has(url.hostname))return previous.fetch(request,env,ctx);
 const isPage=[ROOT+'/plug',ROOT+'/plug/'].includes(url.pathname),isJs=url.pathname===PREFIX+'.js',isCss=url.pathname===PREFIX+'.css';
 if(!isPage&&!isJs&&!isCss)return previous.fetch(request,env,ctx);
 const h=headers(isJs?'application/javascript; charset=utf-8':isCss?'text/css; charset=utf-8':'text/html; charset=utf-8',isPage?'no-store':'public, max-age=31536000, immutable');
 if(!['GET','HEAD'].includes(request.method)){h.set('Allow','GET, HEAD');h.set('Cache-Control','no-store');return new Response('Method not allowed',{status:405,headers:h});}
 if(request.method==='HEAD')return new Response(null,{headers:h});
 if(isJs||isCss)return new Response(isJs?SCRIPT:CSS,{headers:h});
 let directory;try{directory=await loadPlugDirectory();}catch{directory={ok:true,members:fallback()};}
 const serialized=JSON.stringify(directory.members.map(publicData)).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
 let html=renderPlugDocument(directory);
 const old='<script defer src="/communiverse/_public/20261006-plug-portraits-1.js"></script>';
 if(!html.includes(old))return new Response('People view temporarily unavailable',{status:503,headers:h});
 html=html.replace(old,'').replace('<meta name="cv-public-release" content="20261006-plug-portraits-1">','<meta name="cv-public-release" content="'+RELEASE+'">');
 html=html.replace('</head>','<link rel="stylesheet" href="'+PREFIX+'.css"><script>window.__cvPlugDiagnostics={errors:[]};addEventListener("error",e=>window.__cvPlugDiagnostics.errors.push(String(e.message)));addEventListener("unhandledrejection",e=>window.__cvPlugDiagnostics.errors.push(String(e.reason)));</script></head>');
 html=html.replace('</body>','<script type="application/json" id="cv-focus-data">'+serialized+'</script><script defer src="'+PREFIX+'.js"></script></body>');
 return new Response(html,{headers:h});
}};
