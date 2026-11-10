# Communiverse account store: Supabase landing phase

The existing Cloudflare Worker already binds the `entity` Supabase project (`ypkfganbwdvcjrcxygta`). The site still authenticates and stores member/workspace records in D1. Its account-wide D1 storage cap currently rejects writes, and its daily row-read cap temporarily prevents fresh account export. IDrive E2 serves public portraits; it remains media storage, not the account database.

Migrations `001_private_account_schema.sql` and `002_session_and_assignment_schema.sql` create a **private** `communiverse` Postgres schema in the already-connected Supabase project. They mirror 20 identity, session, profile, artist assignment, and rate-limit tables from D1 and record reconciliation. All 21 tables have RLS enabled, `anon` and `authenticated` have no schema or table grants, and only `service_role` has table grants. There is no browser API for these records and no Supabase Auth user has been created or linked.

## Completed data landing

At 2026-11-10T23:29:36Z, a fresh Cloudflare D1 SQL export of the 20 named tables was downloaded to ignored local `build/` and converted to JSON. The transactional import completed in Supabase. Source and destination counts match for all 20 tables; account, member, and staff records match by ordered digest, including their password-hash fields. The source held 8 accounts, 11 members, 13 staff, and 11 unexpired account sessions. The import did not edit D1. Verification details without personal data are in `verification.json`.

The Cloudflare Worker and site routing have not changed. The normal public home and Circles pages return 200; sign-in, join, and workspace still return 503. Supabase now holds a private copy of the account data, but the Worker has no Supabase account backend yet.

## Remaining cutover work

The source and destination are reconciled, but live account routing still needs a complete backend release:

1. Build a server-only account service against the private schema, preserving PBKDF2-SHA256 legacy password verification and existing session semantics. The current Worker expects D1 for workspace/profile queries, so these must move together before publishing sign-in.
2. Migrate the remaining community/workspace data or retain a verified read path where appropriate. The bundled Worker references 35 `cv_*` tables; 20 are in this account landing schema. Its remaining posts, circles, follows, hearts, catalogue, and events operations still use D1.
3. Stage the Worker at 0%, exercise existing and new member accounts, password recovery, logout, profile writes, OAuth callback behavior, private media, and mobile flows. Only then route normal traffic and recheck public sign-in.

Do not enable the old `CV_ACCOUNT_CUTOVER_READY` flag by itself. Its account routes still write to D1. Do not copy the `service_role` key into the browser or commit the source export or import SQL.

For repeatable future exports, `export-d1.mjs` uses the D1 query API once its daily read allowance is available. This release used Wrangler's snapshot export API while ordinary queries were capped; the local SQL and generated import remain ignored and mode 0600.
