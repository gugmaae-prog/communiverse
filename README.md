# Communiverse

Public site: https://espacios.me/communiverse/

Latest directory update: `20261007-plug-team-2` shows all ten Cool Kids and three ambassadors under Communiverse. Imported artist entries remain removed. The highlighted Plug navigation link is relabelled Communiverse, and group filters are visible below the shared header. [Release evidence](deployments/20261007-plug-team-2.json).

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

The broader marketplace, paid bookings, kit entitlements, applications and film-chapter product plan is not activated by this typography/header release. Sample content must remain labelled; internal RAL material remains outside public pages. Conflicting draft branches have not been blindly merged.

## Development and retained history

The existing `app/`, `components/`, `data/`, `public/`, audit files and source branches are preserved. Development: `npm install`, then `npm run dev` at `/communiverse/`. The old readme is preserved verbatim at [`docs/legacy/README-before-production-reconciliation.md`](docs/legacy/README-before-production-reconciliation.md); its deployment directions are historical and superseded by this notice.

See [`PRODUCTION.md`](PRODUCTION.md) for the deployment boundary and outstanding source-recovery requirement.

Latest people curation source: `worker/releases/plug-team-20261007/` restores ten Cool Kids and three ambassadors in the Communiverse directory while retaining removal of imported artist entries.
