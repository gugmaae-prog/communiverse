// Only these verified-unavailable comparison originals and film poster are gated.
// Artwork, artist portraits, attribution and provenance remain in the catalogue.
export const ORIGINAL_PHOTO_UNAVAILABLE = 'Original photo temporarily unavailable.';
export const UNAVAILABLE_ORIGINAL_PATHS = Object.freeze([
  '/communiverse/_public/media/images/20261008/559f892f249a1fae900bf2f3-1280.webp',
  '/communiverse/_public/media/images/20261008/c1580fb140ef6bae64233c52-1280.webp',
  '/communiverse/_public/media/images/20261008/aa11f089c3471595691ade45-1280.webp',
  '/communiverse/_public/media/images/20261008/e870d28d32997c288caad97e-1280.webp',
  '/communiverse/_public/media/images/20261008/7c75bf2aa08492fc79647882-1280.webp',
  '/communiverse/_public/media/images/20261008/e2616eed815ba5e29be05d6e-1280.webp',
  '/communiverse/_public/media/images/20261008/70992005a5414a1680d77d79-1280.webp',
  '/communiverse/_public/media/images/20261008/ccf36d0c5d29ac9f3876c2f6-1280.webp',
  '/communiverse/_public/media/images/20261008/6d645f75ace4c08aa6870690-1280.webp',
]);
export const UNAVAILABLE_POSTER_PATH = '/communiverse/_public/media/images/20261008/449dfe78768e0e2301a790ec-720.webp';
const ORIGINALS = new Set(UNAVAILABLE_ORIGINAL_PATHS);
const ORIGINAL_HASHES = new Set(UNAVAILABLE_ORIGINAL_PATHS.map(path => path.match(/([a-f0-9]{24})-1280/)[1]));
const POSTER_PATHS = new Set([UNAVAILABLE_POSTER_PATH, UNAVAILABLE_POSTER_PATH.replace('-720.', '-320.'), UNAVAILABLE_POSTER_PATH.replace('-720.', '-1280.'), '/communiverse/_public/media/ambassadors/20261008/luna.jpg']);
const HOSTS = new Set(['communiverseclubs.com', 'www.communiverseclubs.com', 'preview.communiverseclubs.com', 'espacios.me', 'www.espacios.me']);
const MAX_JSON_BYTES = 2 * 1024 * 1024;

export function unavailableMediaPath(value, base = 'https://communiverseclubs.com/') {
  if (typeof value !== 'string') return null;
  let url;
  try { url = new URL(value, base); } catch { return null; }
  if (!HOSTS.has(url.hostname)) return null;
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch { return null; }
  if (!path.startsWith('/communiverse/')) {
    if (['espacios.me', 'www.espacios.me'].includes(url.hostname)) return null;
    path = '/communiverse' + path;
  }
  const variant = path.match(/^\/communiverse\/_public\/media\/images\/20261008\/([a-f0-9]{24})-(?:320|720|1280)\.webp$/);
  if (variant && ORIGINAL_HASHES.has(variant[1])) return UNAVAILABLE_ORIGINAL_PATHS.find(value => value.includes(variant[1]));
  return POSTER_PATHS.has(path) ? UNAVAILABLE_POSTER_PATH : null;
}

export function cleanUnavailableMedia(value, base) {
  if (Array.isArray(value)) return value.map(item => cleanUnavailableMedia(item, base));
  if (!value || typeof value !== 'object') return value;
  const entries = [];
  for (const [key, item] of Object.entries(value)) {
    // Responsive registries use the media URL as an object key.
    if (unavailableMediaPath(key, base)) continue;
    const path = unavailableMediaPath(item, base);
    if (key === 'originalImage' && ORIGINALS.has(path)) continue;
    if (key === 'poster' && path === UNAVAILABLE_POSTER_PATH) continue;
    entries.push([key, cleanUnavailableMedia(item, base)]);
  }
  const result = Object.fromEntries(entries);
  if (ORIGINALS.has(unavailableMediaPath(value.originalImage, base))) {
    result.originalImageUnavailable = true;
    if (typeof result.imageProvenance === 'string') {
      result.imageProvenance = result.imageProvenance.replace(/original source image available for comparison\.?/i, 'original photo temporarily unavailable.');
      if (!/original photo temporarily unavailable/i.test(result.imageProvenance)) result.imageProvenance += ' ' + ORIGINAL_PHOTO_UNAVAILABLE;
    } else result.imageProvenance = ORIGINAL_PHOTO_UNAVAILABLE;
  }
  return result;
}

