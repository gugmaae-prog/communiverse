import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseMediaPath } from './gateway.mjs';

const base = new URL('./', import.meta.url);
const sourceOrigin = 'https://communiverseclubs.com';
const checksum = bytes => createHash('sha256').update(bytes).digest('hex');

export async function copy(path) {
  const media = parseMediaPath('/cv-media' + path);
  if (!media) throw Error('Path is outside the scoped public-media catalogue');
  const [{ url }, token] = await Promise.all([
    readFile(new URL('build/stage-result.json', base), 'utf8').then(JSON.parse),
    readFile(new URL('build/upload-token', base), 'utf8'),
  ]);
  if (!url || token.length < 48) throw Error('Staged gateway receipt or token unavailable');
  const source = await fetch(sourceOrigin + path, { signal: AbortSignal.timeout(30000) });
  if (source.status !== 200 || !String(source.headers.get('content-type')).startsWith(media.contentType)) throw Error(`Source is unavailable or has a different type: ${source.status}`);
  const bytes = Buffer.from(await source.arrayBuffer());
  if (!bytes.length || bytes.length > 16 * 1024 * 1024) throw Error('Source size is outside gateway limits');
  const sha256 = checksum(bytes);
  const target = url + '/cv-media' + path;
  const saved = await fetch(target, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': media.contentType, 'Content-Length': String(bytes.length), 'X-Content-SHA256': sha256 },
    body: bytes,
    signal: AbortSignal.timeout(60000),
  });
  const receipt = await saved.json().catch(() => null);
  if (!saved.ok || !receipt?.verified || receipt.sha256 !== sha256) throw Error(`IDrive upload failed: ${saved.status} ${receipt?.error || 'invalid receipt'}`);
  const readback = await fetch(target, { signal: AbortSignal.timeout(30000) });
  if (readback.status !== 200 || readback.headers.get('content-type') !== media.contentType) throw Error(`IDrive public read failed: ${readback.status}`);
  const actual = Buffer.from(await readback.arrayBuffer());
  if (checksum(actual) !== sha256) throw Error('IDrive public read hash differs from source');
  return { path, bytes: bytes.length, sha256, verified: true, gatewayVersion: url.match(/^https:\/\/([^-]+)-/)?.[1] };
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  if (process.argv.length !== 3) {
    console.error('Usage: node copy-public.mjs /communiverse/_.../image.webp');
    process.exitCode = 2;
  } else {
    copy(process.argv[2]).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
