# Communiverse Search V4 — production release

**Date:** 10 October 2026  
**Status:** LIVE on https://espacios.me/communiverse/  
**Release Worker:** `communiverse-search-v4-20261010`  
**Version:** `62fe3f77-7dd3-4872-8416-02c6e1988a94`  
**Initial deployment ID:** `1876d69b-ced9-4ed2-9e4e-91e56f45fc86`

## Scope and behavior

This release unifies the public search presentation on the Homepage, Artists, Events, Communities, Discover, and Plug. It keeps native input/select values, original keyword and AI click handlers, underlying catalog records, source credits and existing filters. The 52px primary search field now includes a compact borderless 44px AI action rather than a nested outlined pill. Events keyword input precedes the location/type selectors on mobile and tablet. Suggestions have consistent bounds, stacking, and keyboard semantics.

Plug story cards no longer cap their collapsed height at 180px when their content is taller. This makes the "Read their story" CTA part of its card, rather than visibly hanging outside it. During story transitions, portrait circles directly crossing the CTA temporarily fade; normal circles remain and the temporarily hidden circles return on close or profile change. Regular production pages include NO QA scripts, test data or raw reports.

The Workspace and its task search remain unchanged. This is a public discovery-search UI improvement, **not** completion of internal workspace search or personalized AI recommendation work.

## Unchanged application runtimes and storage

- `communiverse-marketplace`: unchanged (original backend, catalog, identities, user content, account auth, APIs and R2/D1 operations)
- `communiverse-workspace-ux-v3-20261009`: unchanged (home V3 artwork view and workspace)
- `communiverse-booking-cards-20261010`: unchanged (Discover and artist booking)
- `communiverse-experience-v2-20261009`: unchanged (existing V2 assets and authorized assignment lookup)
- `communiverse-business-knowledge`: unchanged (AI knowledge and workspace assistant routes)
- Supabase identity and database schema: unchanged.

The V4 Worker has **only four service bindings**, named MARKETPLACE, HOME, BOOKING and V2. No database, KV, R2, Supabase, secret or token was added. All non-GET / non-HTML requests are passed unmodified through the original appropriate Worker. The V4 presentation gateway does NOT block POST, unlike the read-only staging gateway. No business logic, record, or credential mutation was performed as part of deployment.

## Production route manifest and rollback

### Four existing routes switched to V4 (restore these first on rollback)

| Existing route | Route ID | Restore previous script |
| --- | --- | --- |
| `espacios.me/communiverse/` | `48b06cf055ca4c2892a7cc753d881e2a` | `communiverse-workspace-ux-v3-20261009` |
| `www.espacios.me/communiverse/` | `1193a67a9f5c45a8aa0eff6061d04a43` | `communiverse-workspace-ux-v3-20261009` |
| `espacios.me/communiverse/discover/*` | `6ff77500dde446a59c069908d8c46662` | `communiverse-booking-cards-20261010` |
| `www.espacios.me/communiverse/discover/*` | `a8780184c41c4125bcf498fcaf52cd5c` | `communiverse-booking-cards-20261010` |

Each can be restored with `PUT /zones/{zone_id}/workers/routes/{route_id}` using its original pattern, id and previous script, without touching DNS or underlying Workers.

### Eight NEW scoped public page routes (delete these on rollback)

- `espacios.me/communiverse/artists/*` → `58e3f43386374b5a8fe86b3e0c48a78e`
- `espacios.me/communiverse/events/*` → `b73f2700eeaa4d768f9b5b77bfcbe139`
- `espacios.me/communiverse/communities/*` → `8801093732e6499faded00a9a1f81321`
- `espacios.me/communiverse/plug/*` → `c8879eabc514492a88abdaca21cf6099`
- `www.espacios.me/communiverse/artists/*` → `2333168b5b3e473b99486c9ce9304a1c`
- `www.espacios.me/communiverse/events/*` → `b06b1368f63f4a28a1252b873d19bc0c`
- `www.espacios.me/communiverse/communities/*` → `fd9754e5c6a74216b450d3413246c551`
- `www.espacios.me/communiverse/plug/*` → `d4c2af7da402461caf94261a42ac901d`

These match only those page families; nested non-target pages are passed through to the original runtime with no V4 injection.

### Six NEW V4 asset routes (remove LAST on rollback)

- `espacios.me/communiverse/__cvsearch_v4.js*` → `1c2129b36c7541dcb3376b2247fa9371`
- `espacios.me/communiverse/__cvsearch_v4.css*` → `7c1477a39034440f87c4da78a3e0682b`
- `espacios.me/communiverse/__cvsearch_v4_plug_fix.js*` → `3b63e5f5116a40e0a4c4779c8cc2a59c`
- `www.espacios.me/communiverse/__cvsearch_v4.js*` → `f312068448784948914170eac59571b2`
- `www.espacios.me/communiverse/__cvsearch_v4.css*` → `50d31e444e934ab1ae3d407d29c0be3d`
- `www.espacios.me/communiverse/__cvsearch_v4_plug_fix.js*` → `9484c81e45984b34849cb15683fa5ef9`