const cleanJSON = (text, base) => {
  try { return JSON.stringify(cleanUnavailableMedia(JSON.parse(text), base)).replace(/</g, '\\u003c'); }
  catch { return text; }
};

class CatalogueJSON {
  constructor(base) { this.base = base; }
  element() { this.buffer = ''; this.passthrough = false; }
  text(token) {
    if (this.passthrough) return;
    if (this.buffer.length + token.text.length > MAX_JSON_BYTES) {
      // Preserve oversized or unexpected scripts without buffering indefinitely.
      token.before(this.buffer, { html: true });
      this.buffer = '';
      this.passthrough = true;
      return;
    }
    this.buffer += token.text;
    token.remove();
    if (token.lastInTextNode) {
      token.after(cleanJSON(this.buffer, this.base), { html: true });
      this.buffer = '';
    }
  }
}

function jsonStream(body, base) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let parts = [], bytes = 0, passthrough = false;
  return body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      if (passthrough) { controller.enqueue(chunk); return; }
      bytes += chunk.byteLength;
      if (bytes > MAX_JSON_BYTES) {
        for (const part of parts) controller.enqueue(part);
        parts = [];
        passthrough = true;
        controller.enqueue(chunk);
      } else parts.push(chunk);
    },
    flush(controller) {
      if (passthrough) return;
      const text = parts.map(part => decoder.decode(part, { stream: true })).join('') + decoder.decode();
      controller.enqueue(encoder.encode(cleanJSON(text, base)));
    },
  }));
}

export function unavailableMedia(response, request) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || !HOSTS.has(url.hostname) || !response.ok || !response.body) return response;
  if (['espacios.me', 'www.espacios.me'].includes(url.hostname) && !url.pathname.startsWith('/communiverse/')) return response;
  const type = response.headers.get('Content-Type') || '';
  if (!/text\/html|application\/json/i.test(type)) return response;
  const headers = new Headers(response.headers);
  for (const name of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified']) headers.delete(name);
  headers.set('X-Communiverse-Unavailable-Media', 'comparison-originals-20261109');
  headers.set('Cache-Control', 'no-store');
  if (/application\/json/i.test(type)) return new Response(jsonStream(response.body, request.url), { status: response.status, headers });
  return new HTMLRewriter()
    .on('a[href]', { element(element) {
      if (ORIGINALS.has(unavailableMediaPath(element.getAttribute('href'), request.url))) {
        element.replace(`<span class="cv-original-unavailable">${ORIGINAL_PHOTO_UNAVAILABLE}</span>`, { html: true });
      }
    } })
    .on('[data-original]', { element(element) {
      if (ORIGINALS.has(unavailableMediaPath(element.getAttribute('data-original'), request.url))) element.removeAttribute('data-original');
    } })
    .on('video[poster]', { element(element) {
      if (unavailableMediaPath(element.getAttribute('poster'), request.url) === UNAVAILABLE_POSTER_PATH) element.removeAttribute('poster');
    } })
    .on('img[src]', { element(element) {
      if (unavailableMediaPath(element.getAttribute('src'), request.url) === UNAVAILABLE_POSTER_PATH) element.remove();
    } })
    .on('script[type="application/json"]', new CatalogueJSON(request.url))
    .transform(new Response(response.body, { status: response.status, headers }));
}
