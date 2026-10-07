# Communiverse production reconciliation

## Live approved update

Release `20261007-shared-plug-ui-1`; Worker version `4a09f1da-b076-43e5-9663-c93dc1a188bd`; deployment `81b6d569-6434-4c57-8388-cc80d5829e5b`; 100% traffic. Previous production version: `428c7e34-252c-4ef7-97c4-62ce49cd11ab`.

The editable entrypoint, stylesheet and header script are recorded in `worker/releases/shared-plug-ui-20261007/`. The entrypoint delegates to the retained production Worker. It does not rewrite gallery logic, public profile records or the D1 API. Source-scoped record: `deployments/20261007-shared-plug-ui-1.json`.

## Actual source coverage

The new design source is committed. The complete 125-module runtime snapshot is **not yet captured**. Its read-only Actions job was executed and failed because `CLOUDFLARE_API_TOKEN` is absent in this repository. Do not infer that a connected ChatGPT Cloudflare tool grants GitHub Actions an API token.

`Sync exact Communiverse production source` can be run manually on `main` after the secret is added. Its pinned request targets the now-live version; it aborts if traffic/latest-uploaded version changes, verifies the three approved source files, scans for credentials, and would commit 125 exact modules (55 binary) plus a hash/config manifest. It performs only Cloudflare GET requests, no database queries and no deployments. Exported binding metadata excludes credential values.

The separate static ASSETS collection is not included in `/content/v2`; it remains remote. A module snapshot using `keep_assets:true` is not an independent full-account disaster-recovery backup. Existing repository `public/` remains retained.

## Safe deployment

Until production source reconciliation succeeds, use the Cloudflare connector/API to upload scoped versions around the exact retained runtime, retain ASSETS/D1/rate-limit bindings and runtime settings, test a zero-traffic candidate, then promote after checking the current version. Do not run the legacy app's Wrangler configuration against production. The new active workflow verifies live source hashes; it does not deploy automatically. The former workflow is retained as a non-executable example under `docs/legacy/`.

Rollback changes Worker traffic only. It does not undo database state; this particular release made no database changes. Previous immutable code/media URLs remain available.

## Validation scope

Staged 390x844 and 1440x1000: shared system font, one header, menu expansion and Escape, unobscured headline, 25-card movement, correct gallery viewer, scroll restoration and no observed hydration errors. All ten public page routes and one local person profile returned 200 with the design release. Internal and RAL routes remained 404. Production is checked again by the live verification workflow and browser tests.

The broader marketplace/session/kit entitlement plan remains separate. This release does not claim real orders, bookings or payments. No Supabase schema/record changes, D1 writes, public identity substitutions or internal RAL publication occurred.
