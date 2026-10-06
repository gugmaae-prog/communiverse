// Public Plug directory inside Communiverse. Reads the public auth-central page
// and links each member to the existing Plug profile. No messages, offers,
// invites, course suggestions, ratings, or profile writes.
export const RELEASE = "20261006-plug-1";

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

export const STYLE = `
.cv-plug{min-height:100vh;background:#efefef;color:#111;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-synthesis:none}
body:has(.cv-plug){background:#efefef}
.cv-plug *{box-sizing:border-box}
.cv-plug a{color:inherit;text-decoration:none}
.cv-plug button{font:inherit}
.cv-plug button,.cv-plug a{-webkit-tap-highlight-color:transparent}
.cv-plug :focus-visible{outline:2px solid #111;outline-offset:4px}
.cv-plug .sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cv-plug .home{position:fixed;z-index:5;top:22px;left:28px;font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.cv-plug .field{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:28px;padding:64px 32px 36px}
.cv-plug .filters{display:flex;flex-direction:column;gap:8px;width:128px;flex:none}
.cv-plug .filters button{min-height:32px;padding:7px 10px;border:1px solid #e6e6e6;border-radius:8px;background:#fff;color:#161616;letter-spacing:.14em;text-transform:uppercase;font-size:10px;font-weight:650;text-align:left;cursor:pointer}
.cv-plug .filters button[aria-pressed="true"]{background:#111;border-color:#111;color:#fff}
.cv-plug .stage{position:relative;width:min(620px,calc(100vw - 220px));aspect-ratio:4/5;flex:none}
.cv-plug .node{position:absolute;display:block;border-radius:50%;aspect-ratio:1;transform:translate(-50%,-50%);transition:left .55s cubic-bezier(.22,1,.36,1),top .55s cubic-bezier(.22,1,.36,1),width .55s cubic-bezier(.22,1,.36,1),opacity .45s ease}
.cv-plug .node img,.cv-plug .node .ph{position:absolute;inset:0;width:100%;height:100%;border-radius:50%;object-fit:cover;background:#dedede}
.cv-plug .node .ph{display:flex;align-items:center;justify-content:center;font-size:22px;letter-spacing:.04em}
.cv-plug .node .cap{position:absolute;left:50%;top:calc(100% + 12px);transform:translateX(-50%);display:none;text-align:center;white-space:nowrap;pointer-events:none}
.cv-plug .node.hero{z-index:3}
.cv-plug .node.hero .cap{display:block}
.cv-plug .node .cap b{display:block;font-size:11px;font-weight:650;letter-spacing:.12em;text-transform:uppercase}
.cv-plug .node .cap small{display:block;margin-top:3px;color:#8a8a8a;font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.cv-plug .node.dim img,.cv-plug .node.dim .ph{filter:grayscale(1) brightness(1.35);opacity:.5}
.cv-plug .node.gone{opacity:0;pointer-events:none;width:6%!important}
.cv-plug .mark{position:absolute;z-index:4;left:68%;top:86%;width:14%;aspect-ratio:1;transform:translate(-50%,-50%);border:0;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer}
.cv-plug .mark svg{width:58%;height:58%;stroke:#111;fill:none;stroke-width:1.4;stroke-linecap:round}
.cv-plug .mark:disabled{opacity:.35;cursor:default}
.cv-plug .fallback{max-width:36ch;font-size:15px;line-height:1.5;text-align:center}
.cv-plug .fallback a{text-decoration:underline;text-underline-offset:3px}
.cv-plug .plain{list-style:none;padding:0;margin:24px 0 0;display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
@media(max-width:800px){
  .cv-plug .home{top:16px;left:16px}
  .cv-plug .field{flex-direction:column;gap:18px;padding:64px 12px 28px}
  .cv-plug .filters{flex-direction:row;flex-wrap:wrap;width:min(640px,100%);justify-content:center}
  .cv-plug .filters button{text-align:center}
  .cv-plug .stage{width:min(640px,calc(100vw - 16px))}
}
@media(prefers-reduced-motion:reduce){.cv-plug .node{transition:none}}
`;

