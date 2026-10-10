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
