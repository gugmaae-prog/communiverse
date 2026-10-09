# Communiverse V3 — UX and workspace foundation

**Date:** 2026-10-09
**Status:** First scoped production release **LIVE**, further phases pending authenticated QA
**Live:** https://espacios.me/communiverse/ and https://espacios.me/communiverse/workspace/

## Scope

This is phase 1 of the approved blueprint, plus non-mutating previews and Focus surfaces. It is **not** completion of the entire AI/business-workflow roadmap.

- **Artwork details:** Move source, credit caveats and long tag sets underneath the two-column hero; keep image/video proportions and existing source links. Six tags are shown initially with optional expansion. Expanded artwork takes full gallery width across 390/768/1440 test viewports.
- **Header:** Existing avatar-only UI retained; no new profile/identity backend.
- **Workspace:** Rename Overview to Focus; source-grounded attention surface prioritizes blocked, review and upcoming tasks and requests waiting for the current signed-in user. Source: existing permission-checked `/communiverse/api/workspace/overview`; uses native task/request detail buttons.
- **People:** Replace task owner selects with accessible avatar-circle radio choices backed by the actual allowed `<select name=owner_id>` options. Use circle tiles for existing project/meeting collaborator checkboxes without altering their serialized values or allowed memberships.
- **Requests:** Replace `kind` dropdown presentation with type cards; preserve existing form data/validation and submission. Read-only preview of the existing reviewer policy, including Haseeb/Elferah and applicable Keiffer-first ambassador route. The backend remains authoritative on final reviewers and stage.
- **Task detail:** Context-aware status suggestions populate the original form but **never save automatically**; users still review and submit through authorized native task endpoints.
- **Files:** Retain native R2 upload handling, improve file selection wording and spacing.
- **AI:** Existing V2 structured task cards and the separate business-knowledge Worker remain intact. No new LLM permissions, data tables, autonomous actions or replacement task store.

## Source and Cloudflare deployment

- New Worker: `communiverse-workspace-ux-v3-20261009`
- Version: `7f92c45c-0cb1-4164-866e-d9d7ffa29d3b`
- Binding: `MARKETPLACE` service → `communiverse-marketplace`
- Existing baseline: `communiverse-experience-v2-20261009`
- Existing backend: `communiverse-marketplace` unchanged
- External V3 stylesheet URLs are now allowed by adjusting **only** `style-src` to include `'self'`, preserving script/media/auth CSP restrictions.
- `communiverse-business-knowledge` and its routes remain unchanged.
- Supabase project `ypkfganbwdvcjrcxygta` confirmed ACTIVE_HEALTHY, with no relevant Communiverse workspace tables; **no Supabase schema or Edge Function changes were made**.

### Existing routes switched from V2 to V3

| Pattern | Route ID |
|---|---|
| `espacios.me/communiverse/` | `48b06cf055ca4c2892a7cc753d881e2a` |
| `www.espacios.me/communiverse/` | `1193a67a9f5c45a8aa0eff6061d04a43` |
| `espacios.me/communiverse/workspace/` | `2791016f8630415f9ce399e1c992b523` |
| `www.espacios.me/communiverse/workspace/` | `bb3fac382d2f4b2a9820ff54f36a8e85` |

### New static asset routes

| Pattern | Route ID |
|---|---|
| `espacios.me/communiverse/__cvux_v3.js*` | `e89450feb04e44c68247a734fb0d945c` |
| `espacios.me/communiverse/__cvux_v3.css*` | `0f83517e0588481a89d0164e1b7bcf4d` |
| `www.espacios.me/communiverse/__cvux_v3.js*` | `edbb4754a9d74af49dba5cddba53099f` |
| `www.espacios.me/communiverse/__cvux_v3.css*` | `0af0f20a75ae4a1cbb90e7a7c98fdf7f` |

V2 assets remain available and are deliberately loaded before V3 assets. The original `espacios.me/communiverse*`, `www.espacios.me/communiverse*` and OAuth callback routes retain their original Workers.

## Test evidence

- **66/66** browser fixture assertions at 320, 390, 1024 and 1920px. These use **mock authorized workspace data**, not the user's live session.
- **45/45** real-public staging assertions at 390, 768 and 1440px: native artwork opening, related recommendation routing, full-width metadata, expanded-card geometry, tag preservation and no horizontal overflow.
- GitHub Actions `Communiverse V3 UX checks` passed; syntax of V3 modules plus existing knowledge model invariant tests.
- Live anonymous homepage and workspace render on apex and www; both V2 and V3 assets are attached. Plug/Discover unchanged. No literal public `null` observed. Anonymous workspace and artist assignment APIs still deny access.
- Cloudflare staging isolated Worker verified before promotion.

## Critical limitations

- No authenticated production browser session was available. The user's earlier signed-in `null` issue is **not certified fixed** by signed-out public tests.
- Real task edit/approval, request submission, mention notifications, R2 uploads and OAuth renewal were not exercised during this release. Source and server validation remain unchanged.
- Query-string deep links such as `/communiverse/?work=...` may bypass exact-page routes and load the original UI. Do not add an uncontrolled broad wildcard route.
- Later blueprint phases (full Connect redesign, file upload progress, expanded AI retrieval/actions, cross-role end-to-end verification) remain to be implemented individually after authenticated QA.

## Rollback

If a regression appears, use Cloudflare Workers Routes API `PUT /zones/{zone_id}/workers/routes/{route_id}` on the **four existing homepage/workspace route IDs** above, restoring `script: "communiverse-experience-v2-20261009"` with the unchanged pattern and id. Delete only the four newly created V3 asset routes. Keep the existing backend Worker and D1/R2/Supabase untouched. Verify root, workspace, login, OAuth callback and media on both hosts afterward.

**No new backend tables, no destructive migrations and no file/account data mutations occurred in this UX release.**
