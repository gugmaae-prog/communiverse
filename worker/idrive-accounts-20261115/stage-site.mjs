import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const base = new URL('./', import.meta.url);
const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'communiverse-workspace-ux-v3-20261009';
const ACTIVE = '645d3578-5308-4705-a8bb-1fe7f7631c12';
const DEPLOYMENT = 'a5ac7910-a7bf-4969-8672-3fd84b518105';
const SERVICE_VERSION = 'b92fae7e-8fcf-4673-aaf5-4ee93c9d1da2';
const SERVICE_URL = 'https://b92fae7e-espacios-ai-router.thekeifferjapeth.workers.dev';
const CURRENT_SERVICE_URL = SERVICE_URL;
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
  readFile(new URL('build/account-worker.mjs', base)),
]);
const latestId = versions.items?.[0]?.id;
if (!latestId) throw Error('Latest Worker version unavailable for secret inheritance');
const latest = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${latestId}`);
const sourceSecrets = source.resources.bindings.filter(b => b.type === 'secret_text').map(b => b.name).sort();
const latestSecrets = latest.resources.bindings.filter(b => b.type === 'secret_text').map(b => b.name).sort();
const requiredSecrets = sourceSecrets;
if (JSON.stringify(requiredSecrets) !== JSON.stringify(latestSecrets)) throw Error('Latest version has unexpected secret bindings');
const bindings = source.resources.bindings.map(binding => binding.type === 'secret_text' ? { name: binding.name, type: 'inherit', version_id: 'latest' } : binding);
if (!bindings.some(b => b.name === 'CV_ACCOUNT_GATEWAY_SECRET')) throw Error('Account gateway secret is unavailable');
if (bindings.find(b => b.name === 'CV_ACCOUNT_CUTOVER_READY')?.text !== 'false') throw Error('Public account pause binding changed');
const stage = JSON.parse(await readFile(new URL('build/stage-result.json', base), 'utf8'));
if (stage.version !== SERVICE_VERSION || stage.url !== SERVICE_URL) throw Error('Private account service candidate changed');
const bridgeToken = (await readFile(new URL('build/bridge-token', base), 'utf8')).trim();
if (!/^[a-f0-9]{96}$/.test(bridgeToken)) throw Error('Private account service token is invalid');
if (!bindings.some(b => b.name === 'CV_IDRIVE_AUTH_TOKEN')) bindings.push({ name: 'CV_IDRIVE_AUTH_TOKEN', type: 'secret_text', text: bridgeToken });
const urlBinding = bindings.find(b => b.name === 'CV_IDRIVE_AUTH_URL');
if (urlBinding?.text !== CURRENT_SERVICE_URL) throw Error('Current private account service URL changed');
urlBinding.text = SERVICE_URL;
const digest = createHash('sha256').update(code).digest('hex');
const metadata = {
  main_module: 'account-worker.mjs',
  compatibility_date: settings.compatibility_date,
  compatibility_flags: settings.compatibility_flags,
  migration_tag: source.resources.script_runtime.migration_tag,
  keep_assets: true,
  bindings,
  annotations: { 'workers/tag': 'communiverse-idrive-accounts-20261115', 'workers/message': 'Preserve account storage, route aliases and branded navigation' },
};
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata');
form.append('account-worker.mjs', new Blob([code], { type: 'application/javascript+module' }), 'account-worker.mjs');
const created = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions`, { method: 'POST', body: form });
if (await pinnedDeployment() !== before) throw Error('Public deployment changed during staging');
const result = { worker: WORKER, liveVersion: ACTIVE, liveDeployment: before, codeSHA256: digest, candidateVersion: created.id, url: created.urls?.[0] || null, startupTimeMs: created.startup_time_ms, d1PauseRetained: true, accountServiceVersion: SERVICE_VERSION };
await writeFile(new URL('build/account-stage-result.json', base), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
