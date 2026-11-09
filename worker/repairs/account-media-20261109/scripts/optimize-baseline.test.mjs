import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { optimizeBaseline } from './optimize-baseline.mjs';
const root = new URL('../', import.meta.url);
const scratch = new URL('../.work/optimization-test/', import.meta.url);
await mkdir(scratch, { recursive: true });
const baseline = await readFile(new URL('modules/public-worker.mjs', root));
const optimized = optimizeBaseline(baseline);
const names = ['portraitText','portraitText2','portraits','portraits2','PORTRAITS','replacements','replacements2','cache','cache2','catalogue','home_default','home_default2','discover_default','discover_default2','artists_default','artists_default2','events_default','events_default2','clubs_default','clubs_default2','circles_default','circles_default2','artist_default','artist_default2','public_cache_default','public_cache_default2'];
const extra = '\nexport {' + names.join(',') + '};\n';
// These tests execute catalogue transforms only. Stub the unavailable Node
// Cloudflare base class; no Durable Object or application handler is invoked.
const instrument = source => source.replace('import{DurableObject}from"cloudflare:workers";', 'class DurableObject{};').replace('import{DurableObject as DurableObject2}from"cloudflare:workers";', 'class DurableObject2{};');
await writeFile(new URL('original.mjs', scratch), instrument(baseline.toString('utf8')) + extra);
await writeFile(new URL('optimized.mjs', scratch), instrument(optimized) + extra);
const original = await import(new URL('original.mjs', scratch));
const next = await import(new URL('optimized.mjs', scratch));

test('optimizer rejects other source bytes and preserves captured baseline', () => {
  assert.throws(() => optimizeBaseline(Buffer.from('different release')), /SHA-256 differs/);
  assert.deepEqual(baseline, Buffer.from(baseline.toString('utf8')));
  assert(!baseline.toString('utf8').includes('__cvPortraitJSONPairsV1'));
  assert(optimized.includes('__cvPortraitJSONPairsV1'));
});
test('all eager catalogue/cache results match exactly', () => {
  for (const name of ['cache','cache2','catalogue']) assert.equal(JSON.stringify(next[name]), JSON.stringify(original[name]), name);
});
test('both transforms preserve every retained public HTML and cache JSON string', () => {
  for (const name of names.filter(n => n.endsWith('_default') || /_default2$/.test(n))) {
    for (const fn of ['portraitText','portraitText2']) assert.equal(next[fn](original[name]), original[fn](original[name]), fn + ' ' + name);
  }
});
test('raw/escaped URLs, serialized metadata and repeated edge strings retain replacement order', () => {
  const slash = String.fromCharCode(92);
  for (const [fn, pairs] of [['portraitText','replacements'],['portraitText2','replacements2']]) {
    const values = ['', 'No portrait or route here.', '/unrelated/artist/', '"quotes" <&> Unicode · هنر', ...original[pairs].flat(), ...Object.values(original.PORTRAITS).map(v=>JSON.stringify(v))];
    for (const value of [...values]) values.push(value.replaceAll('/', slash + '/'), value + value, '<span>' + value + '</span>');
    for (const input of values) assert.equal(next[fn](input), original[fn](input), fn + ' edge');
    const joined=values.join('\n');
    assert.equal(next[fn](joined), original[fn](joined), fn+' combined');
  }
});
