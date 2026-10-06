// Additive production release: names and group labels supplied by the site owner.
// No deck, page screenshot, compensation, financial figures, contact details,
// inferred biography, social metrics, or new account records are published.
export const RELEASE = '20261006-plug-portraits-1';
export const PORTRAIT_PREFIX = '/communiverse/_public/portraits/20261006/';
export const PORTRAITS = [
  {id:'haseeb-wasim',name:'Haseeb Wasim',group:'Team',file:'haseeb-wasim.png',sha256:'94cde59e0003aee49becb4b3b7996a83c7b386cafa597ab859345942204ab4af',bytes:100450},
  {id:'alison-gonzalez',name:'Alison Gonzalez',group:'Team',file:'alison-gonzalez.png',sha256:'ae15a505c0e2b14cf8f5807278ad1a9f33dc69aa2f0ba0c9edd5f2a69fe4db81',bytes:120164},
  {id:'abel-thomas',name:'Abel Thomas',group:'Team',file:'abel-thomas.png',sha256:'004e58d0334666d39f6f37d1b7484075e0c7235b42b87147936565c8baf5690d',bytes:284286},
  {id:'louis-mitchell',name:'Louis Mitchell',group:'Team',file:'louis-mitchell.png',sha256:'c643cbbb334d56a30d3100c919b73a14b190306f6f8054a98cf2d3b2f985ab20',bytes:55804},
  {id:'elferah-saidil',name:'Elferah Saidil',group:'Team',file:'elferah-saidil.png',sha256:'43658ea47ff5bf225b4342283169f7463346914742d0d366ac0953f4c7099ace',bytes:77201},
  {id:'keiffer',name:'Keiffer',group:'Team',file:'keiffer.png',sha256:'747b9008fa060f5780ee36f15dbeea4c805903fbf687138100fd607a82f91e47',bytes:110240},
  {id:'hassan-b-mirza',name:'Hassan B. Mirza',group:'Team',file:'hassan-b-mirza.png',sha256:'4c14e632f488eca4d920e1e9f7860b7be5fa3316fc4b59c675255508429efb06',bytes:119849},
  {id:'luna',name:'Luna',group:'Ambassadors',file:'luna.png',sha256:'a7e3d9cdc91b4bb558726530d976015f3b650c44e2144109de7a76733dc7100d',bytes:135864},
  {id:'turbooz',name:'@_turbooz',group:'Ambassadors',file:'turbooz.png',sha256:'52a89abacc1e8358412eb840474b1c0ad2eb5c166bcba58782854419b42140c0',bytes:183404},
  {id:'abdallah-mahmoudd',name:'@abdallah_mahmoudd',group:'Ambassadors',file:'abdallah-mahmoudd.png',sha256:'f7469e0077e6f8c09a7e6d595bea4d0353790327f9b9f3ae24e12fa7c0ce0a41',bytes:124999},
];

