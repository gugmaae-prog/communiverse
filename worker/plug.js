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
:root{--paper:#f4f4f1;--ink:#151c19;--muted:#b9c2bb;--line:rgba(255,255,255,.18);--header-space:88px;color-scheme:dark}
.cv-plug{min-height:100vh;background:#000;color:var(--paper);font-family:'Instrument Sans',Arial,sans-serif;font-synthesis:none}
.cv-plug *{box-sizing:border-box}
.cv-plug a{color:inherit}
.cv-plug button,.cv-plug input{font:inherit}
.cv-plug button,.cv-plug a,.cv-plug summary{-webkit-tap-highlight-color:transparent}
.cv-plug h1,.cv-plug h2,.cv-plug h3,.cv-plug p,.cv-plug figure,.cv-plug ol{margin:0}
.cv-plug h1,.cv-plug h2,.cv-plug h3{font-family:'Fraunces',Georgia,serif;font-weight:500;letter-spacing:-.025em;text-wrap:balance}
.cv-plug p{line-height:1.65}
.cv-plug img{display:block;max-width:100%}
.cv-plug section[id],.cv-plug main[id]{scroll-margin-top:calc(var(--header-space) + 24px)}
.cv-plug :focus-visible{outline:2px solid #bfcebf;outline-offset:5px}
.cv-plug .skip{position:fixed;top:8px;left:16px;z-index:100;transform:translateY(-180%);padding:12px 18px;border-radius:9999px;background:var(--paper);color:var(--ink);text-decoration:none}
.cv-plug .skip:focus{transform:none}
.cv-plug .vh{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.cv-plug .wrap{width:min(1184px,calc(100% - 64px));margin-inline:auto}
.cv-plug .header-wrap{position:sticky;top:0;z-index:50;padding:12px 16px;background:#000}
.cv-plug .header{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:20px;max-width:1184px;min-height:64px;margin:auto;padding:8px 14px 8px 22px;border-radius:9999px;background:rgba(15,22,18,.94)}
.cv-plug .brand{display:flex;align-items:center;width:max-content;min-height:44px;font:500 23px 'Fraunces',Georgia,serif;letter-spacing:-.035em;text-decoration:none;white-space:nowrap}
.cv-plug .desktop-nav{display:flex;padding:2px;border:1px solid var(--line);border-radius:9999px}
.cv-plug .desktop-nav a,.cv-plug .mobile-nav a{display:flex;align-items:center;justify-content:center;min-height:44px;padding:0 15px;border-radius:9999px;text-decoration:none;font-size:13px;white-space:nowrap}
.cv-plug .desktop-nav a:hover,.cv-plug .desktop-nav a[aria-current=page],.cv-plug .mobile-nav a:hover{background:#ffffff0d}
.cv-plug .contact{justify-self:end;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:10px 16px;border:1px solid rgba(255,255,255,.25);border-radius:9999px;text-decoration:none;font-size:13px;white-space:nowrap}
.cv-plug .contact svg,.cv-plug .menu-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round}
.cv-plug .menu-button{display:none;justify-self:center;align-items:center;justify-content:center;width:44px;height:44px;border:1px solid var(--line);border-radius:9999px;background:transparent;color:inherit;cursor:pointer}
.cv-plug .mobile-nav{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:1184px;margin:12px auto 0;padding:12px;background:#0f1612;border:1px solid var(--line);border-radius:18px}
.cv-plug .mobile-nav a{border:1px solid var(--line)}
.cv-plug [hidden]{display:none!important}
.cv-plug .hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);align-items:center;gap:72px;padding-block:clamp(56px,8vw,112px)}
.cv-plug .eyebrow{font-size:13px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);margin-bottom:24px}
.cv-plug h1{font-size:clamp(44px,5.4vw,76px);line-height:1.05;max-width:12ch}
.cv-plug .intro{max-width:46ch;margin-top:28px;color:#ced3cd;font-size:18px}
.cv-plug .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.cv-plug .button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;max-width:100%;padding:12px 22px;border:1px solid currentColor;border-radius:9999px;font:14px/1.5 'Instrument Sans',Arial,sans-serif;text-decoration:none;text-align:center;transition:background .18s,color .18s}
.cv-plug .button:hover{background:var(--paper);color:var(--ink)}
.cv-plug .button.quiet{color:#ced3cd}
.cv-plug .aside{border:1px solid var(--line);border-radius:28px;padding:28px 28px 24px;background:#0f1612}
.cv-plug .aside .eyebrow{margin-bottom:16px}
.cv-plug .aside ol{list-style:none;padding:0;display:grid;gap:10px}
.cv-plug .aside li{min-height:44px;display:flex;align-items:center;border-top:1px solid var(--line);font-family:'Fraunces',Georgia,serif;font-size:28px;letter-spacing:-.03em}
.cv-plug .aside p:last-child{margin-top:18px;color:var(--muted);font-size:14px}
.cv-plug .explain{background:var(--paper);color:var(--ink);padding-block:clamp(64px,8vw,96px)}
.cv-plug .explain .eyebrow{color:#526058}
.cv-plug .explain h2{font-size:clamp(32px,3.4vw,48px);line-height:1.12;max-width:16ch}
.cv-plug .explain-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:48px 72px;align-items:start}
.cv-plug .explain p{max-width:52ch;margin-top:22px;font-size:17px;color:#465249}
.cv-plug .explain .button{margin-top:28px;color:var(--ink)}
.cv-plug .explain .button:hover{background:var(--ink);color:var(--paper)}
.cv-plug .directory{padding-block:clamp(56px,7vw,96px)}
.cv-plug .directory-head{display:flex;justify-content:space-between;gap:24px 40px;align-items:end;flex-wrap:wrap}
.cv-plug .directory h2{font-size:clamp(32px,3.4vw,48px);line-height:1.12}
.cv-plug .directory-note{max-width:42ch;color:#ced3cd;font-size:15px}
.cv-plug .search{margin-top:28px;display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center}
.cv-plug .search input{width:min(100%,420px);min-height:48px;border:1px solid var(--line);border-radius:9999px;background:#0f1612;color:var(--paper);padding:0 18px}
.cv-plug .search input::placeholder{color:#8b968e}
.cv-plug .status{color:var(--muted);font-size:14px}
.cv-plug .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:28px}
.cv-plug .member{min-width:0;background:#0f1612;border:1px solid var(--line);border-radius:22px}
.cv-plug .member a{display:flex;flex-direction:column;gap:14px;min-height:100%;padding:18px;text-decoration:none}
.cv-plug .member a:hover{background:#ffffff0d;border-radius:22px}
.cv-plug .person{display:flex;gap:14px;align-items:center;min-width:0}
.cv-plug .avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;flex:none;background:#d5ddd4}
.cv-plug .avatar-fallback{display:flex;align-items:center;justify-content:center;color:var(--ink);font-family:'Fraunces',Georgia,serif;font-size:22px}
.cv-plug .person div{min-width:0}
.cv-plug .member h3{font-size:24px;line-height:1.15}
.cv-plug .spec{margin-top:4px;color:#ced3cd;font-size:14px}
.cv-plug .loc{margin-top:2px;color:var(--muted);font-size:13px}
.cv-plug .summary{color:#ced3cd;font-size:14px}
.cv-plug .chips{display:flex;flex-wrap:wrap;gap:6px}
.cv-plug .chip{border:1px solid var(--line);border-radius:9999px;padding:4px 10px;font-size:12px;color:#ced3cd}
.cv-plug .view{margin-top:auto;font-size:13px;letter-spacing:.04em;text-transform:uppercase}
.cv-plug .empty,.cv-plug .fallback{margin-top:28px;max-width:52ch;color:#ced3cd}
.cv-plug .fallback .button{margin-top:22px}
.cv-plug .footer{border-top:1px solid var(--line);padding-block:30px 42px;display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
.cv-plug .footer a{display:inline-flex;align-items:center;min-height:44px;text-underline-offset:4px}
.cv-plug .footer nav{display:flex;gap:24px}
@media(min-width:1024px) and (max-width:1439px){body>.cv-plug,body>.cv-plug main,body>.cv-plug>footer{width:auto;max-width:none;margin-inline:0;transform:none}}
@media(max-width:980px){.cv-plug .grid{grid-template-columns:repeat(2,minmax(0,1fr))}.cv-plug .hero,.cv-plug .explain-grid{grid-template-columns:1fr;gap:36px}}
@media(max-width:820px){:root{--header-space:68px}.cv-plug .wrap{width:calc(100% - 40px)}.cv-plug .header-wrap{padding:10px 16px}.cv-plug .header{padding:0;min-height:48px;gap:10px;grid-template-columns:minmax(0,1fr) 44px minmax(0,1fr)}.cv-plug .brand{font-size:16px}.cv-plug .desktop-nav{display:none}.cv-plug .menu-button{display:flex}.cv-plug .contact{font-size:12px;padding:0 14px}.cv-plug .hero{padding-block:48px 64px}.cv-plug .eyebrow{margin-bottom:20px;font-size:12px}.cv-plug h1{font-size:clamp(40px,11vw,58px)}.cv-plug .intro{font-size:17px;margin-top:24px}.cv-plug .actions{margin-top:26px}.cv-plug .aside li{font-size:24px}.cv-plug .mobile-nav a{font-size:14px}}
@media(max-width:640px){.cv-plug .grid{grid-template-columns:1fr}.cv-plug .footer{gap:16px}.cv-plug .footer nav{gap:20px}}
@media(prefers-reduced-motion:reduce){.cv-plug *,.cv-plug *::before,.cv-plug *::after{animation:none!important;transition:none!important}}
`;

export const SCRIPT = `(()=>{'use strict';window.__cvPlugRelease='${RELEASE}';const root=document.querySelector('.cv-plug');if(!root)return;const wrap=root.querySelector('.header-wrap'),button=root.querySelector('.menu-button'),menu=root.querySelector('.mobile-nav');function measure(){if(wrap)document.documentElement.style.setProperty('--header-space',Math.ceil(wrap.getBoundingClientRect().height)+'px')}function close(focus){if(!menu||!button)return;menu.hidden=true;button.setAttribute('aria-expanded','false');measure();if(focus)button.focus({preventScroll:true})}if(button&&menu){button.hidden=false;button.addEventListener('click',()=>{menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));measure()});menu.addEventListener('click',e=>{if(e.target.closest('a'))close(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)close(true)});let frame=0;window.addEventListener('resize',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{if(innerWidth>820)close(false);measure()})});measure()}root.querySelectorAll('img.avatar').forEach(img=>{img.addEventListener('error',()=>{const fallback=document.createElement('span');fallback.className='avatar avatar-fallback';fallback.textContent=img.getAttribute('data-initial')||'';img.replaceWith(fallback)})});const search=root.querySelector('#member-search');const cards=[...root.querySelectorAll('.member')];const status=root.querySelector('#member-status');const empty=root.querySelector('#member-empty');const total=cards.length;function apply(){const q=(search&&search.value||'').trim().toLowerCase();let shown=0;for(const card of cards){const ok=!q||card.textContent.toLowerCase().includes(q);card.hidden=!ok;if(ok)shown++}if(status)status.textContent=q?shown+' of '+total+' public profiles':total+(total===1?' public profile':' public profiles');if(empty)empty.hidden=shown!==0}if(search){search.addEventListener('input',apply);if(search.form)search.form.addEventListener('submit',e=>{e.preventDefault();apply()})}})();`;

function renderMember(member) {
  const image = member.image
    ? `<img class="avatar" src="${escapeHtml(member.image)}" alt="" width="56" height="56" decoding="async" data-initial="${escapeHtml(member.initial)}" referrerpolicy="no-referrer">`
    : `<span class="avatar avatar-fallback">${escapeHtml(member.initial)}</span>`;
  const spec = member.spec ? `<p class="spec">${escapeHtml(member.spec)}</p>` : "";
  const location = member.location ? `<p class="loc">${escapeHtml(member.location)}</p>` : "";
  const summary = member.summary && member.summary !== member.spec ? `<p class="summary">${escapeHtml(member.summary)}</p>` : "";
  const chips = member.chips.length
    ? `<div class="chips">${member.chips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join("")}</div>`
    : "";
  return `<article class="member" data-slug="${escapeHtml(member.slug)}"><a href="${escapeHtml(member.profileUrl)}"><div class="person">${image}<div><h3>${escapeHtml(member.name)}</h3>${spec}${location}</div></div>${summary}${chips}<span class="view">View profile</span></a></article>`;
}

function renderDirectory(directory) {
  if (!directory.ok) {
    return `<section class="directory wrap" id="directory" aria-labelledby="directory-title"><div class="directory-head"><div><p class="eyebrow">Public profiles</p><h2 id="directory-title">The directory is on Plug.</h2></div></div><div class="fallback"><p>This page could not read the public member directory just now. Open Plug for the current profiles.</p><a class="button" href="https://espacios.me/plug">Open the Plug directory</a></div></section>`;
  }
  if (!directory.members.length) {
    return `<section class="directory wrap" id="directory" aria-labelledby="directory-title"><div class="directory-head"><div><p class="eyebrow">Public profiles</p><h2 id="directory-title">No public profiles in this read.</h2></div></div><div class="fallback"><p>The public directory came back without member cards. Open Plug to check the current list.</p><a class="button" href="https://espacios.me/plug">Open the Plug directory</a></div></section>`;
  }
  const count = directory.members.length;
  const label = `${count} public profile${count === 1 ? "" : "s"}`;
  return `<section class="directory wrap" id="directory" aria-labelledby="directory-title"><div class="directory-head"><div><p class="eyebrow">Public profiles</p><h2 id="directory-title">Who is here.</h2></div><p class="directory-note">Showing the public directory. Open a profile on Plug for the full page.</p></div><form class="search" role="search" action="${PAGE_PATH}"><label class="vh" for="member-search">Search public profiles</label><input id="member-search" type="search" name="q" placeholder="Search by name, skill or place" autocomplete="off"><p id="member-status" class="status" role="status">${label}</p></form><div class="grid" data-member-count="${count}">${directory.members.map(renderMember).join("")}</div><p id="member-empty" class="empty" hidden>No public profiles match that search.</p></section>`;
}

export function renderPlugShell(directory) {
  return `<a class="skip" href="#main">Skip to content</a><div class="header-wrap"><header class="header"><a class="brand" href="/communiverse/" aria-label="Communiverse home">Communiverse</a><nav class="desktop-nav" aria-label="Primary navigation"><a href="/communiverse/how-it-works/">How it works</a><a href="/communiverse/makers/">Makers</a><a href="/communiverse/ambassadors/">Ambassadors</a><a href="${PAGE_PATH}" aria-current="page">Plug</a></nav><button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="plug-mobile-nav" hidden><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 7h12M4 13h12"/></svg></button><a class="contact" href="/communiverse/contact/#contact">Contact<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg></a></header><nav id="plug-mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden><a href="/communiverse/how-it-works/">How it works</a><a href="/communiverse/makers/">Makers</a><a href="/communiverse/ambassadors/">Ambassadors</a><a href="${PAGE_PATH}" aria-current="page">Plug</a><a href="#directory">Profiles</a></nav><noscript><nav class="mobile-nav" aria-label="Explore Communiverse"><a href="/communiverse/">Home</a><a href="/communiverse/makers/">Makers</a><a href="${PAGE_PATH}">Plug</a><a href="https://espacios.me/plug">Open Plug</a></nav></noscript></div>
<main id="main"><section class="hero wrap" aria-labelledby="plug-title"><div><p class="eyebrow">Plug · the member network</p><h1 id="plug-title">Find your people.</h1><p class="intro">Meet the public profiles in Communiverse. A name, a practice, and a place — then the conversation continues on their Plug profile.</p><div class="actions"><a class="button" href="#directory">See public profiles</a><a class="button quiet" href="https://espacios.me/plug">Open Plug</a></div></div><aside class="aside" aria-label="What a Plug profile can do"><p class="eyebrow">On a profile</p><ol><li>Message</li><li>Offer</li><li>Team</li><li>Course</li><li>Rate</li></ol><p>Those actions stay on Plug. Espacios does not process payments.</p></aside></section>
<section class="explain" aria-labelledby="network-title"><div class="explain-grid wrap"><div><p class="eyebrow">Communiverse</p><h2 id="network-title">The member network.</h2><p>Plug introduces people who are part of Espacios. This page reads the public directory and links each person to the profile they already have.</p></div><div><p class="eyebrow">Keep going there</p><h2>The working parts stay on Plug.</h2><p>Messaging, offers, team invites, course suggestions, and ratings open on the member’s own profile. Add a profile from your Espacios account when you want to be listed.</p><p><a class="button" href="https://espacios.me/account#plugSec">Add your profile</a></p></div></div></section>
${renderDirectory(directory)}</main>
<footer class="footer wrap"><p>Learn. Make. Collect. Belong.</p><nav aria-label="Footer navigation"><a href="/communiverse/">Communiverse</a><a href="https://espacios.me/plug">Plug directory</a><a href="/communiverse/contact/#contact">Contact</a></nav><p>© 2026 Communiverse</p></footer>`;
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
