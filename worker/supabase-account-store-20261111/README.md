# Communiverse account store: Supabase landing phase

The existing Cloudflare Worker already binds the `entity` Supabase project (`ypkfganbwdvcjrcxygta`). The site still authenticates and stores member/workspace records in D1. Its account-wide D1 storage cap currently rejects writes, and its daily row-read cap temporarily prevents fresh account export. IDrive E2 serves public portraits; it remains media storage, not the account database.

Migrations `001_private_account_schema.sql` and `002_session_and_assignment_schema.sql` create a **private** `communiverse` Postgres schema in the already-connected Supabase project. They mirror 20 identity, session, profile, artist assignment, and rate-limit tables from D1 and record reconciliation. All 21 tables have RLS enabled, `anon` and `authenticated` have no schema or table grants, and only `service_role` has table grants. There is no browser API for these records and no Supabase Auth user has been created or linked.

The source and destination must be reconciled before any live account routing changes:

1. Run `node export-d1.mjs` after D1 reads resume. It reads only the 20 named account and related tables and writes a mode-0600 export under ignored `build/`. It does not change D1.
2. Inspect the count summary and source SHA-256. Run `node make-import.mjs` to generate a transactional Postgres import under ignored `build/`.
3. Apply that import through the connected Supabase tool, then compare every table count and representative account/profile links. The SQL asserts an empty target and rolls back on any mismatch.
4. Build a server-only account service against the private schema, preserving PBKDF2-SHA256 legacy password verification and existing session semantics. The current Worker expects D1 for workspace/profile queries, so this needs a complete routed backend before publishing sign-in.
5. Stage the Worker at 0%, exercise existing and new member accounts, password recovery, logout, profile writes, OAuth callback behavior, private media, and mobile flows. Only then route normal traffic and recheck public sign-in.

Do not enable the old `CV_ACCOUNT_CUTOVER_READY` flag by itself. Its account routes still write to D1. Do not copy the `service_role` key into the browser or commit the source export or import SQL.
