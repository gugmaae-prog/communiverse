# Communiverse

## Booking artist picker correction — 10 October 2026 (latest)

**Live:** [Discover](https://espacios.me/communiverse/discover/) and the [artist booking view](https://espacios.me/communiverse/artist/) use a narrowly scoped CSS fix from `communiverse-booking-cards-20261010`.

The legacy gallery rule `.cv-pick { width:65px }` was shrinking the group-session artist cards into tall narrow columns. The correction is limited to `#cv-group-form #cv-group-artists`: full-width responsive cards, proportional portraits, readable copy, preserved radio inputs and a visible selected state.

- Four specific Cloudflare routes; no broad `/communiverse/*` proxy. The original marketplace, V3 home/workspace UI, session requests, Supabase, D1, R2 and AI remain unchanged.
- Validation: 42/42 staged browser checks against real public artist data, live public route smoke tests and CI passing.
- [Code PR #15](https://github.com/gugmaae-prog/communiverse/pull/15); [deployment/rollback record](deployments/20261010-booking-artist-cards.md).
- No live booking submission or authenticated booking completion test was performed.

---

## Latest scoped release — Communiverse UX V3 (9 October 2026)

**LIVE:** [Communiverse](https://espacios.me/communiverse/) and [Workspace](https://espacios.me/communiverse/workspace/) use `communiverse-workspace-ux-v3-20261009` for the four exact homepage/workspace routes. The original `communiverse-marketplace` backend and the existing V2 JS/CSS, D1, R2, identity, OAuth callback and business-knowledge endpoints remain unchanged. The V3 Worker loads the two existing V2 presentation assets before the new V3 CSS/JS.

- Artwork: structurally reflows source/credits/tags below the proportional hero; expanded card uses full gallery width with native recommendation navigation.
- Workspace: source-grounded Focus panel, native task buttons, avatar-circle owner/collaborator selection, request type tiles and read-only reviewer timeline. Underlying forms and policy-enforced write endpoints are preserved; no autonomous AI actions.
- Exact routes, CI evidence and rollback: [deployments/20261009-communiverse-ux-v3.md](deployments/20261009-communiverse-ux-v3.md).
- Implementation: [worker/experience-v3](worker/experience-v3) and [PR #14](https://github.com/gugmaae-prog/communiverse/pull/14).
- **QA boundary:** public artwork E2E and simulated workspace tests passed; a real authenticated production session, approval mutation, R2 upload, OAuth renewal and the previously reported signed-in `null` issue remain unverified. The deeper Connect/AI workflow roadmap is not complete.
- The historical **V2 release and rollback notes below** are retained for context and must not be treated as the current page routing state.

---

## Current production status — 9 October 2026 (latest)

**LIVE:** [espacios.me/communiverse/](https://espacios.me/communiverse/) and [workspace](https://espacios.me/communiverse/workspace/) now use **`communiverse-experience-v2-20261009`** through ten **exact** Cloudflare routes (homepage, workspace, two versioned UI assets and the authorization-checked artist-assignment endpoint for apex and www).

- The underlying `communiverse-marketplace` Worker and its sessions, OAuth callback, ordinary APIs, R2 media and D1 data remain unchanged.
- The earlier broad gateway `communiverse-experience-20261009` was rolled back; it must **not** be reenabled. The notes headed "Release correction" and "Production update" below are historical.
- Corrected implementation source is in [worker/experience-v2/](worker/experience-v2/); exact release versions, route IDs, rollback and checks are recorded in [deployments/20261009-experience-v2-production.md](deployments/20261009-experience-v2-production.md).
- Source work was merged in [PR #12](https://github.com/gugmaae-prog/communiverse/pull/12). GitHub CI and signed-out real-page checks passed; simulated workspace interaction tests passed.
- **Outstanding:** the original user's signed-in `null` screen, account-specific tasks, OAuth and real file uploads were not validated with an authenticated session. Do not claim these are fully certified. Roll back the exact ten v2 routes if signed-in failures recur.

---

## Release correction — 9 October 2026 (later update)

The 9 October presentation gateway noted below was **rolled back** following reports of a signed-in `null` screen and broken UI interactions. Cloudflare production routes now serve the original `communiverse-marketplace` Worker directly. The gateway `communiverse-experience-20261009` is **not** attached to the live zone. Previous release notes further down describe the earlier deployment historically, not the present live configuration.

A safer correction is under review in [draft PR #12](https://github.com/gugmaae-prog/communiverse/pull/12); real public and simulated workspace browser checks passed, but authenticated production QA is outstanding. Do **not** redeploy, merge or re-enable the retired gateway just because its original release record says LIVE. No application or database mutations are part of this documentation correction.

---

## Production update — 9 October 2026

**Live:** https://espacios.me/communiverse/ — the active presentation and source-grounded knowledge gateway is **communiverse-experience-20261009**. It delegates to the unchanged **communiverse-marketplace** Worker, preserving all existing accounts, D1/R2 data, media and application APIs. Cloudflare route exceptions keep most API and media requests on the original Worker.

The gateway's exact editable source is in [worker/experience/](worker/experience/); tested knowledge projections are in [worker/knowledge/](worker/knowledge/), and deployment/rollback details are in [deployments/20261009-experience-overlay.md](deployments/20261009-experience-overlay.md). Public pages and assets have been checked after deployment. Authenticated cross-role interaction and file-upload QA remain pending.

**Important:** The 9 October gateway is an additive layer; this repository still does **not** contain all underlying marketplace Worker modules. Do not blindly run the legacy root Wrangler deployment.

---

Public site: https://espacios.me/communiverse/

## Production release — 7 October 2026

**Live:** `20261007-shared-plug-ui-1` on the existing `communiverse` Worker.

- Worker version: `4a09f1da-b076-43e5-9663-c93dc1a188bd`
- Deployment: `81b6d569-6434-4c57-8388-cc80d5829e5b`
- Traffic: 100%, promoted using the Cloudflare connector after staged 390px/1440px checks.
- Scope: Plug's system-sans typography, light/dark palette and a single consistent header across the existing Communiverse pages and local person profiles.
- Preserved: source copy, 25-card gallery, media, public Plug profiles, D1 waitlist, optional Subject and both rate limiters. No database/account mutations.

The complete editable source of this approved design change is in [`worker/releases/shared-plug-ui-20261007/`](worker/releases/shared-plug-ui-20261007/). Runtime references and verification are in [`deployments/20261007-shared-plug-ui-1.json`](deployments/20261007-shared-plug-ui-1.json). Run `node scripts/verify-live-release.mjs` to compare the published CSS/JS checksums and check all listed public routes.

## Important: the repository is not yet a complete production rebuild

The top-level Next.js app is retained legacy source, not the entire live 125-module Worker. Do not run a blind `npx wrangler deploy`: it would replace retained production functionality and bindings. The old workflow is archived in `docs/legacy/deploy.yml.example`; the active workflow now verifies instead of blindly deploying. A pre-build guard blocks accidental legacy Wrangler deployment.

A read-only exact-module capture workflow and `scripts/snapshot-production.py` are included, but its first run failed because this repository's Actions environment has **no `CLOUDFLARE_API_TOKEN` secret**. `CLOUDFLARE_ACCOUNT_ID` is present. The Cloudflare chat connector is independently authorized and was able to promote the release. No credentials or database records have been exported.

After the repository secret is configured, run **Sync exact Communiverse production source** against `main`. The pinned capture records all 125 Worker modules, including 55 binary modules, with SHA-256 verification. Until that run succeeds, `production/modules/` must not be described as complete. The separate Cloudflare ASSETS collection is retained by version uploads using `keep_assets:true`; the content API does not export that collection.

## Scope still in planning

The broader marketplace, paid bookings, kit entitlements, applications and film-chapter product plan is not activated by this typography/header release. Sample content must remain labelled; internal RAL material remains outside public pages. Conflicting draft branches have not been blindly merged.

## Development and retained history

The existing `app/`, `components/`, `data/`, `public/`, audit files and source branches are preserved. Development: `npm install`, then `npm run dev` at `/communiverse/`. The old readme is preserved verbatim at [`docs/legacy/README-before-production-reconciliation.md`](docs/legacy/README-before-production-reconciliation.md); its deployment directions are historical and superseded by this notice.

See [`PRODUCTION.md`](PRODUCTION.md) for the deployment boundary and outstanding source-recovery requirement.