**Rollback order:** restore the four existing routes, remove the eight new public page routes, verify fallback public pages and existing Workspace, allow cached V4 pages to expire (asset max-age 120 sec), and only then delete the six asset routes. Do not touch the original marketplace catch-all, OAuth callback, business knowledge route, schema, secrets or media. Keep source and Worker version available for diagnostics.

## Testing performed

- Prior to release: **583 / 583** staging browser checks across Homepage, Artists, Events, Communities, Discover, Plug and five viewport widths (320/390/768/1024/1440). Checked field dimensions, button bounds, AI panel positioning, filters, selected state, keyboard/accessibility naming and horizontal overflow.
- Plug: **48 / 48** profile/story interaction states at six widths (320/390/768/1024/1280/1440), including opening/closing a story and switching between actual public artist profiles. Story CTA stayed inside the card; no visible portrait/CTA overlap in accepted final checks.
- Component fixture: **102 / 102** assertions across five widths, confirming original search input listeners, delayed AI button handler, region select, and responsive controls.
- Latest GitHub Actions Search V4 syntax/presentation-invariant workflow **passed** for both staging and production code.
- Production-specific V4 Worker tested on a workers.dev canary for the six public pages, Workspace passthrough, three UI assets, health route and preserved original AI endpoint, with no QA output.
- After routing: **12 / 12** primary live Homepage/Artists/Events/Communities/Discover/Plug smoke checks on desktop and mobile showed the V4 controls; no `null` page or raw QA output.
- Additional checks confirmed the equivalent www pages, query-string Events/Plug URLs, unchanged artist booking page, unchanged Workspace V3 UI, and unauthenticated private workspace/assignment API boundaries.

## Known limitations and follow-ups

- The real AI POST action and authenticated user/workspace workflows were not exercised end-to-end with a real signed-in user; this gateway preserves their original routes/handlers but should not be represented as a full authenticated certification.
- Direct shared Homepage URLs containing query strings can use the existing marketplace fallback because the exact homepage route does not cover every query-string variant. Do not add a broad `/communiverse/*` proxy for this without another staging and auth test.
- This is visual organization and Plug CTA layout, not a new recommendation algorithm.
- Keep Cloudflare error monitoring and use the route rollback above if a real account encounters a regression.


## 10 October 2026 — PR #18 Plug CTA spacing hotfix

**Status:** LIVE; exact Cloudflare Workers source matches the merged GitHub main stylesheet.

- User-reported issue: Plug profile actions "View profile" and "Read their story" were too close or overlapping on the live page.
- PR: [#18](https://github.com/gugmaae-prog/communiverse/pull/18), source branch `cursor/plug-button-gap-c1ee` (commit `a1579a008ab4eee1c91ca51997b1936dc0b73ca6`), merged by squash commit `872ab4807a567ed50d65157d12b5e751fc86c0eb`.
- Exactly one module changed: `search-css.txt`, synchronized from `worker/search-v4/search.css`. Source grew from 12,628 to **12,978 bytes**; the added selector applies `margin-top: 14px !important` to the Plug story action and adjacent profile/story controls. The other three Worker modules are byte-preserved.
- **Production Worker:** `communiverse-search-v4-20261010`. Previous version `62fe3f77-7dd3-4872-8416-02c6e1988a94`; new deployed version `a51eb441-e17e-42b3-9d89-befd50f0c9ee` at 100%.
- Exact Cloudflare production **route mappings and service bindings remain unchanged**. No changes to marketplace/backend Worker, booking Worker, V3 Workspace, AI knowledge, Supabase or D1/R2.
- Canary Worker `communiverse-pr18-gap-canary-20261010` deployed only for before-release testing, using all four existing runtime modules with only the CSS replacement.
- Canva/browser rendering canary checks at 390, 768, 1280px: the live 'View profile' action is followed by the 'Read their story' button with **14px computed spacing**, with no overlap, and the CTA remains inside the card without horizontal page overflow.
- Post-production browser rendering on the actual **espacios.me** Plug page at 390/768/1280 also measured **14px** spacing, a contained CTA and no horizontal overflow. Both apex and www public stylesheet URLs served the new selector. Homepage and Workspace remain available, and Cloudflare Observability reported **0 active issues** at verification.
- GitHub PR #18 syntax/invariant CI completed successfully, and Cloudflare's deployed source was compared with the merged `main` CSS exactly.

### Hotfix rollback

Restore the previous Worker version `62fe3f77-7dd3-4872-8416-02c6e1988a94` for **`communiverse-search-v4-20261010` only** using the Cloudflare Workers deployment version controls; do not change zone routes, original Marketplace/Workspace/booking Workers or any database. After rollback verify the public CSS URL and Plug story actions. Alternatively, reconstruct the previous Worker from its four existing modules and the 12,628-byte earlier CSS file, preserving all service bindings. Allow the current CSS cache max-age (120s) or purge only the exact CSS paths if the older/newer revision is still cached.
