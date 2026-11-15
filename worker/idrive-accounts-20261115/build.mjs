import { build } from '../supabase-accounts-20261111/node_modules/esbuild/lib/main.js';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { optimizeBaseline } from '../repairs/account-media-20261109/scripts/optimize-baseline.mjs';

const base = new URL('./', import.meta.url);
const baseline = gunzipSync(await readFile(new URL('../idrive-media-20261111/modules/public-worker.mjs.gz', base)));
let publicWorker = optimizeBaseline(baseline);
const delayedChoice = "function queueChoice(card,commit){cancelChoice();finishTap();const token=choiceToken;if(reduced.matches){commit();return;}if(card){const photo=card.querySelector('.cv-person-photo'),width=parseFloat(getComputedStyle(photo).width),scale=photo.getBoundingClientRect().width/width;tapCard=card;tapFeedback=photo.animate([{scale:String(scale)},{scale:String(Math.max(scale,1.06))}],{duration:120,easing:timing.ease,fill:'forwards'});}choiceFrame=setTimeout(()=>{choiceFrame=0;if(token===choiceToken)commit();},32);}"
const directChoice = "function queueChoice(card,commit){cancelChoice();finishTap();commit();}"
if (publicWorker.split(delayedChoice).length !== 2) throw Error('Expected one pinned Circles tap transition');
publicWorker = publicWorker.replace(delayedChoice, directChoice);
await writeFile(new URL('../idrive-media-20261111/build/optimized-public-worker.mjs', base), publicWorker);
await mkdir(new URL('build/', base), { recursive: true });
const outfile = fileURLToPath(new URL('build/account-worker.mjs', base));
await build({ entryPoints: [fileURLToPath(new URL('entry.mjs', base))], outfile, bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true, loader: { '.webp': 'dataurl' }, external: ['cloudflare:workers'] });
const output = await readFile(outfile);
const sha256 = createHash('sha256').update(output).digest('hex');
await writeFile(new URL('build/sha256.txt', base), sha256 + '\n');
console.log(JSON.stringify({ sha256, bytes: output.length }));
