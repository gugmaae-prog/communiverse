import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const base = new URL('./', import.meta.url);
const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'communiverse-workspace-ux-v3-20261009';
const ACTIVE = '32c4ad87-1dac-4d1b-8c12-94f792c701b9';
const DEPLOYMENT = '2d069bad-9a01-427e-91c1-71c9f0e3b22e';
async function api(path, init = {}) {
  const config = await readFile(join(homedir(), '.wrangler/config/default.toml'), 'utf8');
  const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
  if (!token) throw Error('Wrangler authorization is unavailable');
  const request = await fetch('https://api.cloudflare.com/client/v4' + path, {
    ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers }, signal: AbortSignal.timeout(120000),
  });
  const result = await request.json();
  if (!request.ok || !result.success) throw Error(`Cloudflare ${request.status}: ${(result.errors || []).map(e => `${e.code} ${e.message}`).join('; ')}`);
  return result.result;
}
async function pinnedDeployment() {
  const result = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/deployments`);
  const current = result.deployments?.[0] || result[0];
  if (current.id !== DEPLOYMENT || !current.versions.some(v => v.version_id === ACTIVE && v.percentage === 100) || current.versions.some(v => v.version_id !== ACTIVE && v.percentage !== 0)) throw Error('Public deployment changed; review before staging');
  return current.id;
}
const before = await pinnedDeployment();
const [source, settings, versions, code] = await Promise.all([
  api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${ACTIVE}`),
  api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/settings`),
  api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions`),
  readFile(new URL('build/media-worker.mjs', base)),
]);
const latestId = versions.items?.[0]?.id;
if (!latestId) throw Error('Latest Worker version unavailable for secret inheritance');
const latest = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${latestId}`);
const sourceSecrets = source.resources.bindings.filter(b => b.type === 'secret_text').map(b => b.name).sort();
const latestSecrets = latest.resources.bindings.filter(b => b.type === 'secret_text').map(b => b.name).sort();
if (JSON.stringify(sourceSecrets) !== JSON.stringify(latestSecrets)) throw Error('Latest version has different secret bindings');
const bindings = source.resources.bindings.map(binding => binding.type === 'secret_text' ? { name: binding.name, type: 'inherit', version_id: 'latest' } : binding);
if (bindings.find(b => b.name === 'CV_ACCOUNT_CUTOVER_READY')?.text !== 'false') throw Error('Public account pause binding changed');
const digest = createHash('sha256').update(code).digest('hex');
const metadata = {
  main_module: 'media-worker.mjs',
  compatibility_date: settings.compatibility_date,
  compatibility_flags: settings.compatibility_flags,
  migration_tag: source.resources.script_runtime.migration_tag,
  keep_assets: true,
  bindings,
  annotations: { 'workers/tag': 'communiverse-idrive-media-20261111', 'workers/message': 'Media-only IDrive E2 candidate; account pause retained' },
};
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata');
form.append('media-worker.mjs', new Blob([code], { type: 'application/javascript+module' }), 'media-worker.mjs');
const created = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions`, { method: 'POST', body: form });
if (await pinnedDeployment() !== before) throw Error('Public deployment changed during staging');
const result = { worker: WORKER, liveVersion: ACTIVE, liveDeployment: before, codeSHA256: digest, candidateVersion: created.id, url: created.urls?.[0] || null, startupTimeMs: created.startup_time_ms, accountPauseRetained: true };
await writeFile(new URL('build/site-stage-result.json', base), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
