// Public Plug directory inside Communiverse. Reads the public auth-central page
// and links each member to the existing Plug profile. No messages, offers,
// invites, course suggestions, ratings, or profile writes.
import {
  PLUG_CATEGORIES,
  STYLE,
  buildDirectoryScript,
  layoutCircles,
  patchProfileHtml,
  presentMembers,
  readPlugCategories,
} from "./plug-present.js";

export { STYLE };

export const RELEASE = "20261006-plug-6";
export const SCRIPT = `window.__cvPlugRelease=${JSON.stringify(RELEASE)};${buildDirectoryScript()}`;

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
    plugCategory: attribute(attrs, "data-plug-category"),
    plugCategories: attribute(attrs, "data-plug-categories"),
    profileUrl: `${ROOT}/plug/u/${encodeURIComponent(slug)}`,
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

function richness(member) {
  return (member.image ? 5 : 0) + (member.summary ? 2 : 0) + (member.plugCategories || []).length + (member.spec && member.spec !== "Member" ? 1 : 0);
}

function clusterPeople(members) {
  return members.slice().sort((a, b) => richness(b) - richness(a) || a.name.localeCompare(b.name));
}

function renderPortrait(member, className) {
  if (!member.image) return `<span class="${className} ph" aria-hidden="true">${escapeHtml(member.initial)}</span>`;
  return `<img class="${className}" src="${escapeHtml(member.image)}" alt="" data-initial="${escapeHtml(member.initial)}" width="480" height="480" decoding="async" referrerpolicy="no-referrer">`;
}

function categoryLabel(member) {
  const ids = member.plugCategories || [];
  const match = PLUG_CATEGORIES.find((item) => item.id !== "all" && ids.includes(item.id));
  return match ? match.label : "";
}

function focusScore(member) {
  return (member.plugCategories || []).length + (member.image ? 3 : 0) + (member.summary ? 1 : 0);
}

function renderPersonCard(member) {
  if (!member) return "";
  const group = categoryLabel(member);
  const eye = `<p class="glass-eyebrow"${group ? "" : " hidden"}>${escapeHtml(group)}</p>`;
  return `<aside class="glass-panel" id="cv-person-work" role="region" aria-labelledby="cv-person-name"><div class="glass-panel-body"><article class="glass-card">${eye}<h2 id="cv-person-name">${escapeHtml(member.name)}</h2><p class="glass-role">${escapeHtml(member.spec || "Member")}</p></article></div></aside>`;
}

function renderNode(member, slot) {
  const categories = (member.plugCategories || []).join(" ");
  const style = ` style="left:${slot.x}%;top:${slot.y}%;width:${slot.d}%;aspect-ratio:1;opacity:1;transform:translate(-50%, -50%)"`;
  return `<a class="node"${style} data-slug="${escapeHtml(member.slug)}" data-name="${escapeHtml(member.name)}" data-label="${escapeHtml(member.name)}" data-role="${escapeHtml(member.spec || "Member")}" data-group="${escapeHtml(categoryLabel(member))}" data-score="${focusScore(member)}" data-categories="${escapeHtml(categories)}" href="${escapeHtml(member.profileUrl)}">${renderPortrait(member, "")}<span class="ph" hidden>${escapeHtml(member.initial)}</span></a>`;
}

function renderFilters() {
  return PLUG_CATEGORIES.map(
    (filter) =>
      `<button type="button" data-filter="${filter.id}" aria-pressed="${filter.id === "communiverse" ? "true" : "false"}">${filter.label}</button>`,
  ).join("");
}

function renderRoster(members) {
  const items = members
    .map((member) => {
      const categories = (member.plugCategories || []).join(" ");
      const portrait = member.image
        ? `<img class="mini" src="${escapeHtml(member.image)}" alt="" data-initial="${escapeHtml(member.initial)}" width="48" height="48" decoding="async" referrerpolicy="no-referrer">`
        : `<span class="mini ph" aria-hidden="true">${escapeHtml(member.initial)}</span>`;
      return `<li data-categories="${escapeHtml(categories)}"><a href="${escapeHtml(member.profileUrl)}">${portrait}<span><b>${escapeHtml(member.name)}</b><small>${escapeHtml(member.spec || "Member")}</small></span></a></li>`;
    })
    .join("");
  return `<section class="roster" aria-labelledby="everyone"><h2 id="everyone">Everyone</h2><ul class="roster-grid">${items}</ul></section>`;
}

