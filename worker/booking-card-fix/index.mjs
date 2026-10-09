/* Communiverse group-session artist card correction.
 * Only changes the artist-card presentation; all booking endpoints,
 * session state, validation and identities remain on the original Worker.
 */
import ARTIST_CARD_CSS from './artist-cards.txt';

const ALLOWED=new Set(['/communiverse/discover','/communiverse/artist']);
const fixPath=p=>p.replace(/\/+$/,'')||'/';
const text=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fail=(error,status=503)=>Response.json({error},{status,headers:{'cache-control':'no-store'}});
async function origin(request,env,path){
 if(!env.MARKETPLACE)return fail('Original Communiverse service unavailable.');
 const url=new URL(request.url);
 url.protocol='https:';
 url.hostname='espacios.me';
 if(path)url.pathname=path;
 return env.MARKETPLACE.fetch(new Request(url,request));
}
async function fixture(request,env){
 try{
  const endpoint=new Request('https://espacios.me/communiverse/api/booking/artists?country=AE&city=Dubai&craft=',{method:'GET',headers:{Accept:'application/json'}});
  const res=await env.MARKETPLACE.fetch(endpoint);
  if(!res.ok)return fail('Artist preview data unavailable',503);
  const data=await res.json(),artists=(Array.isArray(data.artists)?data.artists:[]).slice(0,10);
  const cards=artists.map(a=>'<label class="cv-pick cv-group-pick"><input type="radio" name="artist" value="'+text(a.id)+'" required><img src="'+text(a.image||'/communiverse/_public/artist-avatar/'+a.id+'.svg')+'" alt="" width="56" height="56"><span>'+text(a.title)+'<small>'+text(a.city||a.craft)+(a.locationType==='gallery'?' · gallery connection':'')+'</small></span></label>').join('');
  const html='<!doctype html><html lang="en" data-cv-social="qa"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Communiverse card QA</title><style>body{margin:0;background:#f5f6f8;color:#1d293a;font:16px/1.5 system-ui,sans-serif}.frame{max-width:1040px;margin:32px auto;padding:24px}h2{font-size:24px}fieldset{border:0;padding:0;margin:0}legend{margin-bottom:14px;font-size:14px}.cv-group-artists{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cv-pick{width:65px;align-items:center;cursor:pointer}.cv-group-pick{display:flex!important;gap:12px;min-width:0;border:1px solid #dce2ec;background:white;padding:13px;border-radius:20px}.cv-group-pick img{width:48px;height:48px;flex:0 0 48px;object-fit:cover;border-radius:50%}.cv-group-pick small{display:block;color:#687489}.cv-group-pick input{position:absolute;opacity:0}.cv-group-match{grid-column:1/-1;display:flex;padding:15px;border:1px dashed #cdd5e1;border-radius:18px}</style><style>'+ARTIST_CARD_CSS+'</style></head><body><main class="frame"><p>2 · A practice & a person</p><h2>Choose an artist</h2><form id="cv-group-form"><fieldset><legend>Choose an artist</legend><div id="cv-group-artists" class="cv-group-artists">'+cards+'<label class="cv-group-match"><input type="radio" name="artist" value="find-a-maker">Ask Communiverse to find a maker.</label></div></fieldset></form><pre id="bookingfix-qa-result" hidden></pre></main><script>(()=>{const list=[...document.querySelectorAll("#cv-group-artists .cv-group-pick")],grid=document.querySelector("#cv-group-artists"),w=grid.getBoundingClientRect().width;let dims=list.map(x=>({w:x.getBoundingClientRect().width,text:x.querySelector("span")?.textContent||""}));list[1]?.click();let selected=document.querySelector("#cv-group-form [name=artist]:checked")?.value;requestAnimationFrame(()=>{const styleDebug={hasSupported:CSS.supports("selector(:has(input:checked))"),selectedMatches:list[1]?.matches(":has(input:checked)"),checked:list[1]?.querySelector("input")?.checked,borderFirst:getComputedStyle(list[0]).borderColor,borderSelected:getComputedStyle(list[1]).borderColor,backgroundFirst:getComputedStyle(list[0]).backgroundColor,backgroundSelected:getComputedStyle(list[1]).backgroundColor,rules:[...document.styleSheets].flatMap(ss=>[...ss.cssRules].filter(rr=>rr.selectorText?.includes("input:checked")).map(rr=>({selector:rr.selectorText,css:rr.style?.cssText,match:list[1].matches(rr.selectorText)})))};const tests=[{name:"Real artists returned",pass:list.length>=4},{name:"Every card fills its grid track",pass:list.every(x=>x.getBoundingClientRect().width>=w/(window.innerWidth<=760?1:2)-22)},{name:"Names fit without narrow stacking",pass:list.every(x=>x.querySelector("span").getBoundingClientRect().width>=85)},{name:"Artist radio selection preserved",pass:!!selected&&selected===list[1].querySelector("input").value},{name:"Selected state is styled",pass:!!list[1]&&getComputedStyle(list[1]).borderColor!==getComputedStyle(list[0]).borderColor},{name:"No horizontal overflow",pass:document.documentElement.scrollWidth<=innerWidth+2},{name:"All radio inputs remain in the form",pass:list.every(x=>x.querySelector("input").form.id==="cv-group-form")}];const result=document.querySelector("#bookingfix-qa-result");result.textContent=JSON.stringify({viewport:innerWidth,gridWidth:w,artistCount:list.length,selected,tests,passed:tests.filter(t=>t.pass).length,total:tests.length,dimensions:dims.slice(0,3),styleDebug});result.hidden=false;});})();</script></body></html>';
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Communiverse-Booking-Fix':'qa-only','Content-Security-Policy':"default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self'; object-src 'none'"}});
 }catch{return fail('Booking preview unavailable',503)}
}
class Head{
 element(head){head.append('<style data-cv-booking-cards-fix="20261010">'+ARTIST_CARD_CSS+'</style>',{html:true})}
}
export default {
 async fetch(request,env){
  const url=new URL(request.url),path=fixPath(url.pathname);
  const isPreview=url.hostname.endsWith('.workers.dev');
  if(isPreview&&path==='/communiverse/__bookingfix-health')return Response.json({ok:true,version:'20261010',scope:'discover-and-artist-only'},{headers:{'Cache-Control':'no-store'}});
  if(isPreview&&path==='/communiverse/__bookingfix-qa')return fixture(request,env);
  const up=await origin(request,env);
  if(!ALLOWED.has(path)||request.method!=='GET'||!up.ok||!String(up.headers.get('content-type')||'').includes('text/html'))return up;
  const headers=new Headers(up.headers);
  ['content-length','content-encoding','etag','last-modified'].forEach(h=>headers.delete(h));
  headers.set('X-Communiverse-Booking-Fix','20261010');
  const html=new Response(up.body,{status:up.status,statusText:up.statusText,headers});
  return new HTMLRewriter().on('head',new Head()).transform(html);
 }
};
