// Public Plug directory inside Communiverse. Reads the public auth-central page
// and links each member to the existing Plug profile. No messages, offers,
// invites, course suggestions, ratings, or profile writes.
export const RELEASE = "20261006-plug-2";

const ROOT = "/communiverse";
const CSS_PATH = `${ROOT}/_public/${RELEASE}.css`;
const JS_PATH = `${ROOT}/_public/${RELEASE}.js`;
const PAGE_PATH = `${ROOT}/plug/`;
const DIRECTORY_URL = "https://espacios-auth-central.thekeifferjapeth.workers.dev/plug";
const PROFILE_ORIGIN = "https://espacios.me";
const MAX_DIRECTORY_BYTES = 750000;
const MAX_MEMBERS = 100;
const HOSTS = new Set(["espacios.me", "www.espacios.me"]);
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/i;

const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPE[char]);
}

export function decodeEntities(value) {
  return String(value).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    const key = entity.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key)) return NAMED_ENTITIES[key];
    const code = key.startsWith("#x")
      ? Number.parseInt(key.slice(2), 16)
      : key.startsWith("#")
        ? Number.parseInt(key.slice(1), 10)
        : Number.NaN;
    if (!Number.isInteger(code) || code < 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
      return key.startsWith("#") ? "" : match;
    }
    return String.fromCodePoint(code);
  });
}

function cleanText(value, max) {
  const text = decodeEntities(String(value))
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, max);
}

function attribute(tag, name) {
  const match = String(tag).match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return match ? match[2] ?? match[3] ?? "" : "";
}

export function safeImageUrl(raw) {
  const decoded = decodeEntities(raw || "").trim();
  if (!decoded || decoded.length > 2000) return "";
  let url;
  try {
    url = new URL(decoded, DIRECTORY_URL);
  } catch {
    return "";
  }
  if (url.protocol !== "https:" || url.username || url.password) return "";
  return url.href;
}

function initialFor(name, fallback) {
  const source = `${fallback || ""} ${name || ""}`.trim();
  const char = [...source].find((item) => /\p{L}|\p{N}/u.test(item));
  return char ? char.toLocaleUpperCase() : "";
}

function field(body, className) {
  const match = body.match(
    new RegExp(`<(p|div|span|a|h\\d)\\b(?=[^>]*\\bclass\\s*=\\s*"[^"]*\\b${className}\\b)[^>]*>([\\s\\S]*?)</\\1>`, "i"),
  );
  return match ? cleanText(match[2], 180) : "";
}

function memberImage(body) {
  const tags = body.match(/<img\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const className = attribute(tag, "class");
    if (!className.split(/\s+/).includes("pc-av")) continue;
    return safeImageUrl(attribute(tag, "src"));
  }
  return "";
}

function chipsFor(body) {
  const chips = [];
  const pattern = /<span\b[^>]*class="[^"]*\bchip\b[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  let match;
  while ((match = pattern.exec(body)) && chips.length < 4) {
    const text = cleanText(match[1], 48);
    if (!text || text.includes("@") || /\d{3}[-.\s]?\d{3}/.test(text)) continue;
    chips.push(text);
  }
  return chips;
}

function memberFromArticle(attrs, body) {
  if (!/\bclass\s*=\s*"[^"]*\bpc\b/.test(attrs)) return null;
  const slug = cleanText(attribute(attrs, "data-slug"), 80);
  const nameTag = body.match(/<a\b[^>]*class="[^"]*\bpc-name\b[^"]*"[^>]*>/i);
  const hrefSlug = nameTag ? cleanText(attribute(nameTag[0], "href").replace(/^\/plug\/u\//, ""), 80) : "";
  if (!SLUG.test(slug) || slug !== hrefSlug) return null;
  const name = field(body, "pc-name");
  if (!name) return null;
  const fallback = field(body, "pc-av-fb").slice(0, 2);
  return {
    slug,
    name,
    spec: field(body, "pc-spec"),
    location: field(body, "pc-loc"),
    summary: summaryText(body),
    chips: chipsFor(body),
    image: memberImage(body),
    initial: initialFor(name, fallback),
    profileUrl: `${PROFILE_ORIGIN}/plug/u/${encodeURIComponent(slug)}`,
  };
}

function summaryText(body) {
  const more = body.match(/<div\b[^>]*class="[^"]*\bpc-more\b[^"]*"[^>]*>([\s\S]*)$/i);
  const source = more ? more[1] : "";
  const paragraph = source.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  return paragraph ? cleanText(paragraph[1], 180) : "";
}

export function parseDirectory(html) {
  const members = [];
  const seen = new Set();
  const pattern = /<article\b([^>]*)>([\s\S]*?)<\/article>/gi;
  let match;
  while ((match = pattern.exec(String(html))) && members.length < MAX_MEMBERS) {
    const member = memberFromArticle(match[1], match[2]);
    if (!member || seen.has(member.slug)) continue;
    seen.add(member.slug);
    members.push(member);
  }
  return members;
}

async function readBoundedText(response) {
  const reader = response.body?.getReader?.();
  if (!reader) {
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_DIRECTORY_BYTES) {
      throw new Error("directory too large");
    }
    return text;
  }
  const decoder = new TextDecoder();
  let total = 0;
  let html = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DIRECTORY_BYTES) {
      await reader.cancel();
      throw new Error("directory too large");
    }
    html += decoder.decode(value, { stream: true });
  }
  html += decoder.decode();
  return html;
}

