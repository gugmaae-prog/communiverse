import { readFile, writeFile } from 'node:fs/promises';
import { copy } from './copy-public.mjs';

const base = new URL('./', import.meta.url);
const names = ['cv-haseeb-wasim', 'cv-alison-gonzalez', 'cv-louis-mitchell', 'cv-elferah-saidil', 'cv-hassan-b-mirza'];
const records = [];
for (const name of names) {
  const route = `/communiverse/_public/avatar/${name}?v=1`;
  const redirect = await fetch('https://communiverseclubs.com' + route, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
  const path = redirect.headers.get('location');
  if (redirect.status !== 302 || path !== `/communiverse/_public/domain-portraits-20261028/${name}.webp`) throw Error(`Unexpected avatar redirect for ${name}`);
  records.push(await copy(path));
}
const manifest = JSON.parse(await readFile(new URL('verified-portraits.json', base), 'utf8'));
const merged = new Map([...manifest, ...records].map(({ path, bytes, sha256 }) => [path, { path, bytes, sha256 }]));
await writeFile(new URL('verified-portraits.json', base), JSON.stringify([...merged.values()].sort((a, b) => a.path.localeCompare(b.path)), null, 2) + '\n');
console.log(JSON.stringify({ copied: records.length, portraitAssets: merged.size, verified: records.every(record => record.verified) }));