export const SCRIPT = `(()=>{'use strict';window.__cvPlugRelease='${RELEASE}';const root=document.querySelector('.cv-plug');if(!root)return;const stage=root.querySelector('.stage');const nodes=[...root.querySelectorAll('.node')];const buttons=[...root.querySelectorAll('[data-filter]')];const mark=root.querySelector('.mark');if(!stage||!nodes.length)return;const SLOTS=[{x:54,y:46,s:30},{x:33,y:31,s:16},{x:74,y:24,s:13},{x:79,y:44,s:11},{x:27,y:52,s:14},{x:41,y:68,s:10},{x:67,y:66,s:11},{x:18,y:27,s:8},{x:57,y:16,s:7},{x:86,y:60,s:8},{x:34,y:80,s:7}];const allowed=new Set(['all','founders','design','market']);let filter=(new URLSearchParams(location.search).get('filter')||'all').toLowerCase();if(!allowed.has(filter))filter='all';let offset=0;function match(node){const t=(node.dataset.blob||'').toLowerCase();if(filter==='founders')return /\\bfounder\\b/.test(t);if(filter==='design')return /\\b(design|designer|architect|interior|brand)\\b/.test(t);if(filter==='market')return /\\b(market|marketing|sales|real estate)\\b/.test(t);return true}function pool(){return nodes.filter(match).slice().sort((a,b)=>(Number(b.dataset.score)||0)-(Number(a.dataset.score)||0)||(a.dataset.name||'').localeCompare(b.dataset.name||''))}function place(){const list=pool();const count=list.length;const start=count?offset%count:0;const ordered=list.slice(start).concat(list.slice(0,start));const visible=new Map(ordered.slice(0,SLOTS.length).map((node,i)=>[node,i]));for(const node of nodes){const i=visible.has(node)?visible.get(node):-1;const on=i>=0;node.classList.toggle('gone',!on);node.classList.toggle('hero',i===0);node.classList.toggle('dim',on&&i>0&&filter!=='all');node.tabIndex=on?0:-1;node.setAttribute('aria-hidden',on?'false':'true');if(!on)continue;const slot=SLOTS[i];node.style.left=slot.x+'%';node.style.top=slot.y+'%';node.style.width=slot.s+'%'}if(mark)mark.disabled=count<=SLOTS.length;for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filter===filter));stage.classList.add('ready')}for(const button of buttons){button.addEventListener('click',()=>{filter=button.dataset.filter;offset=0;const url=new URL(location.href);if(filter==='all')url.searchParams.delete('filter');else url.searchParams.set('filter',filter);history.replaceState(null,'',url);place()})}if(mark)mark.addEventListener('click',()=>{const count=pool().length;if(count>SLOTS.length){offset=(offset+(SLOTS.length-1))%count;place()}})}window.addEventListener('resize',place);place()})();`;

const MARK = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="10"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"/></svg>`;

function memberBlob(member) {
  return [member.spec, member.summary, member.location, ...member.chips].join(" ");
}

function memberScore(member) {
  const founder = /\bfounder\b/i.test(member.spec || "") ? 2 : 0;
  return (member.image ? 3 : 0) + (member.location ? 1 : 0) + (member.summary ? 1 : 0) + member.chips.length + founder;
}

const SLOTS = [
  { x: 54, y: 46, s: 30 },
  { x: 33, y: 31, s: 16 },
  { x: 74, y: 24, s: 13 },
  { x: 79, y: 44, s: 11 },
  { x: 27, y: 52, s: 14 },
  { x: 41, y: 68, s: 10 },
  { x: 67, y: 66, s: 11 },
  { x: 18, y: 27, s: 8 },
  { x: 57, y: 16, s: 7 },
  { x: 86, y: 60, s: 8 },
  { x: 34, y: 80, s: 7 },
];

function renderNode(member, index) {
  const slot = SLOTS[index];
  const portrait = member.image
    ? `<img src="${escapeHtml(member.image)}" alt="" width="480" height="480" decoding="async" referrerpolicy="no-referrer">`
    : `<span class="ph" aria-hidden="true">${escapeHtml(member.initial)}</span>`;
  const role = member.spec || member.location || "Member";
  const placed = Boolean(slot);
  const cls = placed ? (index === 0 ? "node hero" : "node") : "node gone";
  const style = placed ? ` style="left:${slot.x}%;top:${slot.y}%;width:${slot.s}%"` : "";
  return `<a class="${cls}"${style} data-slug="${escapeHtml(member.slug)}" data-name="${escapeHtml(member.name)}" data-score="${memberScore(member)}" data-blob="${escapeHtml(memberBlob(member))}" href="${escapeHtml(member.profileUrl)}">${portrait}<span class="cap"><b>${escapeHtml(member.name)}</b><small>${escapeHtml(role)}</small></span></a>`;
}

function renderFilters() {
  return ["all", "founders", "design", "market"]
    .map((id) => {
      const label = id === "all" ? "All" : id[0].toUpperCase() + id.slice(1);
      return `<button type="button" data-filter="${id}" aria-pressed="${id === "all" ? "true" : "false"}">${label}</button>`;
    })
    .join("");
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
  return `<h1 class="sr" id="plug-title">Find your people.</h1><div class="filters" role="toolbar" aria-label="Filter people">${renderFilters()}</div><div class="stage" id="constellation">${ordered.map(renderNode).join("")}<button class="mark" type="button" aria-label="Show more people">${MARK}</button></div><noscript><ul class="plain">${links}</ul></noscript>`;
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
