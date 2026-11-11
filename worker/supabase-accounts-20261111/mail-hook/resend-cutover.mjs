import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
import { homedir } from 'node:os';

const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'espacios-mail';
const PRIOR_SHA = 'c66ca9f71caff612ce0889750b3dd2b0ff70a87049a2b51e47f3ef3ff1fe4afe';
const RESEND_SHA = '9cdab2bcb1b87e472283a71a0c78969337b99cb127883128839b59e262f8b95a';
const mode = process.argv[2];
if (!['apply', 'rollback'].includes(mode)) throw Error('Use apply or rollback');

const base = new URL('../build/', import.meta.url);
const config = await readFile(`${homedir()}/.wrangler/config/default.toml`, 'utf8');
const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw Error('Wrangler authorization is unavailable');
const root = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/workers/scripts/${WORKER}`;
const digest = code => createHash('sha256').update(code).digest('hex');

async function request(suffix, init = {}) {
  return fetch(root + suffix, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(120000),
  });
}

async function api(suffix, init = {}) {
  const response = await request(suffix, init);
  const result = await response.json();
  if (!response.ok || !result.success) throw Error(`Cloudflare ${response.status}: ${(result.errors || []).map(error => `${error.code} ${error.message}`).join('; ')}`);
  return result.result;
}

async function liveCode() {
  const response = await request('/content/v2');
  if (!response.ok) throw Error(`Could not read active Mail code (${response.status})`);
  const file = (await response.formData()).get('worker.js');
  if (!file) throw Error('Active Mail module is missing');
  return Buffer.from(await file.arrayBuffer());
}

async function putCode(code) {
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify({ main_module: 'worker.js' })], { type: 'application/json' }), 'metadata');
  form.append('worker.js', new Blob([code], { type: 'application/javascript+module' }), 'worker.js');
  await api('/content', { method: 'PUT', body: form });
}

const deployment = (await api('/deployments')).deployments[0];
const active = deployment.versions.filter(version => version.percentage === 100);
if (active.length !== 1 || deployment.versions.some(version => version.percentage !== 100 && version.percentage !== 0)) throw Error('Mail Worker has an active split deployment');
const before = await liveCode();
const beforeSha = digest(before);
const receiptFile = new URL('mail-resend-cutover.json', base);
const backupFile = new URL('mail-resend-prior.mjs.gz', base);

if (mode === 'apply') {
  if (beforeSha !== PRIOR_SHA) throw Error('Active Mail code changed before Resend cutover');
  const settings = await api('/settings');
  if (!settings.bindings?.some(binding => binding.name === 'CV_RESEND_API_KEY' && binding.type === 'secret_text')) throw Error('Communiverse send-only Resend key has not been configured');
  const next = await readFile(new URL('../build/espacios-mail-patched.mjs', import.meta.url));
  if (digest(next) !== RESEND_SHA) throw Error('Resend candidate code changed');
  await writeFile(backupFile, gzipSync(before), { mode: 0o600 });
  await putCode(next);
  if (digest(await liveCode()) !== RESEND_SHA) throw Error('Mail code verification failed after cutover');
  const after = (await api('/deployments')).deployments[0];
  const receipt = { priorVersion: active[0].version_id, priorDeployment: deployment.id, liveVersion: after.versions.find(version => version.percentage === 100)?.version_id, liveDeployment: after.id, priorSHA256: PRIOR_SHA, liveSHA256: RESEND_SHA };
  await writeFile(receiptFile, JSON.stringify(receipt, null, 2) + '\n', { mode: 0o600 });
  console.log(JSON.stringify({ mode, ...receipt }));
} else {
  if (beforeSha !== RESEND_SHA) throw Error('Active Mail code changed before Resend rollback');
  const receipt = JSON.parse(await readFile(receiptFile, 'utf8'));
  if (receipt.priorSHA256 !== PRIOR_SHA || receipt.liveSHA256 !== RESEND_SHA) throw Error('Rollback receipt does not match this release');
  const prior = gunzipSync(await readFile(backupFile));
  if (digest(prior) !== PRIOR_SHA) throw Error('Mail rollback code changed');
  await putCode(prior);
  if (digest(await liveCode()) !== PRIOR_SHA) throw Error('Mail code verification failed after rollback');
  const after = (await api('/deployments')).deployments[0];
  console.log(JSON.stringify({ mode, liveVersion: after.versions.find(version => version.percentage === 100)?.version_id, liveDeployment: after.id, liveSHA256: PRIOR_SHA }));
}
