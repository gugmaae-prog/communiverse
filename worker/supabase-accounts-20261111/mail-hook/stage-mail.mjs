import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const base = new URL('./', import.meta.url);
const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'espacios-mail';
const ACTIVE = 'd3b3ce4f-b9ae-4fec-ac3b-819a919f8eee';
const DEPLOYMENT = 'd9495a75-c854-4d99-9597-0b935d7ce1b4';
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
  readFile(new URL('../build/espacios-mail-patched.mjs', base)),
]);
const latestId = versions.items?.[0]?.id;
if (!latestId) throw Error('Latest Worker version unavailable for secret inheritance');
const latest = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${latestId}`);
const sourceBindings = source.resources.bindings.map(b => `${b.name}:${b.type}`).sort();
const latestBindings = latest.resources.bindings.map(b => `${b.name}:${b.type}`).sort();
if (JSON.stringify(sourceBindings) !== JSON.stringify(latestBindings)) throw Error('Latest version has different bindings');
// Inherit the existing R2 binding as well: this account rejects a fresh R2
// binding validation while the deployed Mail Worker still retains its bucket.
const bindings = source.resources.bindings.map(binding => ({ name: binding.name, type: 'inherit', version_id: 'latest' }));
if (!source.resources.bindings.some(b => b.name === 'SUPABASE_SEND_EMAIL_HOOK_SECRET' && b.type === 'secret_text') || !source.resources.bindings.some(b => b.name === 'DB' && b.type === 'd1')) throw Error('Mail hook bindings changed');
const digest = createHash('sha256').update(code).digest('hex');
const metadata = {
  main_module: 'worker.js',
  compatibility_date: settings.compatibility_date,
  compatibility_flags: settings.compatibility_flags,
  migration_tag: source.resources.script_runtime.migration_tag,
  keep_assets: true,
  bindings,
  annotations: { 'workers/tag': 'espacios-mail-communiverse-auth-20261111', 'workers/message': 'Exact Communiverse signup and recovery email handoff; Espacios Mail routes preserved' },
};
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata');
form.append('worker.js', new Blob([code], { type: 'application/javascript+module' }), 'worker.js');
const created = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions`, { method: 'POST', body: form });
if (await pinnedDeployment() !== before) throw Error('Public deployment changed during staging');
const candidate = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${created.id}`);
const candidateBindings = candidate.resources.bindings.map(b => `${b.name}:${b.type}`).sort();
if (JSON.stringify(candidateBindings) !== JSON.stringify(sourceBindings)) throw Error('Candidate bindings differ from active Mail Worker');
const result = { worker: WORKER, liveVersion: ACTIVE, liveDeployment: before, codeSHA256: digest, candidateVersion: created.id, url: created.urls?.[0] || null, startupTimeMs: created.startup_time_ms, priorBindingsRetained: true };
await writeFile(new URL('../build/mail-stage-result.json', base), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
