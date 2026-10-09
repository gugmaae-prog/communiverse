# Communiverse correction release — 9 October 2026

**Status:** LIVE, scoped exact-route deployment. The user explicitly requested deployment after the rollback and staging tests.

## Runtime
- New additive presentation Worker: `communiverse-experience-v2-20261009`
- Version: `2fe12460-dc7d-4015-8528-f14ddbb38853`
- Deployment: `fe4f4576-899a-4db6-bda9-d52da2b0e87e`
- Original application: `communiverse-marketplace` remains unchanged at `4a659bea-6915-4093-a7e7-8ab9c85ccfb4`
- D1: existing database `6126080a-3d53-4043-baa5-3d2ebb4781bb` is connected read-only for the artist-assignment knowledge endpoint.
- Server-to-server: `MARKETPLACE` is a Cloudflare service binding. All original application requests, cookies, uploads, media, authentication and database writes are preserved.
- Unlike the failed earlier experience overlay, **no broad `/communiverse/*` gateway route was added**.

## Exact Cloudflare Worker routes added

| Pattern | Cloudflare route ID |
|---|---|
| `espacios.me/communiverse/` | `48b06cf055ca4c2892a7cc753d881e2a` |
| `espacios.me/communiverse/workspace/` | `2791016f8630415f9ce399e1c992b523` |
| `espacios.me/communiverse/__cvfix_v2.js*` | `86ba35d426c14be3a49112bae6b58dce` |
| `espacios.me/communiverse/__cvfix_v2.css*` | `f59c5930c8de4aeab8c728d023de0673` |
| `espacios.me/communiverse/api/knowledge/artist-assignments*` | `f7d506d00f354b969b96b631cff64d26` |
| `www.espacios.me/communiverse/` | `1193a67a9f5c45a8aa0eff6061d04a43` |
| `www.espacios.me/communiverse/workspace/` | `bb3fac382d2f4b2a9820ff54f36a8e85` |
| `www.espacios.me/communiverse/__cvfix_v2.js*` | `18b0785c90564215ad95688923dba778` |
| `www.espacios.me/communiverse/__cvfix_v2.css*` | `418b1e32b8f641adaebc92643a5b5938` |
| `www.espacios.me/communiverse/api/knowledge/artist-assignments*` | `a1860ae1b3b041eba8f6819fc94636e8` |

Original broad `espacios.me/communiverse*`, `www.espacios.me/communiverse*`, and OAuth callback `mail.espacios.me/communiverse/auth/callback*` routes remain on `communiverse-marketplace`. Other pages, static media, ordinary APIs and the original application remain untouched.

## Features included
1. Avatar-only profile header implemented by CSS, with accessible profile name retained.
2. Wider, proportionate artwork detail presentation with existing native `[data-open]` behavior and corrected stale-expanded-tile cleanup; no synthesized popstate.
3. Real workspace task questions produce interactive, permission-scoped task cards BEFORE the legacy assistant sends prose; card buttons use native `data-ws-task` handler.
4. Filtering for personal, all visible and attention-needed tasks, with actual project/status/due-date/owner, avatars and tooltip.
5. Polished native file controls, filename feedback and client-side size validation; original upload endpoint unchanged.
6. Assigned ambassador avatar via authorized D1 lookup; original onboarding identity is deliberately not claimed.

## Verified before and after release
- Isolated stage, actual public gallery, **39/39** browser checks at 390, 768 and 1440px, including recommendation navigation and no stale expanded tile.
- Isolated stage, explicitly MOCK authorized workspace, **60/60** checks at 320, 390, 1024 and 1920px, including avatar, task cards, task buttons, filters and file UX.
- Eleven public staging routes rendered normally.
- Production-specific Worker tested with real public pages and real protected endpoints; no mock endpoint or hard-coded task data shipped.
- GitHub CI `37910752871` passed syntax and source-grounded knowledge projection tests.
- Post-production checks: homepage and workspace on apex and www render the experience assets; Plug and Discover remain original; anonymous workspace and artist-assignment endpoints deny access, and no literal public `null` page was seen.

## Query-string deep links — known scope limitation

Cloudflare exact routes without a trailing wildcard do **not** match URL query strings. For safety, this release intentionally avoided the broad /communiverse/* route that was associated with the earlier regression. Therefore direct navigation to /communiverse/?work=... or /communiverse/workspace/?task=... can use the unchanged original Worker and will still function with its original UI; they do not receive the v2 style injection on an initial direct page load. Following work links from a v2-enhanced plain homepage/workspace retains the new styles during the in-page navigation.

Do not add broad routes to fix that discrepancy until authenticated E2E and safe exception routing are proven. A future original-runtime code change may be a better long-term solution.

## Outstanding validation
**No authenticated live-session E2E test was performed.** The user's previously reported signed-in `null` issue cannot be certified fixed solely from signed-out page checks or mocked task data. Real account, session renewal, editor, R2 upload, OAuth, account permissions and live task opening should be tested by an authorized signed-in person. Keep monitoring and roll back promptly if regressions appear.

## Exact rollback
If the new UI causes a signed-in failure, delete ONLY the ten newly added route IDs listed above using Cloudflare's zone Workers-route API. The three original patterns automatically resume handling these requests. Do not alter the original Worker version, D1 or R2 data. Retain the v2 Worker source and version for diagnostics. Verify homepage, workspace, auth, original API, images and `www` after restoring.

This is deliberately a narrower deployment than the previous failed broad gateway.