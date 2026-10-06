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

function hashAngle(id) {
  let hash = 0;
  for (const char of String(id)) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return ((hash % 10000) / 10000) * Math.PI * 2;
}

function separatedAngles(ids) {
  const rows = ids.map((id) => ({ id, angle: hashAngle(id) })).sort((a, b) => a.angle - b.angle || a.id.localeCompare(b.id));
  if (rows.length < 2) return rows;
  const minDelta = (Math.PI * 2) / rows.length;
  const angles = rows.map((row) => row.angle);
  for (let iter = 0; iter < 6; iter += 1) {
    for (let i = 0; i < angles.length; i += 1) {
      const j = (i + 1) % angles.length;
      let delta = angles[j] - angles[i];
      if (j === 0) delta = angles[0] + Math.PI * 2 - angles[i];
      if (delta >= minDelta) continue;
      const push = (minDelta - delta) / 2;
      angles[i] -= push;
      if (j === 0) angles[0] += push;
      else angles[j] += push;
    }
  }
  return rows.map((row, index) => ({ ...row, angle: angles[index] }));
}

export function layoutCircles(ids, mode) {
  const people = [...ids];
  if (!people.length) return [];
  const wideSize = (index) => (index === 0 ? 22 : [14, 11, 12, 10, 13, 9, 12][(index - 1) % 7]);
  const diameters = people.map((_, index) => {
    const open = wideSize(index);
    if (mode !== "tight" || index === 0) return index === 0 && mode === "tight" ? Math.max(open * 1.35, 26) : open;
    return index % 2 === 0 ? open * 1.5 : open * 0.65;
  });
  const gapFor = (a, b) => (mode === "tight" ? Math.min(a, b) * 0.9 : Math.max(a, b) * 0.16);
  const overshoot = 1.22;
  const focal = { id: people[0], x: 50, y: 48, d: diameters[0] };
  if (people.length === 1) return [focal];
  const around = separatedAngles(people.slice(1));
  const otherD = around.map((row) => diameters[people.indexOf(row.id)]);
  let radius = diameters[0] / 2 + Math.max(...otherD) / 2 + gapFor(diameters[0], Math.max(...otherD));
  for (let iter = 0; iter < 10; iter += 1) {
    let grow = radius;
    for (let i = 0; i < around.length; i += 1) {
      const needFocal = (diameters[0] / 2 + otherD[i] / 2) * overshoot + gapFor(diameters[0], otherD[i]);
      grow = Math.max(grow, needFocal);
      for (let j = i + 1; j < around.length; j += 1) {
        const dx = Math.cos(around[i].angle) - Math.cos(around[j].angle);
        const dy = Math.sin(around[i].angle) - Math.sin(around[j].angle);
        const chord = Math.hypot(dx, dy) || 0.001;
        const need = ((otherD[i] / 2 + otherD[j] / 2) * overshoot + gapFor(otherD[i], otherD[j])) / chord;
        grow = Math.max(grow, need);
      }
    }
    if (grow <= radius * 1.001) break;
    radius = grow;
  }
  const reach = radius + Math.max(...otherD) / 2;
  const fit = reach > 34 ? 34 / reach : 1;
  const placed = new Map([[focal.id, { ...focal, d: focal.d * fit }]]);
  around.forEach((row, index) => {
    placed.set(row.id, {
      id: row.id,
      x: 50 + Math.cos(row.angle) * radius * fit,
      y: 48 + Math.sin(row.angle) * radius * fit,
      d: otherD[index] * fit,
    });
  });
  return people.map((id) => placed.get(id));
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
${hashAngle.toString()}
${separatedAngles.toString()}
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
let filter=(new URLSearchParams(location.search).get('filter')||'all').toLowerCase();
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
const nodes=[...stage.querySelectorAll('.node')].map(function(el){return {el:el,x:0,y:0,vx:0,vy:0,d:40,vd:0,scale:1,vs:0,opacity:+el.style.opacity||1,tx:0,ty:0,td:40,tscale:1,topacity:1,home:null,tight:null};});
function box(){return stage.getBoundingClientRect();}
function point(slot,width,height){return {x:width*slot.x/100,y:height*slot.y/100,d:width*slot.d/100};}
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
    var target=filter==='all'?node.home:(slot?point(slot,size.width,size.height):node.home);
    node.tx=target.x;node.ty=target.y;node.td=on?target.d:node.home.d;node.tscale=on?1:0.55;node.topacity=on?1:0;
    node.el.classList.toggle('is-on',on);
    node.el.tabIndex=on?0:-1;
    node.el.setAttribute('aria-hidden',on?'false':'true');
  });
  if(roster){[...roster.querySelectorAll('[data-categories]')].forEach(function(row){var cats=(row.dataset.categories||'').split(' ');row.hidden=filter!=='all'&&!cats.includes(filter);});}
  if(empty)empty.hidden=matching.length!==0||filter==='all';
  var lead=matching[0];
  if(focal){focal.hidden=!lead;if(lead)focal.innerHTML='<b>'+lead.el.dataset.label+'</b><small>'+lead.el.dataset.role+'</small>';}
  buttons.forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.filter===filter));});
}
function show(node){if(filter==='all')return true;return (node.el.dataset.categories||'').split(' ').includes(filter);}
function apply(node){node.el.style.width=node.d+'px';node.el.style.height=node.d+'px';node.el.style.left=node.x+'px';node.el.style.top=node.y+'px';node.el.style.opacity=String(Math.max(0,node.opacity));node.el.style.transform='translate(-50%, -50%) scale('+node.scale+')';node.el.style.pointerEvents=node.opacity<0.25?'none':'auto';}
var frame=0,running=false;
function tick(now){
  var dt=Math.min(0.032,frame?(now-frame)/1000:0.016);frame=now;var moving=false;
  for(var i=0;i<nodes.length;i++){
    var node=nodes[i];
    var sx=stepSpring(node.x,node.vx,node.tx,dt);node.x=sx[0];node.vx=sx[1];
    var sy=stepSpring(node.y,node.vy,node.ty,dt);node.y=sy[0];node.vy=sy[1];
    var sd=stepSpring(node.d,node.vd,node.td,dt);node.d=sd[0];node.vd=sd[1];
    var ss=stepSpring(node.scale,node.vs,node.tscale,dt);node.scale=ss[0];node.vs=ss[1];
    node.opacity=stepEase(node.opacity,node.topacity,dt,0.22);
    apply(node);
    if(Math.abs(node.x-node.tx)>0.6||Math.abs(node.y-node.ty)>0.6||Math.abs(node.d-node.td)>0.6||Math.abs(node.scale-node.tscale)>0.02||Math.abs(node.opacity-node.topacity)>0.02||Math.abs(node.vx)>8||Math.abs(node.vy)>8)moving=true;
  }
  if(moving)requestAnimationFrame(tick);else running=false;
}
function go(snap){
  assign();
  if(snap||reduced){
    nodes.forEach(function(node){node.x=node.tx;node.y=node.ty;node.vx=node.vy=node.vd=node.vs=0;node.d=node.td;node.scale=node.tscale;node.opacity=node.topacity;apply(node);});
    return;
  }
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
.cv-plug .stage{position:relative;width:min(720px,100%);aspect-ratio:1;flex:none}
.cv-plug .node{position:absolute;left:0;top:0;display:block;border-radius:50%;text-decoration:none;color:inherit;transform-origin:center center}
.cv-plug .node img,.cv-plug .node .ph,.cv-plug .mini{width:100%;height:100%;border-radius:50%;object-fit:cover;background:#dedede;display:block}
.cv-plug .node .ph,.cv-plug .mini.ph{display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:650}
.cv-plug .focal{min-height:48px;margin:18px 0 0;text-align:center}
.cv-plug .focal b{display:block;font-size:13px;letter-spacing:.12em;text-transform:uppercase}
.cv-plug .focal small{display:block;margin-top:3px;color:#6d756f;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
.cv-plug .cluster-empty{max-width:36ch;text-align:center;color:#3d4742;font-size:16px;line-height:1.5}
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
