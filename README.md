# Communiverse

Public site: https://espacios.me/communiverse/

## Production release — 7 October 2026

**Delegated Plug and people pages:** `20261007-shared-plug-ui-1` on the existing `communiverse` Worker. The main `/communiverse/` route is now served by the separate `communiverse-marketplace` Worker at release `20261007-marketplace-3`.

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

## Marketplace layer

The live marketplace deployment is recorded in [`deployments/20261007-marketplace-3.json`](deployments/20261007-marketplace-3.json).

The separate `communiverse-marketplace` Worker owns the marketplace landing page, artist previews, story and catalogue pages, the Join paths, and the application API at `/communiverse/api/applications`. It delegates Plug, ambassadors, the existing team, film media, and `/communiverse/api/waitlist` to the original `communiverse` Worker through the `LEGACY` service binding. The ambassador page's application link is rewritten to `/communiverse/apply/ambassador/` without replacing its people or stories.

Six generated artisan portraits and their profiles are labelled **fictional previews**. They represent craft categories from the supplied video inventory and are not portrayed as people in the existing films. Artist search and craft filters work on these previews. Real artist listings remain empty until approved and published. Workshops and works do not accept bookings or payments.

Join has separate artist, ambassador, client, and Belong flows. Ambassador questions cover the fourteen topics in the onboarding brief, split into four short steps. Belong's Google and LinkedIn links reuse the existing Espacios OAuth routes and verify the signed-in user's email with `/api/auth/me`; email application remains available. Applications are validated by the new Worker and stored through the existing D1-backed waitlist handler, including consent and a request reference. They are enquiries, not approved memberships, contracts, bookings, or public profiles.

No new Supabase project was created: its $10/month recurring cost was declined. The optional catalogue integration in `worker/marketplace/index.js` remains dormant until a dedicated project and publication process are approved. Internal RAL material remains outside public pages.

Build with `npm run build:marketplace`; test with `npm test`. `scripts/preview-marketplace.mjs` provides local read-only preview and blocks application submissions. Do not deploy the top-level Next.js app over either Worker.

## Development and retained history

The existing `app/`, `components/`, `data/`, `public/`, audit files and source branches are preserved. Development: `npm install`, then `npm run dev` at `/communiverse/`. The old readme is preserved verbatim at [`docs/legacy/README-before-production-reconciliation.md`](docs/legacy/README-before-production-reconciliation.md); its deployment directions are historical and superseded by this notice.

See [`PRODUCTION.md`](PRODUCTION.md) for the deployment boundary and outstanding source-recovery requirement.
