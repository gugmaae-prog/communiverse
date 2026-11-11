import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const base = new URL('./', import.meta.url);
const priorBundle = new URL('../idrive-media-20261111/build/optimized-public-worker.mjs', base);
await readFile(priorBundle);
await mkdir(new URL('build/', base), { recursive: true });
const outfile = fileURLToPath(new URL('build/account-worker.mjs', base));
await build({
  entryPoints: [fileURLToPath(new URL('entry.mjs', base))],
  outfile,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  external: ['cloudflare:workers'],
});
const source = await readFile(outfile);
const sha256 = createHash('sha256').update(source).digest('hex');
await writeFile(new URL('build/sha256.txt', base), `${sha256}\n`);
console.log(JSON.stringify({ sha256, bytes: source.length }));
