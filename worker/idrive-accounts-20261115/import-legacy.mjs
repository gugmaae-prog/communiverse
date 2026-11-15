import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
const run = promisify(execFile);
const base = new URL('./', import.meta.url);
const root = new URL('../../', base);
const snapshot = JSON.parse(await readFile(new URL('../supabase-account-store-20261111/build/source-export.json', base), 'utf8'));
const tables = ['cv_accounts', 'cv_members', 'cv_staff'];
const canonical = rows => JSON.stringify(rows.map(row => Object.fromEntries(Object.entries(row).sort(([a], [b]) => a.localeCompare(b)))).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))));
const digest = rows => createHash('sha256').update(canonical(rows)).digest('hex');
const live = {};
await Promise.all(tables.map(async table => {
  const { stdout } = await run('npx', ['wrangler', 'd1', 'execute', 'communiverse-waitlist', '--remote', '--config', 'worker/supabase-account-store-20261111/build/wrangler.jsonc', '--command', `select * from ${table}`, '--json'], { cwd: new URL('.', root), maxBuffer: 5_000_000, timeout: 120000 });
  const parsed = JSON.parse(stdout);
  if (parsed[0]?.success !== true || !Array.isArray(parsed[0]?.results)) throw Error(`${table}: D1 read failed`);
  live[table] = parsed[0].results;
}));
for (const table of tables) {
  const match = digest(snapshot.rows[table]) === digest(live[table]);
  console.log(`${table}: snapshot=${snapshot.rows[table].length}, live=${live[table].length}, exact_match=${match}`);
  if (!match) throw Error(`${table}: live data changed; review before import`);
}
if (process.argv[2] !== '--apply') process.exit(0);
const stage = JSON.parse(await readFile(new URL('build/stage-result.json', base), 'utf8'));
if (stage.version !== '212c1b07-2df1-4aee-89f1-5f771a4d0b57') throw Error('Account service version changed');
const token = (await readFile(new URL('build/bridge-token', base), 'utf8')).trim();
const members = new Map(live.cv_members.map(row => [row.id, row]));
const staff = new Map(live.cv_staff.map(row => [row.id, row]));
const accountNames = new Set(live.cv_accounts.map(row => row.username.toLowerCase()));
const records = live.cv_accounts.map(row => {
  const member = members.get(row.member_id);
  if (!member) throw Error('Account has no member row');
  return { username: row.username, member_id: row.member_id, staff_id: row.staff_id || null, first_name: member.first_name, email: member.email, phone: member.phone, city: member.city, craft: member.craft, status: member.status, created_at: row.created_at, password: { hash: row.password_hash, salt: row.salt, iterations: row.iterations } };
});
for (const row of live.cv_staff) {
  if (accountNames.has(row.username.toLowerCase())) {
    const account = records.find(item => item.username.toLowerCase() === row.username.toLowerCase());
    if (account?.staff_id !== row.id || account.password.hash !== row.password_hash || account.password.salt !== row.salt) throw Error('Linked staff credentials differ');
    continue;
  }
  records.push({ username: row.username, member_id: null, staff_id: row.id, first_name: row.name.split(' ')[0], email: '', phone: '', city: row.region || '', craft: row.title || '', status: row.status, created_at: snapshot.capturedAt, password: { hash: row.password_hash, salt: row.salt, iterations: row.iterations } });
}
let imported = 0, alreadyPresent = 0;
for (const record of records) {
  const r = await fetch(`${stage.url}/cv-auth/import`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(record), signal: AbortSignal.timeout(20000) });
  const result = await r.json();
  if (r.status !== 200) throw Error(`Legacy import stopped at item ${imported + alreadyPresent + 1}: HTTP ${r.status}, ${result.error}`);
  if (result.imported) imported++; else alreadyPresent++;
}
console.log(`Legacy identities: imported=${imported}, already_present=${alreadyPresent}, total=${records.length}`);
