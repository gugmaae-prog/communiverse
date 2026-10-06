// Read-only Cloudflare recovery. Does not upload, deploy, modify bindings or merge a branch.
// Run: CLOUDFLARE_API_TOKEN=... node worker/releases/plug-streamline/recover-release.mjs [destination]
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';

const account = process.env.CLOUDFLARE_ACCOUNT_ID || 'b1b843ec85bc39a3a4d370ba4f84f17a';
const token = process.env.CLOUDFLARE_API_TOKEN;
const version = '53b3f842-67cf-4241-864b-f21a597952ce';
const release = '20261006-plug-streamline-2';
const destination = resolve(process.argv[2] || './communiverse-release-recovery');
const expected = {
  'spaced-entry.js': '0c87b427499fc3cec3a9be085a4302dc02c7fa387858288d893260aab24c91e9',
  'spaced-profiles.txt': 'a003e7ae42f03133e8d5e5be6a13748221ef85410176681d36d1fe9706ebaec8',
  'spaced-script.txt': '523d54ca02d03811a40fbcee47bc2a6aa3fa52d222378f9740c81354dd789168',
  'spaced-style.txt': 'f04e7b847350ef185f925ab64b1cb6490fdc7622809a276a9f44cb51556552f2',
};

async function run() {
  if (!token) throw new Error('Set a Cloudflare token with read access to this Worker in CLOUDFLARE_API_TOKEN.');
  if (!/^[a-f0-9]{32}$/i.test(account)) throw new Error('Invalid account ID.');
  const url = `https://api.cloudflare.com/client/v4/accounts/${account}/workers/workers/communiverse/versions/${version}?include=modules`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`Cloudflare read failed: HTTP ${response.status}`);
  const payload = await response.json();
  if (!payload.success || !Array.isArray(payload.result?.modules)) throw new Error('Cloudflare did not return Worker modules.');
  const worker = payload.result;
  if (worker.main_module !== 'spaced-entry.js') throw new Error('Unexpected Worker entry point.');
  const outputs = [], hashes = {};
  for (const module of worker.modules) {
    if (typeof module.name !== 'string' || typeof module.content_base64 !== 'string') throw new Error('Malformed module.');
    const file = resolve(destination, 'modules', module.name);
    const within = relative(resolve(destination, 'modules'), file);
    if (within.startsWith('..') || isAbsolute(within)) throw new Error('Unsafe module path.');
    const bytes = Buffer.from(module.content_base64, 'base64');
    const hash = createHash('sha256').update(bytes).digest('hex');
    hashes[module.name] = hash;
    outputs.push({ file, bytes, name: module.name, content_type: module.content_type, sha256: hash });
  }
  for (const [name, hash] of Object.entries(expected)) {
    if (hashes[name] !== hash) throw new Error(`Checksum mismatch: ${name}`);
  }
  for (const output of outputs) {
    await mkdir(dirname(output.file), { recursive: true });
    await writeFile(output.file, output.bytes, { flag: 'wx' });
  }
  await writeFile(resolve(destination, 'manifest.json'), JSON.stringify({
    release, version, main_module: worker.main_module,
    compatibility_date: worker.compatibility_date, compatibility_flags: worker.compatibility_flags,
    assets: worker.assets,
    bindings: worker.bindings.map(binding => { const copy = { ...binding }; delete copy.text; return copy; }),
    modules: outputs.map(({name, content_type, sha256, bytes}) => ({name, content_type, sha256, bytes: bytes.length})),
    note: 'This recovers Worker modules, not the separate retained static-assets collection. Reuse that collection with keep_assets=true for a scoped upload; do not deploy repository main over production.'
  }, null, 2) + '\n', { flag: 'wx' });
  console.log(`Recovered ${outputs.length} modules for ${release}. No production changes made.`);
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