function renderDirectory(directory) {
  if (!directory.ok) {
    return `<p class="fallback">This page could not read the public member directory just now. <a href="https://espacios.me/plug">Open the Plug directory</a></p>`;
  }
  const people = presentMembers(directory.members);
  if (!people.length) {
    return `<p class="fallback">The public directory came back without member cards. <a href="https://espacios.me/plug">Open the Plug directory</a></p>`;
  }
  const cluster = clusterPeople(people);
  const layout = layoutCircles(cluster.map((member) => member.slug), "wide");
  const nodes = cluster.map((member, index) => renderNode(member, layout[index])).join("");
  const lead = cluster.slice().sort((a, b) => focusScore(b) - focusScore(a) || a.name.localeCompare(b.name))[0];
  return `<div class="field"><div class="filters" role="toolbar" aria-label="Filter people">${renderFilters()}</div><div class="cluster"><div class="stage" id="constellation"><div class="plot">${nodes}</div>${renderPersonCard(lead)}<p class="cluster-empty" hidden>No public profiles are tagged for this yet. Add the category on their Plug profile to show them here.</p></div><p class="focal" hidden></p></div></div>${renderRoster(people)}`;
}

export function renderPlugShell(directory) {
  return `<a class="skip sr" href="#constellation">Skip to people</a><div class="header-wrap"><header class="header"><a class="brand" href="/communiverse/">Communiverse</a><nav class="desktop-nav" aria-label="Primary"><a href="/communiverse/how-it-works/">How it works</a><a href="/communiverse/makers/">Makers</a><a href="/communiverse/ambassadors/">Ambassadors</a><a href="${PAGE_PATH}" aria-current="page">Plug</a></nav><button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="plug-mobile-nav" hidden><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 7h12M4 13h12" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button><a class="contact" href="/communiverse/contact/#contact">Contact</a></header><nav id="plug-mobile-nav" class="mobile-nav" hidden><a href="/communiverse/how-it-works/">How it works</a><a href="/communiverse/makers/">Makers</a><a href="/communiverse/ambassadors/">Ambassadors</a><a href="${PAGE_PATH}" aria-current="page">Plug</a><a href="/communiverse/contact/#contact">Contact</a></nav></div><main id="main"><div class="intro"><h1 id="plug-title">Find your people.</h1><p class="lede">The member network for Communiverse. Open a portrait to message, offer work, invite, suggest a course, or rate — those actions stay on the Plug profile.</p></div>${renderDirectory(directory)}</main>`;
}

function renderDocument(directory, assets) {
  const shell = renderPlugShell(directory);
  const rootClass = shell.includes('id="cv-person-name"') ? "cv-plug is-focused" : "cv-plug";
  const assetLinks =
    assets === "inline"
      ? `<style>${STYLE}</style>`
      : `<link rel="stylesheet" href="${CSS_PATH}"><script defer src="${JS_PATH}"></script>`;
  const inlineScript = assets === "inline" ? `<script>${SCRIPT}</script>` : "";
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Plug | Communiverse</title><meta name="description" content="Find your people. Plug is the Communiverse member network: public profiles, with messages, offers, teams, courses, and ratings on Plug."><link rel="canonical" href="https://espacios.me${PAGE_PATH}"><meta property="og:title" content="Plug | Communiverse"><meta property="og:description" content="Find your people. The Communiverse member network."><meta property="og:url" content="https://espacios.me${PAGE_PATH}"><meta property="og:type" content="website"><meta property="og:site_name" content="Communiverse"><meta name="twitter:card" content="summary"><meta name="cv-public-release" content="${RELEASE}"><link rel="icon" href="/communiverse/icon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Instrument+Sans:wght@400;500;600&display=swap">${assetLinks}</head>
<body><div class="${rootClass}">${shell}</div>${inlineScript}</body></html>`;
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
  const profile = path.match(new RegExp(`^${ROOT}/plug/u/([^/]+)/?$`));
  if (profile && SLUG.test(profile[1])) return { kind: "profile", slug: profile[1] };
  return null;
}

export async function handlePlug(request, deps = {}) {
  const url = new URL(request.url);
  const matched = matchPlug(url);
  if (!matched) return null;
  const kind = typeof matched === "string" ? matched : matched.kind;
  const slug = typeof matched === "string" ? "" : matched.slug;
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
  if (kind === "profile") {
    headers.set("Cache-Control", "no-store");
    const fetchImpl = deps.fetchImpl || fetch;
    try {
      const response = await fetchImpl(`${new URL(DIRECTORY_URL).origin}/plug/u/${slug}`, {
        method: "GET",
        redirect: "follow",
        headers: { Accept: "text/html", "User-Agent": `Communiverse/${RELEASE}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(String(response.status));
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) throw new Error("profile content-type");
      return new Response(request.method === "HEAD" ? null : patchProfileHtml(await readBoundedText(response)), {
        status: 200,
        headers,
      });
    } catch {
      const fallback = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Profile | Communiverse</title></head><body><p>This profile could not be opened just now.</p></body></html>`;
      return new Response(request.method === "HEAD" ? null : patchProfileHtml(fallback), { status: 200, headers });
    }
  }
  let directory = { ok: false, members: [] };
  try {
    directory = await loadPlugDirectory(deps.fetchImpl || fetch);
  } catch {
    directory = { ok: false, members: [] };
  }
  return new Response(request.method === "HEAD" ? null : renderPlugDocument(directory), { status: 200, headers });
}
