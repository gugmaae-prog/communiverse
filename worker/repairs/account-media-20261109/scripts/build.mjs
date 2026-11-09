#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { optimizeBaseline } from './optimize-baseline.mjs';

const root = new URL('../', import.meta.url);
const baseline = await readFile(new URL('modules/public-worker.mjs', root));
const optimized = optimizeBaseline(baseline);
await mkdir(new URL('modules/', root), { recursive: true });
await writeFile(new URL('modules/optimized-worker.mjs', root), optimized);
await mkdir(new URL('build/', root), { recursive: true });
const outfile = fileURLToPath(new URL('build/repaired-worker.mjs', root));
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
const bytes = await readFile(outfile);
await writeFile(new URL('build/artifact-sha256.txt', root), createHash('sha256').update(bytes).digest('hex') + '\n');
console.log('Verified baseline and built build/repaired-worker.mjs with keepNames:false.');
console.log('SHA-256:', createHash('sha256').update(bytes).digest('hex'));
