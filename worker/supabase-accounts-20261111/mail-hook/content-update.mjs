import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'espacios-mail';
const BASELINE = 'fd895d3f-e09c-472b-9f32-a2cee5ba745a';
const DEPLOYMENT = '3351723c-a40a-4333-b296-f385049ad5bf';
const base = new URL('./', import.meta.url);
const mode = process.argv[2];
if (mode !== 'apply' && mode !== 'rollback') throw Error('Use apply or rollback');
const path = `/accounts/${ACCOUNT}/workers/scripts/${WORKER}`;

async function api(suffix, init = {}) {
  const config = await readFile(join(homedir(), '.wrangler/config/default.toml'), 'utf8');
  const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
  if (!token) throw Error('Wrangler authorization is unavailable');
  const request = await fetch('https://api.cloudflare.com/client/v4' + path + suffix, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(120000),
  });
  const result = await request.json();
  if (!request.ok || !result.success) throw Error(`Cloudflare ${request.status}: ${(result.errors || []).map(e => `${e.code} ${e.message}`).join('; ')}`);
  return result.result;
}
const current = (await api('/deployments')).deployments[0];
if (mode === 'apply' && (current.id !== DEPLOYMENT || !current.versions.some(v => v.version_id === BASELINE && v.percentage === 100))) throw Error('Mail deployment changed before content update');
let release;
if (mode === 'rollback') {
  release = JSON.parse(await readFile(new URL('../build/mail-content-update.json', base), 'utf8'));
  if (current.id !== release.liveDeployment || !current.versions.some(v => v.version_id === release.liveVersion && v.percentage === 100)) throw Error('Mail deployment changed before rollback');
}
const code = mode === 'apply'
  ? await readFile(new URL('../build/espacios-mail-patched.mjs', base))
  : (await import('node:zlib')).gunzipSync(await readFile(new URL('espacios-mail-baseline.mjs.gz', base)));
const digest = createHash('sha256').update(code).digest('hex');
if (mode === 'apply' && digest !== 'c66ca9f71caff612ce0889750b3dd2b0ff70a87049a2b51e47f3ef3ff1fe4afe') throw Error('Patched Mail code changed');
if (mode === 'rollback' && digest !== '61cca1da12155adba664478d3ba3a2f343db94c36b3b7d16e0e19c897db10cb2') throw Error('Mail baseline changed');
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify({ main_module: 'worker.js' })], { type: 'application/json' }), 'metadata');
form.append('worker.js', new Blob([code], { type: 'application/javascript+module' }), 'worker.js');
const updated = await api('/content', { method: 'PUT', body: form });
const after = (await api('/deployments')).deployments[0];
const result = { mode, codeSHA256: digest, priorDeployment: current.id, liveDeployment: after.id, liveVersion: after.versions.find(v => v.percentage === 100)?.version_id || null, scriptModifiedOn: updated.modified_on || null };
if (mode === 'apply') await writeFile(new URL('../build/mail-content-update.json', base), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
