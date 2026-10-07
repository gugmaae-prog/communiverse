import previous from './retained-production.js';
import SCRIPT from './gallery-media-script.txt';
/* MEDIA_IMPORTS */
const MEDIA = {
/* MEDIA_ENTRIES */
};
const RELEASE = '20261007-gallery-media-1';
const SCRIPT_PATH = '/communiverse/_public/' + RELEASE + '.js';
const OLD_SCRIPT_PATH = '/communiverse/_public/20260930-rigid-arc.js';
function mediaResponse(request, [buffer, type]) {
  const size = buffer.byteLength;
  const headers = new Headers({'Content-Type':type,'Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable','X-Communiverse-Release':RELEASE});
  let start = 0, end = size - 1, status = 200;
  const range = request.headers.get('Range');
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match && (match[1] || match[2])) {
      if (!match[1]) start = Math.max(0, size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(Number(match[2]), size - 1); }
    }
    if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
      headers.set('Content-Range', 'bytes */' + size);
      return new Response(null, {status:416, headers});
    }
    status = 206;
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  }
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : status === 206 ? buffer.slice(start, end + 1) : buffer, {status, headers});
}
export default {async fetch(request, env, ctx) {
  const url = new URL(request.url);
  if (!['espacios.me','www.espacios.me'].includes(url.hostname) || !['GET','HEAD'].includes(request.method)) return previous.fetch(request, env, ctx);
  if (Object.hasOwn(MEDIA, url.pathname)) return mediaResponse(request, MEDIA[url.pathname]);
  if (url.pathname === SCRIPT_PATH) return new Response(request.method === 'HEAD' ? null : SCRIPT, {headers:{'Content-Type':'application/javascript; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable','X-Communiverse-Release':RELEASE}});
  if (!['/communiverse','/communiverse/'].includes(url.pathname)) return previous.fetch(request, env, ctx);
  const inheritedHeaders = new Headers(request.headers);
  for (const key of ['If-None-Match','If-Modified-Since','Range']) inheritedHeaders.delete(key);
  const response = await previous.fetch(new Request(request, {headers:inheritedHeaders}), env, ctx);
  if (response.status !== 200 || !response.headers.get('Content-Type')?.includes('text/html')) return response;
  const headers = new Headers(response.headers);
  for (const key of ['Content-Length','Content-Encoding','ETag','Last-Modified']) headers.delete(key);
  headers.set('Cache-Control','no-cache');
  headers.set('X-Communiverse-Media-Release',RELEASE);
  if (request.method === 'HEAD') { await response.body?.cancel(); return new Response(null,{headers}); }
  const html = await response.text(); // Existing static homepage has a bounded size.
  if (!html.includes(OLD_SCRIPT_PATH)) throw Error('Unexpected homepage gallery release');
  return new Response(html.replaceAll(OLD_SCRIPT_PATH,SCRIPT_PATH),{headers});
}};
