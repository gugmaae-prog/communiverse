// Presentation rules for the Communiverse Plug directory.
// Categories are data-driven. Nothing here assigns a person to a programme.

export const PLUG_CATEGORIES = [
  { id: "communiverse", label: "Communiverse" },
  { id: "ambassador", label: "Ambassadors" },
  { id: "artist", label: "Artists" },
  { id: "all", label: "All" },
];

const CATEGORY_IDS = new Set(["communiverse", "ambassador", "artist"]);
const SMALL_WORDS = new Set(["of", "the", "and", "or", "a"]);
const HIDDEN_SLUGS = new Set([
  "hello",
  "member-11a676",
  "psr-homes-9e4436",
  "oak-residency-09aff6",
  "dilfaz-group-30f2eb",
  "tnt-finances-27f363",
  "espacios-me-0aa3ba",
  "gugma-ae-4e8b34",
]);
const HIDDEN_NAMES = new Set([
  "espacios me",
  "gugma ae",
  "member",
  "psr homes",
  "oak residency",
  "dilfaz group",
  "tnt finances",
]);

export function stepSpring(pos, vel, target, dt) {
  const stiffness = 58;
  const damping = 8.4;
  const acc = -stiffness * (pos - target) - damping * vel;
  const nextVel = vel + acc * dt;
  return [pos + nextVel * dt, nextVel];
}

export function stepEase(current, target, dt, tau) {
  const blend = 1 - Math.exp(-dt / tau);
  return current + (target - current) * blend;
}

export function tidyName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => {
          const letters = part.replace(/[^A-Za-z]/g, "");
          if (!letters) return part;
          if (letters.length <= 3 && letters === letters.toUpperCase() && !SMALL_WORDS.has(letters.toLowerCase())) {
            return part;
          }
          if (letters === letters.toLowerCase() || letters === letters.toUpperCase()) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
          }
          return part;
        })
        .join("-"),
    )
    .join(" ");
}

