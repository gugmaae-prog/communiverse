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
  const r = await fetch('https://api.cloudflare.com/client/v4' + path, {
    ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers }, signal: AbortSignal.timeout(120000),
  });
  const value = await r.json();
  if (!r.ok || !value.success) throw Error(`Cloudflare ${r.status}: ${(value.errors || []).map(e => `${e.code} ${e.message}`).join('; ')}`);
  return value.result;
}
async function currentRouter() {
  const result = await api(`/accounts/${ACCOUNT}/workers/scripts/${WORKER}/deployments`);
  const current = result.deployments?.[0] || result[0];
  if (current.versions.length !== 1 || current.versions[0].version_id !== PIN || current.versions[0].percentage !== 100) throw Error('Router deployment changed; review before staging');
  return current.id;
}
async function main() {
  const stage = process.argv[2] === '--stage';
  if (process.argv.length > (stage ? 3 : 2)) throw Error('Use --stage or no argument');
  const deployment = await currentRouter();
  const source = await readFile(new URL('service.mjs', base));
  const summary = { worker: WORKER, activeVersion: PIN, deployment, sourceSHA256: createHash('sha256').update(source).digest('hex'), staged: false };
  if (!stage) return summary;
  // Preserve the encryption root across code-only versions. Rotating it here would orphan every account.
  const existing = await Promise.allSettled([
    readFile(new URL('build/bridge-token', base), 'utf8'),
    readFile(new URL('build/vault-root', base), 'utf8'),
  ]);
  const present = existing.map(item => item.status === 'fulfilled');
  if (present[0] !== present[1]) throw Error('Only one private account secret file exists; refusing to rotate the encryption root');
  if (!present[0] && existing.some(item => item.reason?.code !== 'ENOENT')) throw Error('Private account secret files cannot be read');
  const token = present[0] ? existing[0].value.trim() : randomBytes(48).toString('hex');
  const root = present[1] ? existing[1].value.trim() : randomBytes(32).toString('hex');
  if (!/^[a-f0-9]{96}$/.test(token) || !/^[a-f0-9]{64}$/.test(root)) throw Error('Existing private account secret files are invalid');
  const body = {
    main_module: 'service.mjs', compatibility_date: new Date().toISOString().slice(0, 10),
    bindings: [
      { type: 'inherit', name: 'E2F_KEY', version_id: PIN },
      { type: 'inherit', name: 'E2F_SECRET', version_id: PIN },
      { type: 'secret_text', name: 'CV_AUTH_TOKEN', text: token },
      { type: 'secret_text', name: 'CV_AUTH_ROOT', text: root },
    ],
    modules: [{ name: 'service.mjs', content_type: 'application/javascript+module', content_base64: source.toString('base64') }],
    annotations: { 'workers/tag': 'communiverse-idrive-accounts-20261115', 'workers/message': 'Private account candidate; no shared router traffic' },
  };
  const created = await api(`/accounts/${ACCOUNT}/workers/workers/${WORKER}/versions`, { method: 'POST', body: JSON.stringify(body) });
  if (!/^[0-9a-f-]{36}$/.test(created.id || '')) throw Error('No candidate version reported');
  if (await currentRouter() !== deployment) throw Error('Router changed during staging');
  await mkdir(new URL('build/', base), { recursive: true });
  await writeFile(new URL('build/bridge-token', base), token, { mode: 0o600 });
  await writeFile(new URL('build/vault-root', base), root, { mode: 0o600 });
  await chmod(new URL('build/bridge-token', base), 0o600);
  await chmod(new URL('build/vault-root', base), 0o600);
  const receipt = { ...summary, staged: true, version: created.id, url: created.urls?.[0] || null, startupTimeMs: created.startup_time_ms };
  await writeFile(new URL('build/stage-result.json', base), JSON.stringify(receipt, null, 2) + '\n');
  return receipt;
}
main().then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exitCode = 1; });
