# Communiverse production reconciliation

## Latest live artist and Plug update

Release `20261008-plug-artists-1a`; active Worker `communiverse-marketplace`; version `413ac851-8d29-4f00-8b14-0717de155364`; deployment `85fefe9a-a2c5-4d5b-8a3e-091eb99856ba`; 100% traffic. Presentation asset URLs remain `20261008-plug-artists-1`. The final revision only fixes biography wording and preserves those immutable asset bytes.

The active marketplace route delegates legacy content and media to `communiverse`. Its exact original marketplace bundle was retained, with five scoped presentation/media modules added. Ten supplied artist concepts join the existing 13 people; sample labels and craft-reference attribution remain explicit. Plug circles, video cards, social icons and mobile details are refined. The ten linked artist pages replace concept-work stills with craft films. The supplied glass clip is preserved byte-for-byte. No account, database, service binding, route, metrics or application changes.

Source: `worker/releases/plug-artists-20261008/`. Assemble using `scripts/prepare-plug-artists.mjs` against a verified current marketplace capture. Deployment and all ten live profile checks: `deployments/20261008-plug-artists-1a.json`. Existing retained-route/media checks: `deployments/20261008-plug-artists-retained-checks.json`. Never redeploy the older marketplace branch wholesale against the live system.


## Previous directory update

Release `20261007-plug-team-2`; Worker version `fb1e0cac-7c50-4a38-a8f3-18cc0b0effc6`; deployment `4d0fa6b2-a0fa-4294-b040-5d10dda62bd3`; 100% traffic. Ten Cool Kids and three ambassadors appear together under Communiverse. The highlighted Plug navigation link is relabelled Communiverse and group filters sit below the header. The 58 imported artists remain removed. Source: `worker/releases/plug-team-20261007/`; verification: `deployments/20261007-plug-team-2.json`. No database or account changes. The root `/communiverse/` currently returns the separate `X-Communiverse-Marketplace: 20261007-marketplace-2` page; its ownership and content were retained. The verifier checks that root as marketplace content rather than requiring this directory release header.


## Shared design baseline

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
