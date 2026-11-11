import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const accountId = 'b1b843ec85bc39a3a4d370ba4f84f17a';
const databaseId = '6126080a-3d53-4043-baa5-3d2ebb4781bb';
export const tables = [
  'cv_members', 'cv_staff', 'cv_accounts', 'cv_account_sessions',
  'cv_google_identities', 'cv_google_flows', 'cv_google_pending',
  'cv_identity_profiles', 'cv_login_links', 'cv_member_preferences',
  'cv_profile_details', 'cv_identity_contacts', 'cv_profile_connections',
  'cv_profile_link_flows', 'cv_welcome_progress', 'cv_sessions',
  'cv_staff_sessions', 'cv_artist_accounts', 'cv_profile_rate_limits',
  'cv_join_limits',
];

async function token() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  const config = await fs.readFile(path.join(os.homedir(), '.config/.wrangler/config/default.toml'), 'utf8');
  const value = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
  if (!value) throw Error('Wrangler authorization unavailable');
  return value;
}

async function query(sql, authorization) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${authorization}`, 'content-type': 'application/json' },
    body: JSON.stringify({ sql }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await response.json();
  if (!response.ok || !data.success || !data.result?.[0]?.success) {
    const code = data.errors?.[0]?.code || data.result?.[0]?.error || response.status;
    throw Error(`D1 query failed (${code}); export stopped without changing the source`);
  }
  return data.result[0].results;
}

async function main() {
  const authorization = await token();
  const rows = {};
  for (const name of tables) {
    rows[name] = await query(`SELECT * FROM ${name}`, authorization);
    if (!Array.isArray(rows[name])) throw Error(`Invalid D1 result for ${name}`);
  }
  const result = { databaseId, capturedAt: new Date().toISOString(), rows };
  const bytes = JSON.stringify(result);
  const dir = path.join(import.meta.dirname, 'build');
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const file = path.join(dir, 'source-export.json');
  await fs.writeFile(file, bytes, { mode: 0o600 });
  console.log(JSON.stringify({ source: databaseId, capturedAt: result.capturedAt,
    counts: Object.fromEntries(tables.map(name => [name, rows[name].length])),
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'), file }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
