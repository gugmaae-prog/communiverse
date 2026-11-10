import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { optimizeBaseline } from '../../repairs/account-media-20261109/scripts/optimize-baseline.mjs';
import { enableAccounts } from './enable-accounts.mjs';

const root = new URL('../', import.meta.url);
const captured = gunzipSync(await readFile(new URL('modules/public-worker.mjs.gz', root)));
const source = enableAccounts(optimizeBaseline(captured));
await mkdir(new URL('modules/', root), { recursive: true });
await writeFile(new URL('modules/enabled-worker.mjs', root), source);
await mkdir(new URL('build/', root), { recursive: true });
const outfile = fileURLToPath(new URL('build/worker.mjs', root));
await build({
  entryPoints: [fileURLToPath(new URL('entry.mjs', root))],
  outfile,
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  keepNames: false,
  external: ['cloudflare:workers'],
});
const digest = createHash('sha256').update(await readFile(outfile)).digest('hex');
await writeFile(new URL('build/sha256.txt', root), digest + '\n');
console.log(`Built account cutover candidate ${digest}`);
