import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'communiverse-workspace-ux-v3-20261009';
const PIN = '6f3e4ff8-d51c-4d4b-94eb-e3efdc59f209';
const root = new URL('../', import.meta.url);
const tokenFile = join(homedir(), '.wrangler/config/default.toml');

async function api(path, init = {}) {
  const config = await readFile(tokenFile, 'utf8');
  const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
  if (!token) throw Error('Current Wrangler authorization is unavailable.');
  const response = await fetch('https://api.cloudflare.com/client/v4' + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(120000),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw Error(`Cloudflare ${response.status}: ${(data.errors || []).map(e => e.code + ' ' + e.message).join('; ')}`);
  }
  return data.result;
}

async function pin() {
  const data = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/deployments`);
  const live = data.deployments?.[0] ?? data[0];
  if (!live?.versions?.some(version => version.version_id === PIN && version.percentage === 100) || live.versions.some(version => version.version_id !== PIN && version.percentage !== 0)) {
    throw Error('Production version changed; review before staging.');
  }
  return live.id;
}

function releaseBindings(source) {
  const names = new Set();
  const bindings = source.map(binding => {
    if (names.has(binding.name)) throw Error('Duplicate binding: ' + binding.name);
    names.add(binding.name);
    if (binding.type === 'secret_text') return { name: binding.name, type: 'inherit', version_id: 'latest' };
    if (binding.name === 'CV_ACCOUNT_CUTOVER_READY') return { ...binding, text: 'true' };
    if (binding.name === 'CV_APP_BASE_URL') return { ...binding, text: 'https://communiverseclubs.com/account/' };
    return binding;
  });
  for (const name of ['ASSETS', 'MARKETPLACE', 'COMMUNIVERSE_DB', 'TURNSTILE_SECRET_KEY', 'TURNSTILE_SITE_KEY', 'CV_ACCOUNT_CUTOVER_READY', 'CV_APP_BASE_URL']) {
    if (!names.has(name)) throw Error('Required binding missing: ' + name);
  }
  return bindings;
}

async function main() {
  const execute = process.argv.slice(2).join(' ') === '--stage';
  if (process.argv.length > 2 && !execute) throw Error('Use no argument to prepare or --stage to upload an inactive version.');
  const liveBefore = await pin();
  const [source, settings, code] = await Promise.all([
    api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${PIN}`),
    api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/settings`),
    readFile(new URL('build/worker.mjs', root)),
  ]);
  const bindings = releaseBindings(source.resources.bindings);
  const digest = createHash('sha256').update(code).digest('hex');
  const summary = { worker: WORKER, activeVersion: PIN, activeDeployment: liveBefore, codeSHA256: digest, bindingCount: bindings.length, inheritedSecretCount: bindings.filter(b => b.type === 'inherit').length, assets: bindings.some(b => b.name === 'ASSETS'), staged: false };
  if (!execute) return summary;
  const versions = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions`);
  const latestId = versions.items?.[0]?.id;
  if (!latestId) throw Error('Latest version cannot be identified for secret inheritance.');
  if (latestId !== PIN) {
    const latest = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions/${latestId}`);
    const live = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/deployments`);
    const current = live.deployments?.[0] ?? live[0];
    if (latest.annotations?.['workers/tag'] !== 'account-cutover-20261110' || !current.versions.some(version => version.version_id === latestId && version.percentage === 0)) {
      throw Error('Latest version is not an inactive account cutover candidate; secret inheritance requires review.');
    }
    const sourceSecrets = source.resources.bindings.filter(binding => binding.type === 'secret_text').map(binding => binding.name).sort();
    const latestSecrets = latest.resources.bindings.filter(binding => binding.type === 'secret_text').map(binding => binding.name).sort();
    if (JSON.stringify(sourceSecrets) !== JSON.stringify(latestSecrets)) throw Error('Latest candidate secret bindings differ from production.');
  }
  const metadata = {
    main_module: 'worker.mjs',
    compatibility_date: settings.compatibility_date,
    compatibility_flags: settings.compatibility_flags,
    migration_tag: source.resources.script_runtime.migration_tag,
    keep_assets: true,
    bindings,
    annotations: { 'workers/message': 'Inactive Communiverse branded account cutover candidate; no public traffic', 'workers/tag': 'account-cutover-20261110' },
  };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }), 'metadata');
  form.append('worker.mjs', new Blob([code], { type: 'application/javascript+module' }), 'worker.mjs');
  const created = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/versions`, { method: 'POST', body: form });
  if (!/^[a-f0-9-]{36}$/.test(created.id || '')) throw Error('Cloudflare did not report a candidate version.');
  const liveAfter = await pin();
  if (liveBefore !== liveAfter) throw Error('Production changed during staging; candidate must not be promoted.');
  const result = { ...summary, staged: true, version: created.id, previewURL: created.urls?.[0] || null, startupTimeMs: created.startup_time_ms || null };
  await writeFile(new URL('build/stage-result.json', root), JSON.stringify(result, null, 2) + '\n');
  return result;
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
}

export { api, pin, releaseBindings, ACCOUNT, WORKER, PIN };