function nameKey(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function readPlugCategories(member) {
  const found = [];
  const seen = new Set();
  const values = [
    member?.plugCategory,
    ...(Array.isArray(member?.plugCategories) ? member.plugCategories : String(member?.plugCategories || "").split(/[\s,]+/)),
    ...(member?.chips || []),
  ];
  for (const value of values) {
    const token = String(value || "").trim().toLowerCase();
    if (!CATEGORY_IDS.has(token) || seen.has(token)) continue;
    seen.add(token);
    found.push(token);
  }
  return found;
}

function profileScore(member) {
  let score = 0;
  if (member.image && member.image.startsWith("https://")) score += 8;
  if (member.image && !member.image.includes("/plug/asset/")) score += 4;
  if (/\bfounder\b/i.test(member.spec || "")) score += 3;
  score += (member.chips || []).length;
  score += (member.summary || "").length > 0 ? 1 : 0;
  if (member.slug === "hello") score -= 5;
  return score;
}

function pickKeiffer(profiles) {
  const ranked = profiles.slice().sort((a, b) => profileScore(b) - profileScore(a));
  const best = ranked[0];
  const categories = [...new Set(ranked.flatMap((profile) => readPlugCategories(profile)))];
  return { ...best, name: "Keiffer Japeth", plugCategories: categories };
}

export function presentMembers(members) {
  const keiffers = [];
  const people = [];
  for (const member of members || []) {
    const key = nameKey(member.name);
    if (HIDDEN_SLUGS.has(member.slug) || HIDDEN_NAMES.has(key)) continue;
    if (key === "keiffer japeth" || key === "keiffer japeth cantara") {
      keiffers.push(member);
      continue;
    }
    people.push({ ...member, name: tidyName(member.name), plugCategories: readPlugCategories(member) });
  }
  if (keiffers.length) {
    const merged = pickKeiffer(keiffers);
    people.unshift({ ...merged, plugCategories: readPlugCategories(merged) });
  }
  return people.sort((a, b) => a.name.localeCompare(b.name));
}

export function separateCircles(spots, gapRatio = 0.18) {
  const placed = spots.map((spot) => ({ ...spot }));
  for (let iter = 0; iter < 120; iter += 1) {
    let moved = false;
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        let dx = placed[j].x - placed[i].x;
        let dy = placed[j].y - placed[i].y;
        let dist = Math.hypot(dx, dy);
        const gap = gapRatio * Math.max(placed[i].d, placed[j].d);
        const min = placed[i].d / 2 + placed[j].d / 2 + gap;
        if (dist >= min) continue;
        if (dist < 0.001) {
          const angle = ((i + 1) * 2.399) + j;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          dist = 1;
        }
        const push = (min - dist) / 2;
        const ux = dx / dist;
        const uy = dy / dist;
        placed[i].x -= ux * push;
        placed[i].y -= uy * push;
        placed[j].x += ux * push;
        placed[j].y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const spot of placed) {
    minX = Math.min(minX, spot.x - spot.d / 2);
    minY = Math.min(minY, spot.y - spot.d / 2);
    maxX = Math.max(maxX, spot.x + spot.d / 2);
    maxY = Math.max(maxY, spot.y + spot.d / 2);
  }
  const span = Math.max(maxX - minX, maxY - minY, 1);
  const scale = 92 / span;
  const originX = (minX + maxX) / 2;
  const originY = (minY + maxY) / 2;
  return placed.map((spot) => ({
    ...spot,
    x: 50 + (spot.x - originX) * scale,
    y: 50 + (spot.y - originY) * scale,
    d: spot.d * scale,
  }));
}

export function layoutCircles(ids, mode) {
  const people = [...ids];
  const count = people.length;
  if (!count) return [];
  const tight = mode === "tight";
  const gapRatio = tight ? 0.5 : 0.24;
  const base = tight ? 12 : 16;
  const wobble = [1, 0.84, 0.94, 0.76, 0.9, 0.72];
  const diameters = people.map((_, index) => {
    if (index === 0) return base * (tight ? 1.35 : 1.2);
    if (tight) return index % 2 === 0 ? base * 1.05 : base * 0.72;
    return base * wobble[(index - 1) % wobble.length];
  });
  const positions = [{ id: people[0], x: 0, y: 0, d: diameters[0] }];
  let cursor = 1;
  let ring = 0;
  let innerRadius = diameters[0] / 2;
  while (cursor < count) {
    const remaining = count - cursor;
    const ideal = 5 + ring * 4;
    let ringCount = Math.min(remaining, ideal);
    if (remaining > ringCount && remaining - ringCount < 3) ringCount = remaining;
    const sizes = diameters.slice(cursor, cursor + ringCount);
    const maxD = Math.max(...sizes);
    const gap = gapRatio * maxD;
    const step = (Math.PI * 2) / ringCount;
    const chord = ringCount < 2 ? 0 : 2 * Math.sin(step / 2);
    const neighbor = chord > 0 ? (maxD + gap) / chord : 0;
    const radius = Math.max(innerRadius + gap + maxD / 2, neighbor);
    for (let index = 0; index < ringCount; index += 1) {
      const angle = -Math.PI / 2 + step * index + ring * 0.31;
      positions.push({
        id: people[cursor + index],
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        d: sizes[index],
      });
    }
    innerRadius = radius + maxD / 2;
    cursor += ringCount;
    ring += 1;
  }
  return separateCircles(positions, gapRatio);
}

export function circlesOverlap(layout, pad = 0) {
  for (let i = 0; i < layout.length; i += 1) {
    for (let j = i + 1; j < layout.length; j += 1) {
      const dist = Math.hypot(layout[i].x - layout[j].x, layout[i].y - layout[j].y);
      const need = layout[i].d / 2 + layout[j].d / 2 + pad;
      if (dist + 0.01 < need) return true;
    }
  }
  return false;
}

const BROKEN_REPLACE = 'replace(//$/,"")';
const FIXED_REPLACE = 'replace(/\\/$/,"")';

export function patchProfileHtml(html) {
  const bar = `<div class="cv-backbar"><a href="/communiverse/plug/">Back to Communiverse</a></div><style>.cv-backbar{position:sticky;top:0;z-index:80;display:flex;align-items:center;min-height:52px;padding:0 18px;background:#f4f4f1;color:#151c19;font:600 15px/1.2 "Helvetica Neue",Helvetica,Arial,sans-serif}.cv-backbar a{display:inline-flex;align-items:center;min-height:44px;color:inherit;text-decoration:none}</style>`;
  let next = String(html).split(BROKEN_REPLACE).join(FIXED_REPLACE);
  if (next.includes("<body>")) next = next.replace("<body>", `<body>${bar}`);
  else next = `${bar}${next}`;
  return next;
}

export function buildDirectoryScript() {
  return `(()=>{'use strict';
${stepSpring.toString()}
${stepEase.toString()}
${separateCircles.toString()}
${layoutCircles.toString()}
const root=document.querySelector('.cv-plug');
if(!root)return;
var menuButton=root.querySelector('.menu-button');
var menu=root.querySelector('.mobile-nav');
if(menuButton&&menu){menuButton.hidden=false;menuButton.addEventListener('click',function(){var open=menu.hidden;menu.hidden=!open;menuButton.setAttribute('aria-expanded',menu.hidden?'false':'true');});}
const stage=root.querySelector('.stage');
const buttons=[...root.querySelectorAll('[data-filter]')];
const roster=root.querySelector('.roster');
const empty=root.querySelector('.cluster-empty');
const focal=root.querySelector('.focal');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const allowed=['communiverse','ambassador','artist','all'];
let filter=(new URLSearchParams(location.search).get('filter')||'communiverse').toLowerCase();
if(!allowed.includes(filter))filter='all';
function useFallback(img){
  if(!img||img.dataset.fallback)return;
  img.dataset.fallback='1';
  var ph=document.createElement('span');
  ph.className=img.classList.contains('mini')?'mini ph':'ph';
  ph.textContent=img.getAttribute('data-initial')||'';
  img.replaceWith(ph);
}
root.querySelectorAll('img').forEach(function(img){
  img.addEventListener('error',function(){useFallback(img);});
  if(img.complete&&img.naturalWidth===0)useFallback(img);
});
if(!stage)return;
const plot=stage.querySelector('.plot')||stage;
const nodes=[...plot.querySelectorAll('.node')].map(function(el){return {el:el,x:0,y:0,vx:0,vy:0,d:40,vd:0,scale:1,vs:0,opacity:+el.style.opacity||1,tx:0,ty:0,td:40,tscale:1,topacity:1,home:null,tight:null};});
function box(){var rect=plot.getBoundingClientRect();var side=Math.min(rect.width,rect.height)||rect.width;return {width:side,height:side};}
function point(slot,width,height){var side=Math.min(width,height);return {x:side*slot.x/100,y:side*slot.y/100,d:side*slot.d/100};}
function byScore(a,b){return (+b.el.dataset.score)-(+a.el.dataset.score)||(a.el.dataset.name||'').localeCompare(b.el.dataset.name||'');}
function assign(){
  var ordered=nodes.slice().sort(byScore);
  var wide=layoutCircles(ordered.map(function(node){return node.el.dataset.slug;}),'wide');
  var wideBy=new Map(ordered.map(function(node,i){return [node,wide[i]];}));
  var matching=nodes.filter(show).slice().sort(byScore);
  var tight=layoutCircles(matching.map(function(node){return node.el.dataset.slug;}),'tight');
  var tightBy=new Map(matching.map(function(node,i){return [node,tight[i]];}));
  var size=box();
  nodes.forEach(function(node){
    node.home=point(wideBy.get(node),size.width,size.height);
    var on=show(node);
    var slot=on?tightBy.get(node):null;
    var spread=filter==='all'||filter==='communiverse';
    var target=spread?node.home:(slot?point(slot,size.width,size.height):node.home);
    node.tx=target.x;node.ty=target.y;node.td=on?target.d:node.home.d;node.tscale=on?1:0.55;node.topacity=on?1:0;
    node.el.classList.toggle('is-on',on);
    node.el.tabIndex=on?0:-1;
    node.el.setAttribute('aria-hidden',on?'false':'true');
  });
  if(roster){[...roster.querySelectorAll('[data-categories]')].forEach(function(row){var cats=(row.dataset.categories||'').split(' ');row.hidden=filter!=='all'&&filter!=='communiverse'&&!cats.includes(filter);});}
  if(empty)empty.hidden=matching.length!==0||filter==='all'||filter==='communiverse';
  var lead=matching[0];
  if(focal){focal.hidden=!lead;if(lead)focal.innerHTML='<b>'+lead.el.dataset.label+'</b><small>'+lead.el.dataset.role+'</small>';}
  buttons.forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.filter===filter));});
}
function show(node){if(filter==='all'||filter==='communiverse')return true;return (node.el.dataset.categories||'').split(' ').includes(filter);}
function apply(node){node.el.style.width=node.d+'px';node.el.style.height=node.d+'px';node.el.style.left=node.x+'px';node.el.style.top=node.y+'px';node.el.style.opacity=String(Math.max(0,node.opacity));node.el.style.transform='translate(-50%, -50%) scale('+node.scale+')';node.el.style.pointerEvents=node.opacity<0.25?'none':'auto';}
function keepApart(){
  for(var iter=0;iter<10;iter++){
    var hit=false;
    for(var i=0;i<nodes.length;i++){
      for(var j=i+1;j<nodes.length;j++){
        var a=nodes[i],b=nodes[j];
        if(a.opacity<0.04&&b.opacity<0.04)continue;
        var dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy);
        var ra=a.d*Math.max(a.scale,0)/2,rb=b.d*Math.max(b.scale,0)/2,min=ra+rb+2;
        if(dist>=min)continue;
        hit=true;
        if(dist<0.001){var angle=i*2.399+j;dx=Math.cos(angle);dy=Math.sin(angle);dist=1;}
        var push=(min-dist)/2,ux=dx/dist,uy=dy/dist;
        a.x-=ux*push;a.y-=uy*push;b.x+=ux*push;b.y+=uy*push;
        var va=a.vx*ux+a.vy*uy,vb=b.vx*ux+b.vy*uy;
        if(va>0){a.vx-=va*ux;a.vy-=va*uy;}
        if(vb<0){b.vx-=vb*ux;b.vy-=vb*uy;}
      }
    }
    if(!hit)break;
  }
}
function resting(){
  for(var i=0;i<nodes.length;i++){
    var node=nodes[i];
    if(Math.abs(node.x-node.tx)>0.4||Math.abs(node.y-node.ty)>0.4||Math.abs(node.d-node.td)>0.4||Math.abs(node.scale-node.tscale)>0.01||Math.abs(node.opacity-node.topacity)>0.02||Math.abs(node.vx)>0.35||Math.abs(node.vy)>0.35||Math.abs(node.vd)>0.35||Math.abs(node.vs)>0.02)return false;
  }
  return true;
}
function snap(){nodes.forEach(function(node){node.x=node.tx;node.y=node.ty;node.vx=node.vy=node.vd=node.vs=0;node.d=node.td;node.scale=node.tscale;node.opacity=node.topacity;apply(node);});}
var frame=0,running=false;
function tick(now){
  var dt=Math.min(0.032,frame?(now-frame)/1000:0.016);frame=now;
  for(var i=0;i<nodes.length;i++){
    var node=nodes[i];
    var sx=stepSpring(node.x,node.vx,node.tx,dt);node.x=sx[0];node.vx=sx[1];
    var sy=stepSpring(node.y,node.vy,node.ty,dt);node.y=sy[0];node.vy=sy[1];
    var sd=stepSpring(node.d,node.vd,node.td,dt);node.d=sd[0];node.vd=sd[1];
    var ss=stepSpring(node.scale,node.vs,node.tscale,dt);node.scale=ss[0];node.vs=ss[1];
    node.opacity=stepEase(node.opacity,node.topacity,dt,0.22);
  }
  keepApart();
  for(var n=0;n<nodes.length;n++)apply(nodes[n]);
  if(!resting())requestAnimationFrame(tick);
  else{snap();running=false;}
}
function go(immediate){
  assign();
  if(immediate||reduced){snap();return;}
  if(!running){running=true;frame=0;requestAnimationFrame(tick);}
}
buttons.forEach(function(button){button.addEventListener('click',function(){filter=button.dataset.filter;var url=new URL(location.href);if(filter==='all')url.searchParams.delete('filter');else url.searchParams.set('filter',filter);history.replaceState(null,'',url);go(false);});});
window.addEventListener('resize',function(){go(reduced);});
go(true);
})();`;
}

export const STYLE = `
.cv-plug{min-height:100vh;background-color:#f3f3f1;background-image:radial-gradient(rgba(17,17,17,.2) .75px, transparent .85px);background-size:18px 18px;color:#151c19;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}
body:has(.cv-plug){margin:0;background-color:#f3f3f1;background-image:radial-gradient(rgba(17,17,17,.2) .75px, transparent .85px);background-size:18px 18px}
.cv-plug *{box-sizing:border-box}
.cv-plug a{color:inherit}
.cv-plug button{font:inherit}
.cv-plug button,.cv-plug a{-webkit-tap-highlight-color:transparent}
.cv-plug :focus-visible{outline:2px solid #111;outline-offset:3px}
.cv-plug .sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cv-plug .header-wrap{position:sticky;top:0;z-index:40;padding:12px 16px;background:#f3f3f1}
.cv-plug .header{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:16px;max-width:1184px;min-height:64px;margin:auto;padding:8px 14px 8px 22px;border-radius:999px;background:#151c19;color:#f4f4f1}
.cv-plug .brand{font:500 22px Georgia,"Times New Roman",serif;letter-spacing:-.03em;text-decoration:none;color:#f4f4f1}
.cv-plug .desktop-nav{display:flex;gap:2px;padding:2px;border:1px solid rgba(255,255,255,.18);border-radius:999px}
.cv-plug .desktop-nav a,.cv-plug .mobile-nav a{display:flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;border-radius:999px;text-decoration:none;font-size:14px;color:#f4f4f1}
.cv-plug .desktop-nav a[aria-current=page],.cv-plug .desktop-nav a:hover,.cv-plug .mobile-nav a:hover{background:rgba(255,255,255,.08)}
.cv-plug .contact{justify-self:end;display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border:1px solid rgba(255,255,255,.25);border-radius:999px;text-decoration:none;color:#f4f4f1}
.cv-plug .menu-button{display:none;justify-self:center;width:44px;height:44px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:transparent;color:#f4f4f1}
.cv-plug .mobile-nav{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:1184px;margin:12px auto 0;padding:12px;background:#151c19;border-radius:18px}
.cv-plug .mobile-nav a{border:1px solid rgba(255,255,255,.18)}
.cv-plug [hidden]{display:none!important}
.cv-plug .intro{width:min(1100px,calc(100% - 48px));margin:28px auto 0}
.cv-plug h1{margin:0;font:500 56px/1.05 Georgia,"Times New Roman",serif;letter-spacing:-.03em}
.cv-plug .lede{max-width:46ch;margin:12px 0 0;font-size:17px;line-height:1.5;color:#3d4742}
.cv-plug .field{width:min(1100px,calc(100% - 32px));margin:12px auto 0;display:flex;align-items:center;justify-content:center;gap:48px}
.cv-plug .filters{display:flex;flex-direction:column;gap:10px;width:168px;flex:none}
.cv-plug .filters button{min-height:44px;padding:0 16px;border:0;border-radius:999px;background:rgba(255,255,255,.72);color:#161616;letter-spacing:.06em;text-transform:uppercase;font-size:14px;font-weight:650;text-align:left;cursor:pointer}
.cv-plug .filters button[aria-pressed="true"]{background:#111;color:#fff}
.cv-plug .cluster{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center}
.cv-plug .stage{position:relative;width:min(880px,100%);flex:none}
.cv-plug .plot{position:relative;width:100%;height:0;padding-bottom:100%}
.cv-plug .node{position:absolute;left:0;top:0;display:block;overflow:hidden;border-radius:50%;text-decoration:none;color:inherit;transform-origin:center center;background:#e4e4e1}
.cv-plug .node img,.cv-plug .node .ph,.cv-plug .mini{width:100%;height:100%;border-radius:50%;object-fit:cover;background:#dedede;display:block}
.cv-plug .node .ph,.cv-plug .mini.ph{display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:650}
.cv-plug .focal{min-height:48px;margin:18px 0 0;text-align:center}
.cv-plug .focal b{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase}
.cv-plug .focal small{display:block;margin-top:3px;color:#6d756f;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.cv-plug .cluster-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;max-width:none;margin:0;padding:24px;text-align:center;color:#3d4742;font-size:16px;line-height:1.5}
.cv-plug .roster{width:min(1100px,calc(100% - 48px));margin:28px auto 72px}
.cv-plug .roster h2{margin:0 0 16px;font:500 28px/1.2 Georgia,"Times New Roman",serif}
.cv-plug .roster-grid{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.cv-plug .roster-grid a{display:flex;gap:12px;align-items:center;min-height:72px;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.7);text-decoration:none;color:inherit}
.cv-plug .mini,.cv-plug .mini.ph{width:48px;height:48px;flex:none}
.cv-plug .roster-grid b{display:block;font-size:16px}
.cv-plug .roster-grid small{color:#5c6560}
.cv-plug .fallback{width:min(640px,calc(100% - 48px));margin:48px auto;font-size:17px;line-height:1.5}
@media(max-width:800px){
  .cv-plug h1{font-size:40px}
  .cv-plug .header{grid-template-columns:minmax(0,1fr) 44px minmax(0,1fr);padding:0 8px;min-height:56px}
  .cv-plug .desktop-nav{display:none}
  .cv-plug .menu-button{display:flex;align-items:center;justify-content:center}
  .cv-plug .brand{font-size:18px}
  .cv-plug .field{flex-direction:column;align-items:stretch;gap:18px}
  .cv-plug .filters{flex-direction:row;flex-wrap:wrap;width:100%}
  .cv-plug .filters button{text-align:center}
}
`;
