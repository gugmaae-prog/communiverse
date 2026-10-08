# Communiverse

Public site: https://espacios.me/communiverse/

Current release: `20261008-social-5b` — Google sign-in with card onboarding, optimized Cloudflare images, internal galleries and profiles, calendar-based Events, and refined responsive Plug motion. [Release evidence](deployments/20261008-social-5b.json) · [Source and research](worker/releases/social-20261008/README.md).

Previous mobile Plug update: `20261008-plug-orbits-1` uses smaller animated video and detail surfaces around the orb, replacing the fixed bottom tray. [Release evidence](deployments/20261008-plug-orbits-1.json).

Previous navigation update: `20261008-simple-nav-1` replaces the remaining legacy header with Discover, Artists, Workshops and Plug. All four tabs stay visible on mobile. [Release evidence](deployments/20261008-simple-nav-1.json).

Previous gallery update: `20261008-plug-gallery-1a` adds standalone named gallery links, workshop/group-session requests, store enquiries and restored mobile orb animation with smaller separate cards. All 23 people, three ambassadors and ten Cool Kids remain. Artist galleries follow the shared theme with inline CSS under their unchanged security policy. [Release evidence](deployments/20261008-plug-gallery-1a.json).

## Production release — 7 October 2026

**Shared design baseline:** `20261007-shared-plug-ui-1` on the existing `communiverse` Worker.

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

Marketplace browsing, member signup and date/order enquiries are live. Paid bookings, inventory/checkout and kit entitlements remain in planning. Generated concepts are disclosed at collection level; internal RAL material remains outside public pages. Conflicting draft branches have not been blindly merged.

## Development and retained history

The existing `app/`, `components/`, `data/`, `public/`, audit files and source branches are preserved. Development: `npm install`, then `npm run dev` at `/communiverse/`. The old readme is preserved verbatim at [`docs/legacy/README-before-production-reconciliation.md`](docs/legacy/README-before-production-reconciliation.md); its deployment directions are historical and superseded by this notice.

See [`PRODUCTION.md`](PRODUCTION.md) for the deployment boundary and outstanding source-recovery requirement.

Latest people presentation source: `worker/releases/plug-artists-20261008/` wraps the active marketplace Worker and preserves its compact header, public records, applications and database bindings.

Latest Plug presentation refinement: `20261008-plug-refine-3`. See `PRODUCTION.md` and `worker/releases/plug-refine-20261008/README.md` for source, live verification and the retained-runtime assembly boundary.