export function makePeoplePlug(baselineSource) {
  let source = baselineSource;
  function replaceOnce(from, to, label) {
    const pos = source.indexOf(from);
    if (pos < 0 || source.indexOf(from, pos + from.length) >= 0) throw new Error('Unexpected baseline: ' + label);
    source = source.replace(from, to);
  }
  replaceOnce('export const RELEASE = "20261006-plug-2";', 'export const RELEASE = '+JSON.stringify(RELEASE)+';', 'release');
  source = 'import { PEOPLE } from "./portrait-media.js";\n' + source;
  replaceOnce('return { ok: true, members: parseDirectory(html) };', 'return { ok: true, members: addCurated(parseDirectory(html)) };', 'directory');
  replaceOnce('const facets = ["all"];', 'const facets = ["all"];\n  if (member.curatedGroup === "Team") facets.push("team");\n  if (member.curatedGroup === "Ambassadors") facets.push("ambassadors");', 'facets');
  replaceOnce('{ id: "all", label: "All" },', '{ id: "all", label: "All" },\n  { id: "team", label: "Team" },\n  { id: "ambassadors", label: "Ambassadors" },', 'filters');
  replaceOnce('function memberScore(member) {', 'function memberScore(member) {\n  if (Number.isInteger(member.curatedOrder)) return 1000-member.curatedOrder;', 'ordering');
  replaceOnce('directory = { ok: false, members: [] };\n  }\n  return new Response', 'directory = { ok: true, members: addCurated([]) };\n  }\n  return new Response', 'fallback');
  source += `\n// Curated entries are presentation records, not authenticated Plug accounts.\nfunction addCurated(existing) {\n  const curated = PEOPLE.map((p,index)=>({slug:'cv-'+p.id,name:p.name,spec:p.group,location:'',summary:'',chips:[],image:${JSON.stringify('https://espacios.me'+PORTRAIT_PREFIX)}+p.file,initial:p.name.replace(/^[@_]+/,'').charAt(0),profileUrl:'/communiverse/plug/person/'+p.id+'/',curatedGroup:p.group,curatedOrder:index}));\n  return [...curated,...existing];\n}\n`;
  return source;
}

export const DETAIL_STYLE = `html{color-scheme:light}body{margin:0;background:#f3f6fb;background-image:none;color:#172033;font:14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}.detail{min-height:100svh;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px 40px;gap:18px}.back{position:absolute;left:20px;top:16px;display:inline-flex;align-items:center;min-height:44px;color:inherit;text-decoration:none}.portrait{width:min(64vw,320px);aspect-ratio:1;object-fit:cover;border-radius:50%;display:block}h1{font-size:clamp(22px,5vw,32px);line-height:1.3;margin:0;text-align:center;overflow-wrap:anywhere}p{margin:0}.group{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#555}.contact{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border:1px solid #1115;border-radius:999px;color:inherit;text-decoration:none}:focus-visible{outline:2px solid #111;outline-offset:4px}`;

export const ENTRY = `import previous from './pr6-entry.js';
import { handlePlug, RELEASE, escapeHtml } from './people-plug.js';
import { PEOPLE, portraitResponse } from './portrait-media.js';
import DETAIL_STYLE from './people-detail.css';
const PREFIX='/communiverse/plug/person/';
function headers(type='text/html; charset=utf-8'){return new Headers({'Content-Type':type,'Cache-Control':'no-store','X-Communiverse-Release':RELEASE,'X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':\"base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' https: data:\"});}
function details(request){const u=new URL(request.url);if(!u.pathname.startsWith(PREFIX))return null;const id=u.pathname.slice(PREFIX.length).replace(/\\/$/,'');const person=PEOPLE.find(p=>p.id===id);const h=headers();if(!person)return new Response('Not found',{status:404,headers:h});if(!['GET','HEAD'].includes(request.method)){h.set('Allow','GET, HEAD');return new Response('Method not allowed',{status:405,headers:h});}const name=escapeHtml(person.name),group=escapeHtml(person.group==='Team'?'Communiverse team':'Communiverse ambassador'),image='/communiverse/_public/portraits/20261006/'+person.file;const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>'+name+' | Communiverse</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://espacios.me'+PREFIX+id+'/"><style>'+DETAIL_STYLE+'</style></head><body><a class="back" href="/communiverse/plug/">Back to people</a><main class="detail"><img class="portrait" src="'+image+'" alt="'+name+'" width="'+person.width+'" height="'+person.height+'"><p class="group">'+group+'</p><h1>'+name+'</h1><a class="contact" href="/communiverse/contact/#contact">Contact Communiverse</a></main></body></html>';return new Response(request.method==='HEAD'?null:html,{headers:h});}
export default {async fetch(request,env,ctx){const u=new URL(request.url);if(!['espacios.me','www.espacios.me'].includes(u.hostname))return previous.fetch(request,env,ctx);return portraitResponse(request)||details(request)||(await handlePlug(request))||previous.fetch(request,env,ctx);}};
`;
