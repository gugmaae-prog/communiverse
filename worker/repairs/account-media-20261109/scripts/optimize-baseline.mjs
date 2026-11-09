#!/usr/bin/env node
// Produce a derivative; the pinned production capture is never modified.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASELINE_SHA256 = '87370e2eb8aad872779d481ea60dcde3251e2c876048f6383c0cbe319808d5fb';
export function optimizeBaseline(bytes) {
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== BASELINE_SHA256) throw new Error('Baseline SHA-256 differs; review before optimizing.');
  let source = bytes.toString('utf8');
  for (const [name, portraits, replacements, suffix] of [
    ['portraitText', 'portraits', 'replacements', 'V1'],
    ['portraitText2', 'portraits2', 'replacements2', 'V2'],
  ]) {
    const slashLiteral = JSON.stringify(String.fromCharCode(92) + "/");
    const old = `function ${name}(source){for(let[id,p]of Object.entries(${portraits}))source=source.replaceAll(JSON.stringify(PORTRAITS[id]),JSON.stringify(p));for(let[old2,url]of ${replacements})source=source.replaceAll(old2,url).replaceAll(old2.replaceAll("/",${slashLiteral}),url.replaceAll("/",${slashLiteral}));return source}`;
    if (source.split(old).length !== 2) throw new Error('Expected exactly one unchanged function anchor: ' + name);
    const pairs = '__cvPortraitJSONPairs' + suffix;
    const urls = '__cvPortraitURLPairs' + suffix;
    const next = `var ${pairs}=Object.entries(${portraits}).map(([id,p])=>[JSON.stringify(PORTRAITS[id]),JSON.stringify(p)]),${urls}=${replacements}.map(([old2,url])=>[old2,url,old2.replaceAll("/",${slashLiteral}),url.replaceAll("/",${slashLiteral})]);function ${name}(source){for(let[old2,url]of ${pairs})source=source.replaceAll(old2,url);for(let[old2,url,escapedOld,escapedNew]of ${urls})source=source.replaceAll(old2,url).replaceAll(escapedOld,escapedNew);return source}`;
    source = source.replace(old, next);
  }
  return source;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const input = new URL('../modules/public-worker.mjs', import.meta.url);
  const output = new URL('../modules/optimized-worker.mjs', import.meta.url);
  const optimized = optimizeBaseline(await readFile(input));
  await mkdir(dirname(fileURLToPath(output)), { recursive: true });
  await writeFile(output, optimized);
  console.log('Verified pinned baseline; wrote derivative modules/optimized-worker.mjs.');
  console.log('Original baseline remains unchanged.');
}
