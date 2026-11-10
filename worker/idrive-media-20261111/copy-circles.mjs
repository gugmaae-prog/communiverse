import { writeFile, mkdir } from 'node:fs/promises';
import { copy } from './copy-public.mjs';
import { parseMediaPath } from './gateway.mjs';

const base = new URL('./', import.meta.url);
const page = await fetch('https://communiverseclubs.com/circles/', { signal: AbortSignal.timeout(30000) });
if (page.status !== 200) throw Error('Public Circles page is unavailable');
const html = await page.text();
const portraits = [...html.matchAll(/<img[^>]+data-cv-avatar="orbit"[^>]*>/g)].map(match => match[0]);
if (portraits.length !== 16) throw Error(`Expected 16 Circles portraits, found ${portraits.length}`);
const urls = new Set();
for (const tag of portraits) {
  for (const match of tag.matchAll(/\/communiverse\/[a-zA-Z0-9/._-]+\.(?:webp|png|jpg|jpeg|avif)/g)) {
    if (parseMediaPath('/cv-media' + match[0])) urls.add(match[0]);
  }
}
const results = [];
for (const path of urls) {
  try { results.push(await copy(path)); }
  catch (error) { results.push({ path, error: error.message }); }
}
await mkdir(new URL('build/', base), { recursive: true });
await writeFile(new URL('build/circles-copy.json', base), JSON.stringify({ people: portraits.length, images: urls.size, results }, null, 2) + '\n');
if (!results.some(record => record.error)) {
  await writeFile(new URL('verified-portraits.json', base), JSON.stringify(results.map(({ path, bytes, sha256 }) => ({ path, bytes, sha256 })), null, 2) + '\n');
}
console.log(JSON.stringify({ people: portraits.length, images: urls.size, verified: results.filter(x => x.verified).length, failed: results.filter(x => x.error).map(x => x.path) }, null, 2));
if (results.some(x => x.error)) process.exitCode = 1;
