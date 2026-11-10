import { readFile, mkdir, writeFile, chmod } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ACCOUNT = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const WORKER = 'espacios-ai-router';
const PIN = 'ba0e47e8-5153-4ca5-8d13-46677e68861c';
const base = new URL('./', import.meta.url);

async function api(path, init = {}) {
  const config = await readFile(join(homedir(), '.wrangler/config/default.toml'), 'utf8');
  const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
  if (!token) throw Error('Wrangler authorization is unavailable');
  const request = await fetch('https://api.cloudflare.com/client/v4' + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(120000),
  });
  const result = await request.json();
  if (!request.ok || !result.success) throw Error(`Cloudflare ${request.status}: ${(result.errors || []).map(e => `${e.code} ${e.message}`).join('; ')}`);
  return result.result;
}

async function currentRouter() {
  const result = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/deployments`);
  const current = result.deployments?.[0] || result[0];
  if (current.versions.length !== 1 || current.versions[0].version_id !== PIN || current.versions[0].percentage !== 100) {
    throw Error('Router deployment changed; review before staging');
  }
  return current.id;
}

async function main() {
  const execute = process.argv.slice(2).join(' ') === '--stage';
  if (process.argv.length > 2 && !execute) throw Error('Use --stage to upload an inactive version');
  const deployment = await currentRouter();
  const source = await readFile(new URL('gateway.mjs', base));
  const digest = createHash('sha256').update(source).digest('hex');
  const summary = { worker: WORKER, sourceVersion: PIN, deployment, sourceSHA256: digest, staged: false };
  if (!execute) return summary;
  const secret = randomBytes(48).toString('hex');
  const body = {
    main_module: 'gateway.mjs',
    compatibility_date: new Date().toISOString().slice(0, 10),
    bindings: [
      { type: 'inherit', name: 'E2F_KEY', version_id: PIN },
      { type: 'inherit', name: 'E2F_SECRET', version_id: PIN },
      { type: 'secret_text', name: 'CV_E2_UPLOAD_TOKEN', text: secret },
    ],
    modules: [{ name: 'gateway.mjs', content_type: 'application/javascript+module', content_base64: source.toString('base64') }],
    annotations: { 'workers/tag': 'communiverse-idrive-public-media-20261111', 'workers/message': 'Scoped IDrive media gateway candidate; no router traffic' },
  };
  const created = await api(`/accounts/${ACCOUNT}/workers/workers/${WORKER}/versions`, { method: 'POST', body: JSON.stringify(body) });
  if (!/^[0-9a-f-]{36}$/.test(created.id || '')) throw Error('Cloudflare did not report the staged version');
  if (await currentRouter() !== deployment) throw Error('Router changed during staging');
  await mkdir(new URL('build/', base), { recursive: true });
  await writeFile(new URL('build/upload-token', base), secret, { mode: 0o600 });
  await chmod(new URL('build/upload-token', base), 0o600);
  const receipt = { ...summary, staged: true, version: created.id, url: created.urls?.[0] || null, startupTimeMs: created.startup_time_ms };
  await writeFile(new URL('build/stage-result.json', base), JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}

main().then(value => console.log(JSON.stringify(value, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
