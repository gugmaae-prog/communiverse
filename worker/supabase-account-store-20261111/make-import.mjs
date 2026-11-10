import fs from 'node:fs/promises';
import path from 'node:path';
import { tables } from './export-d1.mjs';

export function makeImport(source) {
  if (source.databaseId !== '6126080a-3d53-4043-baa5-3d2ebb4781bb') throw Error('Wrong D1 source');
  if (!Number.isFinite(Date.parse(source.capturedAt))) throw Error('Missing source capture time');
  const quote = value => `'${String(value).replaceAll("'", "''")}'`;
  const sql = ['begin;', "set local statement_timeout = '30s';"];
  for (const name of tables) {
    const rows = source.rows?.[name];
    if (!Array.isArray(rows)) throw Error(`Missing source table ${name}`);
    if (JSON.stringify(rows).includes('\\u0000')) throw Error(`NUL in ${name}`);
    sql.push(`do $$ begin if (select count(*) from communiverse.${name}) <> 0 then raise exception 'Target ${name} is not empty'; end if; end $$;`);
    if (rows.length) sql.push(`insert into communiverse.${name} select * from jsonb_populate_recordset(null::communiverse.${name}, ${quote(JSON.stringify(rows))}::jsonb);`);
    sql.push(`do $$ begin if (select count(*) from communiverse.${name}) <> ${rows.length} then raise exception 'Count mismatch for ${name}'; end if; end $$;`);
  }
  sql.push(`update communiverse.migration_reconciliation set source_captured_at=${quote(source.capturedAt)}::timestamptz, source_accounts=${source.rows.cv_accounts.length}, target_accounts=(select count(*) from communiverse.cv_accounts), source_members=${source.rows.cv_members.length}, target_members=(select count(*) from communiverse.cv_members), verified_at=now(), status='verified' where source_database='communiverse-waitlist';`);
  sql.push('commit;');
  return sql.join('\n');
}

async function main() {
  const dir = path.join(import.meta.dirname, 'build');
  const source = JSON.parse(await fs.readFile(path.join(dir, 'source-export.json'), 'utf8'));
  const file = path.join(dir, 'import.sql');
  await fs.writeFile(file, makeImport(source), { mode: 0o600 });
  console.log(JSON.stringify({ file, tables: tables.length, accounts: source.rows.cv_accounts.length, members: source.rows.cv_members.length }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
