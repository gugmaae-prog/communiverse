import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { unavailableMediaPath, cleanUnavailableMedia, UNAVAILABLE_ORIGINAL_PATHS, UNAVAILABLE_POSTER_PATH } from './unavailable-media.mjs';

const original = UNAVAILABLE_ORIGINAL_PATHS[3];
const valid = '/communiverse/_taz/20261102-v1/strata-960.webp';
const portrait = '/communiverse/_circles/20261022-v1/luna-1024.webp';
const film = '/communiverse/_public/media/ambassadors/20261008/luna.mp4';

test('only exact unavailable Communiverse references are recognized', () => {
  for (const path of [...UNAVAILABLE_ORIGINAL_PATHS, UNAVAILABLE_POSTER_PATH]) {
    for (const value of [path, path.replace('/communiverse', ''), 'https://communiverseclubs.com' + path, 'https://espacios.me' + path + '?v=1']) assert.equal(unavailableMediaPath(value), path, value);
  }
  assert.equal(unavailableMediaPath('https://example.com' + original), null);
  assert.equal(unavailableMediaPath('https://espacios.me' + original.replace('/communiverse', '')), null);
  for (const size of [320, 720, 1280]) assert.equal(unavailableMediaPath(UNAVAILABLE_POSTER_PATH.replace('-720.', '-' + size + '.')), UNAVAILABLE_POSTER_PATH);
  assert.equal(unavailableMediaPath('/communiverse/_public/media/ambassadors/20261008/luna.jpg'), UNAVAILABLE_POSTER_PATH);
  assert.equal(unavailableMediaPath(original.replace('-1280.', '-720.')), original);
  assert.equal(unavailableMediaPath(valid), null);
  assert.equal(unavailableMediaPath(portrait), null);
});

test('catalogue cleanup preserves art, provenance, film and profile identity', () => {
  const input = { image: valid, originalImage: original, imageProvenance: 'AI-assisted background extraction; original supplied photograph.', originalImageCredit: 'Artist', films: [{ src: film, poster: UNAVAILABLE_POSTER_PATH, title: 'Luna · through their lens' }], portrait, other: { originalImage: valid, poster: valid } };
  assert.deepEqual(cleanUnavailableMedia(input), { image: valid, imageProvenance: input.imageProvenance + ' Original photo temporarily unavailable.', originalImageUnavailable: true, originalImageCredit: 'Artist', films: [{ src: film, title: 'Luna · through their lens' }], portrait, other: { originalImage: valid, poster: valid } });
  assert.equal(cleanUnavailableMedia({ originalImage: original, imageProvenance: 'AI-assisted image enhancement; original source image available for comparison.' }).imageProvenance, 'AI-assisted image enhancement; original photo temporarily unavailable.');
  assert.equal(input.originalImage, original);
  assert.deepEqual(cleanUnavailableMedia({ [original]: { width: 1280 }, [UNAVAILABLE_POSTER_PATH.replace('-720.', '-320.')]: { width: 320 }, [valid]: { width: 960 } }), { [valid]: { width: 960 } });
});

test('real Workers HTMLRewriter handles streaming HTML and embedded catalogue JSON', async () => {
  const module = readFileSync(new URL('./unavailable-media.mjs', import.meta.url), 'utf8');
  const mf = new Miniflare(convertV4MiniflareOptions({ name: 'unavailable-media-test', compatibilityDate: '2026-11-09', modules: [
    { type: 'ESModule', path: 'index.mjs', contents: `import { unavailableMedia } from './unavailable-media.mjs'; export default { async fetch(request) { const text = await request.text(); const type = new URL(request.url).searchParams.get('type') || 'text/html'; const encoder = new TextEncoder(); let offset = 0; const stream = new ReadableStream({ pull(controller) { if (offset >= text.length) {controller.close();return;} controller.enqueue(encoder.encode(text.slice(offset, offset += 37))); } }); return unavailableMedia(new Response(stream, { headers: { 'Content-Type': type, ETag: 'stale' } }), new Request(request.url)); } };` },
    { type: 'ESModule', path: 'unavailable-media.mjs', contents: module },
  ] }));
  try {
    const data = { artwork: { image: valid, originalImage: original, imageProvenance: 'AI-assisted extraction from artist photograph.' }, person: { image: portrait, films: [{ src: film, poster: UNAVAILABLE_POSTER_PATH, title: 'Luna film' }] } };
    const html = `<html><body><a href="https://espacios.me${original}?v=1">See the photo before editing</a><p>AI-assisted extraction from artist photograph.</p><a data-original="${original}" href="${valid}"><img src="${valid}"></a><video src="${film}" poster="${UNAVAILABLE_POSTER_PATH}"></video><img src="${portrait}"><script type="application/json" id="cv-artwork-context">${JSON.stringify(data)}</script><script type="application/json" id="other">${JSON.stringify({ retained: true })}</script></body></html>`;
    const r = await mf.dispatchFetch('https://communiverseclubs.com/artists/sophiko/', { method: 'POST', body: html });
    const text = await r.text();
    assert.ok(text.includes('Original photo temporarily unavailable.'));
    assert.ok(text.includes('AI-assisted extraction from artist photograph.'));
    assert.ok(text.includes(`src="${valid}"`));
    assert.ok(text.includes(`src="${portrait}"`));
    assert.ok(text.includes(`src="${film}"`));
    assert.ok(!text.includes('data-original='));
    assert.ok(!text.includes(' poster='));
    const embedded = JSON.parse(text.match(/id="cv-artwork-context">([^<]+)<\/script>/)[1]);
    assert.deepEqual(embedded, cleanUnavailableMedia(data));
    assert.ok(text.includes('"retained":true'));
    assert.equal(r.headers.get('ETag'), null);
    assert.equal(r.headers.get('X-Communiverse-Unavailable-Media'), 'comparison-originals-20261109');
    const json = await mf.dispatchFetch('https://communiverseclubs.com/api/artworks?type=application/json', { method: 'POST', body: JSON.stringify(data) });
    assert.deepEqual(await json.json(), cleanUnavailableMedia(data));
    const unaffected = await mf.dispatchFetch('https://example.com/artists/', { method: 'POST', body: html });
    assert.equal(await unaffected.text(), html);
  } finally { await mf.dispose(); }
});
