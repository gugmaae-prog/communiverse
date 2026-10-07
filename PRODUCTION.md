# Communiverse production source

This repository retains the existing Next.js source and now records the actual Cloudflare runtime separately.

## Approved release

- Design release: `20261007-shared-plug-ui-1`.
- Candidate Worker version: `4a09f1da-b076-43e5-9663-c93dc1a188bd`.
- Previous 100% production version: `428c7e34-252c-4ef7-97c4-62ce49cd11ab`.
- Scope: Plug's system-sans typography, palette and one responsive header across existing Communiverse pages and local people profiles. Existing content, 25-card gallery, media, Plug data and waitlist handlers remain unchanged.
- The broader marketplace/booking/kit roadmap is not implemented by this design release. Do not describe illustrative or planned transactions as live.

## Source authority

`production/modules/` and `production/manifest.json` are the exact deployed Worker module set after the snapshot workflow succeeds. The manifest verifies every module using SHA-256 and records binding configuration without credential values. Editable shared design files also live in `worker/releases/shared-plug-ui-20261007/`.

The existing top-level `app/`, `components/`, `public/` and `worker/` source remains retained for development and reconciliation. It must not overwrite the live layered Worker through the legacy Wrangler entrypoint. Open branches are not automatically approved release candidates, and their conflicting design directions have not been blindly merged.

## Safe deployment boundary

Use version uploads through the Cloudflare connector/API, with all manifest modules, `keep_assets: true`, the same ASSETS/D1/rate-limit bindings, and the same runtime/observability settings. Verify an isolated candidate before promotion and check the expected current version before changing traffic. Keep old modules and immutable media endpoints available for rollback.

The separate Cloudflare ASSETS collection is retained, not exported by `/content/v2`. This snapshot is therefore complete for Worker modules (including embedded images/videos), not an independent full-account disaster recovery backup. No D1/Supabase records or secret values are stored in this public repository.

## Verification

Run `python3 scripts/snapshot-production.py verify` with Node 22. This verifies manifest hashes, JavaScript syntax and exact equality with the approved shared-design sources. Browser verification and the final live version are recorded in the release ledger after promotion.