export async function loadPlugDirectory(fetchImpl = fetch) {
  const response = await fetchImpl(DIRECTORY_URL, {
    method: "GET",
    redirect: "follow",
    headers: {
      Accept: "text/html",
      "User-Agent": `Communiverse/${RELEASE}`,
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`directory status ${response.status}`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) throw new Error("directory content-type");
  if (response.url) {
    const finalUrl = new URL(response.url);
    if (finalUrl.origin !== new URL(DIRECTORY_URL).origin) throw new Error("directory origin");
  }
  const html = await readBoundedText(response);
  return { ok: true, members: parseDirectory(html) };
}

export const STIFFNESS = 170;
export const DAMPING = 22;

export function stepSpring(pos, vel, target, dt) {
  const acc = -STIFFNESS * (pos - target) - DAMPING * vel;
  const nextVel = vel + acc * dt;
  return [pos + nextVel * dt, nextVel];
}

export function stepEase(current, target, dt, tau) {
  const blend = 1 - Math.exp(-dt / tau);
  return current + (target - current) * blend;
}

export function memberFacets(member) {
  const text = [member.spec, member.summary, ...(member.chips || [])].join(" ").toLowerCase();
  const place = (member.location || "").toLowerCase();
  const facets = ["all"];
  if (/\bfounder\b/.test(text)) facets.push("founders");
  if (/\b(design|designer|architect|interior|brand)\b/.test(text)) facets.push("design");
  if (/\bdubai\b/.test(place)) facets.push("dubai");
  return facets;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "founders", label: "Founders" },
  { id: "design", label: "Design" },
  { id: "dubai", label: "Dubai" },
];

const WIDE = [
  { x: 52, y: 48, s: 28 },
  { x: 31, y: 33, s: 15 },
  { x: 72, y: 27, s: 12 },
  { x: 76, y: 46, s: 10 },
  { x: 26, y: 55, s: 13 },
  { x: 39, y: 71, s: 9 },
  { x: 65, y: 68, s: 11 },
  { x: 18, y: 29, s: 8 },
  { x: 55, y: 18, s: 7 },
  { x: 78, y: 61, s: 8 },
  { x: 34, y: 82, s: 7 },
  { x: 74, y: 80, s: 9 },
  { x: 46, y: 32, s: 8 },
  { x: 60, y: 56, s: 7 },
];

const TIGHT = [
  { x: 50, y: 46, s: 32 },
  { x: 33, y: 34, s: 14 },
  { x: 67, y: 33, s: 12 },
  { x: 30, y: 58, s: 11 },
  { x: 69, y: 57, s: 13 },
  { x: 50, y: 70, s: 9 },
  { x: 42, y: 22, s: 8 },
  { x: 61, y: 21, s: 8 },
];

export const STYLE = `
.cv-plug{min-height:100vh;background-color:#f2f2f2;background-image:radial-gradient(rgba(17,17,17,.22) .7px, transparent .8px);background-size:18px 18px;color:#111;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-synthesis:none}
body:has(.cv-plug){background-color:#f2f2f2;background-image:radial-gradient(rgba(17,17,17,.22) .7px, transparent .8px);background-size:18px 18px}
.cv-plug *{box-sizing:border-box}
.cv-plug a{color:inherit;text-decoration:none}
.cv-plug button{font:inherit}
.cv-plug button,.cv-plug a{-webkit-tap-highlight-color:transparent}
.cv-plug :focus-visible{outline:2px solid #111;outline-offset:3px}
.cv-plug .sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cv-plug .home{position:fixed;z-index:5;top:22px;left:28px;font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.cv-plug .field{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:36px;padding:72px 32px 40px}
.cv-plug .filters{display:flex;flex-direction:column;gap:8px;width:132px;flex:none}
.cv-plug .filters button{min-height:28px;padding:6px 12px;border:0;border-radius:999px;background:rgba(255,255,255,.62);color:#161616;letter-spacing:.14em;text-transform:uppercase;font-size:10px;font-weight:600;text-align:left;cursor:pointer}
.cv-plug .filters button[aria-pressed="true"]{background:#111;color:#fff}
.cv-plug .stage{position:relative;width:min(640px,calc(100vw - 220px));aspect-ratio:4/5;flex:none}
.cv-plug .node{position:absolute;left:0;top:0;display:block;border-radius:50%;transform-origin:center center;will-change:transform,opacity}
.cv-plug .node img,.cv-plug .node .ph{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover;background:#e4e4e4}
.cv-plug .node .ph{display:flex;align-items:center;justify-content:center;font-size:18px;letter-spacing:.04em}
.cv-plug .node .cap{position:absolute;left:50%;top:calc(100% + 10px);transform:translateX(-50%);display:none;text-align:center;white-space:nowrap;pointer-events:none}
.cv-plug .node.hero{z-index:3}
.cv-plug .node.hero .cap{display:block}
.cv-plug .node .cap b{display:block;font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
.cv-plug .node .cap small{display:block;margin-top:3px;color:#8a8a8a;font-size:9px;letter-spacing:.16em;text-transform:uppercase}
.cv-plug .fallback{max-width:36ch;font-size:14px;line-height:1.5;text-align:center;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif}
.cv-plug .fallback a{text-decoration:underline;text-underline-offset:3px}
.cv-plug .plain{list-style:none;padding:0;margin:24px 0 0;display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
@media(max-width:800px){
  .cv-plug .home{top:16px;left:16px}
  .cv-plug .field{flex-direction:column;align-items:center;gap:18px;padding:64px 12px 28px}
  .cv-plug .filters{flex-direction:row;flex-wrap:wrap;width:min(640px,100%);justify-content:center}
  .cv-plug .filters button{text-align:center}
  .cv-plug .stage{width:min(640px,calc(100vw - 36px))}
}
@media(prefers-reduced-motion:reduce){.cv-plug .node{will-change:auto}}
`;

export const SCRIPT = `(()=>{'use strict';window.__cvPlugRelease='${RELEASE}';const STIFF=${STIFFNESS};const DAMP=${DAMPING};const WIDE=${JSON.stringify(WIDE)};const TIGHT=${JSON.stringify(TIGHT)};const FILTERS=${JSON.stringify(FILTERS.map((filter) => filter.id))};const root=document.querySelector('.cv-plug');if(!root)return;const stage=root.querySelector('.stage');const buttons=[...root.querySelectorAll('[data-filter]')];const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!stage)return;const nodes=[...root.querySelectorAll('.node')].map(el=>({el,x:0,y:0,vx:0,vy:0,opacity:1,scale:1,width:40,tx:0,ty:0,topacity:1,tscale:1,twidth:40}));if(!nodes.length)return;let filter=(new URLSearchParams(location.search).get('filter')||'all').toLowerCase();if(!FILTERS.includes(filter))filter='all';let frame=0;function matches(node){const facets=(node.el.dataset.facets||'').split(' ');return filter==='all'||facets.includes(filter)}function layout(){const box=stage.getBoundingClientRect();const slots=filter==='all'?WIDE:TIGHT;const list=nodes.filter(matches).slice().sort((a,b)=>(Number(b.el.dataset.score)||0)-(Number(a.el.dataset.score)||0)||(a.el.dataset.name||'').localeCompare(b.el.dataset.name||''));const visible=new Map(list.slice(0,slots.length).map((node,i)=>[node,i]));for(const node of nodes){const i=visible.has(node)?visible.get(node):-1;const on=i>=0;const slot=on?slots[i]:{x:50,y:48,s:8};node.tx=box.width*slot.x/100;node.ty=box.height*slot.y/100;node.twidth=box.width*slot.s/100;node.topacity=on?1:0;node.tscale=on?1:0.35;node.el.classList.toggle('hero',i===0);node.el.tabIndex=on?0:-1;node.el.setAttribute('aria-hidden',on?'false':'true')}}function apply(node){node.el.style.width=node.width+'px';node.el.style.height=node.width+'px';node.el.style.left=node.x+'px';node.el.style.top=node.y+'px';node.el.style.opacity=String(node.opacity);node.el.style.transform='translate(-50%, -50%) scale('+node.scale+')'}function snap(){for(const node of nodes){node.x=node.tx;node.y=node.ty;node.vx=0;node.vy=0;node.opacity=node.topacity;node.scale=node.tscale;node.width=node.twidth;apply(node)}}function tick(now){const dt=Math.min(0.032,frame? (now-frame)/1000 : 0.016);frame=now;let moving=false;for(const node of nodes){const [x,vx]=spring(node.x,node.vx,node.tx,dt);const [y,vy]=spring(node.y,node.vy,node.ty,dt);node.x=x;node.y=y;node.vx=vx;node.vy=vy;node.opacity=ease(node.opacity,node.topacity,dt,0.16);node.scale=ease(node.scale,node.tscale,dt,0.18);node.width=ease(node.width,node.twidth,dt,0.2);apply(node);if(Math.abs(node.x-node.tx)>0.4||Math.abs(node.y-node.ty)>0.4||Math.abs(node.vx)>0.4||Math.abs(node.vy)>0.4||Math.abs(node.opacity-node.topacity)>0.01||Math.abs(node.scale-node.tscale)>0.01||Math.abs(node.width-node.twidth)>0.4)moving=true}if(moving)requestAnimationFrame(tick)}function spring(pos,vel,target,dt){const acc=-STIFF*(pos-target)-DAMP*vel;const next=vel+acc*dt;return [pos+next*dt,next]}function ease(current,target,dt,tau){const blend=1-Math.exp(-dt/tau);return current+(target-current)*blend}function go(snapNow){layout();for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filter===filter));if(snapNow||reduced)snap();else requestAnimationFrame(tick)}for(const button of buttons){button.addEventListener('click',()=>{filter=button.dataset.filter;const url=new URL(location.href);if(filter==='all')url.searchParams.delete('filter');else url.searchParams.set('filter',filter);history.replaceState(null,'',url);go(false)})}window.addEventListener('resize',()=>go(reduced));go(true)})();`;

function memberScore(member) {
  const founder = memberFacets(member).includes("founders") ? 2 : 0;
  return (member.image ? 3 : 0) + (member.location ? 1 : 0) + (member.summary ? 1 : 0) + (member.chips?.length || 0) + founder;
}

function renderNode(member, index) {
  const slot = index < WIDE.length ? WIDE[index] : null;
  const portrait = member.image
    ? `<img src="${escapeHtml(member.image)}" alt="" width="480" height="480" decoding="async" referrerpolicy="no-referrer">`
    : `<span class="ph" aria-hidden="true">${escapeHtml(member.initial)}</span>`;
  const role = member.spec || member.location || "Member";
  const hidden = !slot;
  const cls = index === 0 ? "node hero" : "node";
  const style = slot
    ? ` style="left:${slot.x}%;top:${slot.y}%;width:${slot.s}%;height:auto;aspect-ratio:1;opacity:1;transform:translate(-50%, -50%)"`
    : ` style="left:50%;top:48%;width:8%;aspect-ratio:1;opacity:0;transform:translate(-50%, -50%) scale(.35)"`;
  return `<a class="${cls}"${style} data-slug="${escapeHtml(member.slug)}" data-name="${escapeHtml(member.name)}" data-score="${memberScore(member)}" data-facets="${escapeHtml(memberFacets(member).join(" "))}" href="${escapeHtml(member.profileUrl)}"${hidden ? ` tabindex="-1" aria-hidden="true"` : ""}>${portrait}<span class="cap"><b>${escapeHtml(member.name)}</b><small>${escapeHtml(role)}</small></span></a>`;
}

function renderFilters(active = "all") {
  return FILTERS.map(
    (filter) =>
      `<button type="button" data-filter="${filter.id}" aria-pressed="${filter.id === active ? "true" : "false"}">${filter.label}</button>`,
  ).join("");
}

function renderDirectory(directory) {
  if (!directory.ok) {
    return `<h1 class="sr" id="plug-title">Find your people.</h1><p class="fallback">This page could not read the public member directory just now. <a href="https://espacios.me/plug">Open the Plug directory</a></p>`;
  }
  if (!directory.members.length) {
    return `<h1 class="sr" id="plug-title">Find your people.</h1><p class="fallback">The public directory came back without member cards. <a href="https://espacios.me/plug">Open the Plug directory</a></p>`;
  }
  const links = directory.members
    .map((member) => `<li><a href="${escapeHtml(member.profileUrl)}">${escapeHtml(member.name)}</a></li>`)
    .join("");
  const ordered = directory.members.slice().sort((a, b) => memberScore(b) - memberScore(a) || a.name.localeCompare(b.name));
  return `<h1 class="sr" id="plug-title">Find your people.</h1><div class="filters" role="toolbar" aria-label="Filter people">${renderFilters()}</div><div class="stage" id="constellation">${ordered.map(renderNode).join("")}</div><noscript><ul class="plain">${links}</ul></noscript>`;
}

export function renderPlugShell(directory) {
  return `<a class="skip sr" href="#constellation">Skip to people</a><a class="home" href="/communiverse/">Communiverse</a><main class="field" id="main">${renderDirectory(directory)}</main>`;
}

function renderDocument(directory, assets) {
  const assetLinks =
    assets === "inline"
      ? `<style>${STYLE}</style>`
      : `<link rel="stylesheet" href="${CSS_PATH}"><script defer src="${JS_PATH}"></script>`;
  const inlineScript = assets === "inline" ? `<script>${SCRIPT}</script>` : "";
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Plug | Communiverse</title><meta name="description" content="Find your people. Plug is the Communiverse member network: public profiles, with messages, offers, teams, courses, and ratings on Plug."><link rel="canonical" href="https://espacios.me${PAGE_PATH}"><meta property="og:title" content="Plug | Communiverse"><meta property="og:description" content="Find your people. The Communiverse member network."><meta property="og:url" content="https://espacios.me${PAGE_PATH}"><meta property="og:type" content="website"><meta property="og:site_name" content="Communiverse"><meta name="twitter:card" content="summary"><meta name="cv-public-release" content="${RELEASE}"><link rel="icon" href="/communiverse/icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Instrument+Sans:wght@400;500;600&display=swap">${assetLinks}</head>
<body><div class="cv-plug">${renderPlugShell(directory)}</div>${inlineScript}</body></html>`;
}

export function renderPlugDocument(directory) {
  return renderDocument(directory, "external");
}

export function renderPlugInlineDocument(directory) {
  return renderDocument(directory, "inline");
}

function responseHeaders(contentType, cacheControl) {
  return new Headers({
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
    "X-Communiverse-Release": RELEASE,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' https: data:",
  });
}

export function matchPlug(url) {
  if (!HOSTS.has(url.hostname)) return null;
  const path = url.pathname;
  if (path === `${ROOT}/plug` || path === PAGE_PATH) return "page";
  if (path === CSS_PATH) return "css";
  if (path === JS_PATH) return "js";
  if (path === `${ROOT}/people` || path === `${ROOT}/people/`) return "people";
  return null;
}

export async function handlePlug(request, deps = {}) {
  const url = new URL(request.url);
  const kind = matchPlug(url);
  if (!kind) return null;
  const headers = responseHeaders(
    kind === "css" ? "text/css; charset=utf-8" : kind === "js" ? "application/javascript; charset=utf-8" : "text/html; charset=utf-8",
    kind === "page" ? "no-store" : "public, max-age=31536000, immutable",
  );
  if (!["GET", "HEAD"].includes(request.method)) {
    headers.set("Allow", "GET, HEAD");
    headers.set("Cache-Control", "no-store");
    return new Response("Method not allowed", { status: 405, headers });
  }
  if (kind === "people") {
    return Response.redirect(new URL(PAGE_PATH, url.origin), 302);
  }
  if (kind === "css" || kind === "js") {
    return new Response(request.method === "HEAD" ? null : kind === "css" ? STYLE : SCRIPT, { status: 200, headers });
  }
  let directory = { ok: false, members: [] };
  try {
    directory = await loadPlugDirectory(deps.fetchImpl || fetch);
  } catch {
    directory = { ok: false, members: [] };
  }
  return new Response(request.method === "HEAD" ? null : renderPlugDocument(directory), { status: 200, headers });
}
