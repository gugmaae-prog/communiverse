# Communiverse

Communiverse is an art-led community and workspace: discover art and people, coordinate Work, talk in Connect, and use Cosmos and in-house Tools against the same permission-checked records.

Live: [Communiverse](https://espacios.me/communiverse/) · [Workspace](https://espacios.me/communiverse/workspace/).

This is the full-stack operating and design guide. Read it before changing public pages, Workspace, Work, Connect, Manage Communiverse, Tools, profiles or either Cosmos entry point. Design requirements are not automatically delivered features; the status and acceptance sections identify the boundary.

## Contents

- [Current release and source coverage](#current-release-and-source-coverage)
- [Full-stack architecture](#full-stack-architecture)
- [Canonical navigation and feature ownership](#canonical-navigation-and-feature-ownership)
- [Data, identity and access boundaries](#data-identity-and-access-boundaries)
- [Work, Connect, media and Tools flows](#work-connect-media-and-tools-flows)
- [Cosmos and AI contracts](#cosmos-and-ai-contracts)
- [Communiverse design system](#communiverse-design-system)
- [Responsive behavior and performance](#responsive-behavior-and-performance)
- [Development, release and recovery](#development-release-and-recovery)
- [Acceptance matrix and remaining work](#acceptance-matrix-and-remaining-work)
- [Historical release notes](#historical-release-notes)

## Current release and source coverage

**Snapshot checked 13 October 2026, 11:37 GST (UTC+4).** Cloudflare versions/traffic and service bindings were re-read for this documentation update. Public health endpoints report the mobile/Circles V8 presentation and Tools V7 backend. Recheck production before a later release; this table is not a permanent deployment lock.

| Layer | Production Worker | Active version | Traffic |
| --- | --- | --- | --- |
| HTML/presentation gateway | `communiverse-workspace-ux-v3-20261009` | `81c73b01-c4ba-44d4-8709-1b9ac4fcfc1d` | 100% |
| Retained Marketplace/root | `communiverse-marketplace` | `cd0f8a5a-ed53-4620-9d44-f82159b79797` | 100% |
| Connect, management and Tools backend | `communiverse-connect-v4-20261012` | `9515d208-2a40-4840-be6a-ca0407d07599` | 100% |
| Public search orchestration | `communiverse-search-v4-20261010` | `a51eb441-e17e-42b3-9d89-befd50f0c9ee` | 100% |

The V8 gateway deployment is `19ee7690-006b-4d56-a88f-048c67aa88ec`, promoted on 13 October at **06:28 GST**. It wraps the exact previous gateway and four text bundles with additive presentation assets; it does not replace the root's 140 retained modules/binary inventory. The root, Connect and Search versions were unchanged by that release.

| Capability | Status |
| --- | --- |
| Circles display naming; labelled phone people rows; retained desktop constellation | Deployed in V8; legacy `/communiverse/plug/` links still work |
| Paired request-field alignment, preview padding, plus/minus disclosures, denser sheets/sticky headers | Deployed presentation foundation; not universal mobile certification |
| Shared account shortcuts, fifteen typed sheet fields, authorized Tools read/query and source cards | Tools V7 foundation deployed |
| Canonical Work/task progress, management, conversations and media | Existing full-stack services retained; each workflow still needs its own acceptance tests |
| Voice/video huddles | Implementation exists but paid usage is disabled; do not advertise working live calls |
| AI-cell generation/review/apply/undo, verified external enrichment, complete Notion-like grid | Planned; not deployed |

**GitHub is not yet a complete production rebuild.** At the documentation baseline, `main` contained the legacy Next.js app and earlier presentation/search/knowledge modules, not the newer retained root, Connect/Tools, polish and V8 source families. A Cloudflare deployment is not a GitHub source-sync operation. This README update publishes documentation only; it does not publish those missing code modules or prove they can be rebuilt from `main`.

Published earlier source includes [worker/search-v4](worker/search-v4), [worker/experience-v3](worker/experience-v3), [worker/booking-card-fix](worker/booking-card-fix), [worker/knowledge](worker/knowledge) and [worker/business-knowledge](worker/business-knowledge). Newer implementation families are referred to below as source-owner paths, **not as links claiming they are already available on `main`**. Reconcile the exact current module inventory before publishing a source-complete release. Preserve unrelated local changes and cloud-only files; never replace missing source with a guessed implementation.

The [older production reconciliation document](PRODUCTION.md) and release notes at the end preserve historical evidence. Their October 7–10 version/module counts, route assertions and credential observations do not override this snapshot.

## Full-stack architecture

The live product is a **stacked Cloudflare Workers application**, not just the repository's static Next.js export. Zone routes choose the entry Worker; service bindings then delegate between presentation, search, booking and canonical application services. Exact routes are authoritative—do not assume every request follows the same chain.

```text
Browser: public pages / Workspace / Work / Connect / Tools / Cosmos
  -> Cloudflare route selection and presentation/search/booking layers
  -> canonical Marketplace and Connect application APIs
       -> D1: operational records, sessions, access checks and history
       -> R2: media bytes behind authorized application routes
       -> Durable Objects: conversation realtime coordination
       -> Supabase Auth: external identity/OAuth integration
       -> Groq: bounded Cosmos generation through the server adapter
       -> Email binding: existing explicitly authorized email flows
```

This is a dependency map, not a claim that all media, authentication or API requests pass through the HTML overlay. Public HTTP assets, private media and mutation endpoints retain their own routing and authorization behavior.

| Service | Responsibility and retained bindings |
| --- | --- |
| Presentation gateway | Successful Communiverse HTML overlays and versioned UI assets. `MARKETPLACE` → retained root; `SEARCH` → public search; `BOOKING` → `communiverse-booking-cards-20261010`. Runtime compatibility `2026-10-09`, standard usage. APIs, non-GET requests and non-HTML media pass through without presentation rewriting. |
| Marketplace/root | Canonical public catalogue, identity/account/session integration, Workspace, private Cosmos and retained modules. `COMMUNIVERSE_DB` (D1), `COMMUNIVERSE_MEDIA` (R2), `CONNECT`, `LEGACY`, `EMAIL`, server-side `GROQ_API_KEY`, and primary/LinkedIn Supabase integration bindings. Compatibility `2026-09-27`. Secret values are not repository content. |
| Connect V4 | Conversations/threads/media, management, Tools and auxiliary task progress. Uses the same D1/R2 bindings, `MARKETPLACE`, and `ROOMS` Durable Objects. Compatibility `2026-10-12` with `nodejs_compat`. |
| Search V4 | Public-page search and AI discovery orchestration. `HOME` → presentation gateway; `MARKETPLACE` → root; `BOOKING` → booking service; `V2` → retained experience layer. Compatibility `2026-10-09`. |
| Legacy app | Retained `communiverse` service/static assets delegated where required; not a replacement for the current Marketplace/Connect runtime. |

On the landing-page handoff, Search can delegate to `HOME`; the gateway's root-page path must terminate at Marketplace rather than call Search again. Test this explicitly to avoid service-binding recursion.

**Supabase versus D1:** Supabase supplies the configured authentication/OAuth integration. The operational Work, conversation and Tools services use **Cloudflare D1**; do not describe a second Supabase copy of those records as the source of truth. Realtime coordination is the Connect Worker/Durable Object path, not a claim that Supabase Realtime powers the current messenger. R2 media is not a claim of Supabase Storage usage.

## Canonical navigation and feature ownership

One product, one record model, with visible destinations derived from verified capabilities.

| Surface | Canonical organization |
| --- | --- |
| Public header | Discover, Artists, Events, Communities, Circles |
| Signed-in Workspace | Focus, Work, Connect, plus role-appropriate studio/programme access |
| Work | Projects, My tasks and Requests; board/list are views of the same tasks |
| Connect | Conversations, people and meetings; channels/DMs/threads reference the same conversation system |
| Manage Communiverse | Overview, People, Onboarding, Communities, Activity and Tools, where authorized |
| Tools | Personal or Work-linked folders, notebooks, notes and typed sheets—not a second project/task database |
| Cosmos | Shared card language across entry points; private and conversation context remain separate |

The upper-right avatar is a shared shortcut menu, not a second module hierarchy:

| Item | Destination |
| --- | --- |
| Profile | Existing canonical photo/contact editor via `/communiverse/workspace/?profile=edit` |
| Tools | `/communiverse/workspace/?view=manage&section=tools` |
| Task | `/communiverse/workspace/?view=my-work` (Work → My tasks) |
| Work | `/communiverse/workspace/?view=projects` |
| Manage Communiverse | Existing capability-checked management destination |
| Sign out | Existing session action, separated from navigation |

Build both menu and direct-link behavior from current capabilities. A hidden tab, name, role shown in a profile, URL parameter or AI output is never an access grant. Preserve native form state, Back/Forward and focus when reusing Profile. Photo changes use canonical upload/preview/save and refresh the real account image; role/permission fields are not self-editable.

Circles is the new **display name** for the legacy directory. Keep existing person/filter/query URLs compatible. Community-circle records and the people directory are different entities; a vocabulary change must not merge them. Application-owned restored headers, accessible labels and navigation use Circles. Do not blindly rename user-authored notes, IDs, stored data or immutable historical assets.

## Data, identity and access boundaries

### Canonical stores

| Domain | Canonical storage/responsibility |
| --- | --- |
| People/accounts/session authority | Server-verified identity plus active canonical account/staff records and session tables |
| Work | Existing D1 projects, project membership, tasks, requests and activity; progress/checklists attach by canonical task ID |
| Connect | Existing conversation/membership/message records plus metadata, reactions and attachment references |
| Tools | Document hierarchy and versions; sheet columns, rows, primitive typed values and revision metadata |
| Media | R2 object bytes plus authorized record/conversation linkage; a storage key alone is not permission |
| Cosmos preferences | Per-identity preferences/interests/activity summaries, not a shared global user-memory bucket |

Views, cards, citations, Kanban and attachments reference these records. They do not create competing copies or grant access by embedding the contents elsewhere.

### Identity and sessions

Keep Google/LinkedIn OAuth and username/password sign-in controls alongside the same canonical account/session workflow. Preserving controls/configuration is **not** a fresh end-to-end OAuth certification. Provider callback, account linking, session refresh, logout/revocation and recovery need separate acceptance tests. Do not expose credentials or change providers merely to update a UI.

The application validates sessions on the server and derives the actor/capabilities there. Preserve Secure/HttpOnly/SameSite cookies, same-origin mutation protections, rate limits and revalidation on sensitive reads/writes. Never authorize from display names, browser state, client-supplied role fields or user-editable Supabase `user_metadata`. If future tables are exposed through Supabase's Data API, apply explicit grants and row-level policies; Supabase RLS does not automatically authorize D1 operations. See [Supabase Auth](https://supabase.com/docs/guides/auth) and [Data API security](https://supabase.com/docs/guides/api/securing-your-api).

### Access partitions

- Public catalogue/profile projections contain only public fields. Private contact/pipeline/task/message/document data must not leak through HTML, search, counts, previews or AI cards.
- Work owners/members and authorized operational leadership retain the relevant oversight when a task is reassigned. Reassignment does not remove canonical project access or recorded history.
- Existing staff-visible Artist Programme pipeline notes remain staff-visible under policy. This does not make onboarding contacts, personal Tools or private conversations visible to every staff account.
- Private conversations require membership, including for management. Work oversight is not a blanket conversation-membership grant.
- Unlinked Tools are owner-private. Linking a document/folder to Work uses canonical task/project authority and a scope-sharing review; descendants inherit the resulting scope. A reference alone cannot publish a personal document.
- Authorize search results, filtered totals, cursors, selected rows, narrower references, download/media access and AI context—not only the containing page. Recheck before returning or committing sensitive results.
- Account switch, revoked membership/session or changed sharing must suppress late/stale private responses and clear private client state. Historical AI responses require source access too, not just hidden links.

Keep permission configuration, privileged account mappings, private onboarding contacts, real workspace fixtures, session dumps and secrets out of public documentation. Examples must be synthetic and never populated into production for testing.

## Work, Connect, media and Tools flows

### Work and progress

Projects, My tasks and Requests share the canonical Work service. The Kanban/list switch does not change task IDs or create another task store. Dragging has a labelled move alternative; board colours always include status text. Task detail shows actual last editor/time and canonical related documents.

Progress is recorded or deterministically derived: completed status yields 100%; otherwise a checklist yields completed/total; otherwise an authorized saved manual percentage is used; otherwise it is unset/0. Show the source and counts next to the progress ring. Never invent intermediate percentages from a status label or AI opinion. Reassignment and progress writes preserve version checks, canonical activity and leadership visibility.

### Connect and media

The server checks the current actor and room membership before fetching history, sending, searching, resolving attachments or accepting realtime connections. Changes persist in D1; `ROOMS` coordinates delivery through conversation WebSockets. Preserve cursor ordering, reconnect/backfill, deduplication and version/idempotency checks—WebSocket receipt alone is not durable save confirmation.

The composer stages local image/video previews before upload and keeps progress/error/retry states. A voice note has record/review/cancel, duration and playback UI, not a filename as its primary message label. Preserve real media semantics and accessible play/pause controls.

Authorize **before** reading private R2 bytes. Private responses retain appropriate no-store/Vary headers; do not turn a private asset into a public URL to fix a preview. Local `blob:` previews require the relevant CSP image/media allowance and object-URL cleanup. Keep safe inline image/video types; unsafe formats/documents use the existing download boundary.

**Paid calls are off.** Current Connect bindings are `CALLS_ENABLED=false` and `LIVE_CALLS_BUDGET_CONFIRMED=false`. Do not create paid provider sessions, request camera/microphone on mount, load a calling SDK unnecessarily or imply huddles are available while disabled. Enabling calls requires explicit user authority, budget and a separate verified provider release. These flags do not disable the existing Cosmos AI adapter.

### Tools and sheets

Folders, notebooks, coloured notes and sheets can be linked to canonical Work where authorized. Editors preserve unsaved values on failure; confirmed saves show recorded editor/time; concurrency conflicts offer refresh/review, not silent overwrite.

The deployed logical sheet types are:

| Field family | Types and rules |
| --- | --- |
| Primitive | `text`, `number`, `date`, `checkbox`; no arbitrary execution/coercion |
| Contact | `email`, `phone`, `url`; validate format/scheme, preserve phone formatting/leading zeros, explicit compose/open action only |
| Options | `select`, `status`; stable option IDs, editable labels/colours, explicit empty state |
| Numeric meaning | `currency`, `percentage`; finite values, declared currency/scale, locale-aware display; no claim of exact-decimal formula accounting |
| References | `person`, `task`, `project`, `document`; canonical permitted records, masked inaccessible references, no sharing grant |

Created/last-edited metadata is read-only attribution, not another editable field type. Existing columns keep their configured logical type; a column labelled “Phone” is not automatically converted to a phone editor. Type/schema changes preview incompatibility before applying; do not silently coerce stored data.

The sheet model keeps JSON primitives and logical field/configuration metadata over the existing storage constraints. Typed validators, filters/sort/query, pagination, stable IDs and revision history must round-trip consistently through server/editor/AI. Distinguish loaded rows, matching authorized rows and total authorized rows. Narrower person/task/project/document references are checked independently before filtering, counting or including them in context.

V8 adds denser insets, contained table scrolling and sticky headers. It does not complete Notion-style row inspectors, a full grid keyboard model, formulas, export engines or persisted column drag layout. Use semantic tables; do not add `role="grid"` without implementing the corresponding interaction model. Native editing keys remain native; documented navigation shortcuts and Escape must preserve the original unsaved value.

### Service API map

This is a contract/ownership map, not permission to bypass the UI or send production fixtures. Confirm the deployed method/validation before writing an integration.

| Surface | Known route/ownership |
| --- | --- |
| Public/Workspace identity | Retained same-origin identity/account/session APIs |
| Workspace overview | `/communiverse/api/workspace/overview` |
| Private Cosmos | `POST /communiverse/api/cosmos` |
| Connect | `/communiverse/api/workspace/connect/v4/…` for conversations, messages, realtime, management and guarded calls |
| Tools reads | `/communiverse/api/workspace/connect/v4/tools/` operations `documents`, `document`, `sheet`, `search` |
| Tools canonical mutations | Same Tools family: `save`, `archive`, `attach`, `columns`, `rows`, `cells`; explicit authority/version/idempotency required |
| Read-only AI Tools registry | `/communiverse/api/workspace/connect/v4/tools/read` with allowlisted operations below |
| Auxiliary task progress | `/communiverse/api/workspace/connect/v4/work/progress` and `/work/checklist` |
| Public release health | `/communiverse/__cvmobile_v8_health` and `/communiverse/api/workspace/connect/v4/health`; health is not an authorization bypass or end-to-end proof |

## Cosmos and AI contracts

### Current foundation

Cosmos uses the configured server-side Groq adapter, verified identity, bounded authorized Work/knowledge/catalogue context and validated structured responses. Keep keys in Worker secrets. Do not send an entire account/database dump or introduce another AI provider/account/billing path as a UI improvement.

The Tools read registry allowlists `search_documents`, `read_document`, `query_sheet` and `get_work_context`. It is not an arbitrary SQL/HTTP/code tool. Scope arguments are requests to authorize. Validate operation/schema/size/time, return bounded excerpts and honest totals, and recheck source access after synthesis as well as on reads.

Private Cosmos may use the requester's currently authorized context. Conversation Cosmos requires membership and explicitly selected sources readable by every intended recipient; it must not use the caller's private cookie/history bundle as the group's authority. The deployed common-source foundation is bounded; larger/unsupported audiences should use a private answer rather than silently broadening sharing. Recheck before synthesis/commit and on historical delivery; inaccessible derived prose must be suppressed alongside links.

Personalization is compartmentalized per identity: tone/detail preferences and bounded interests/activity summaries are separate from other users' private conversations/documents. Learning has a user preference and forget path; do not describe this as unlimited surveillance, model retraining or guaranteed learning from every activity. Personalization never overrides permissions.

### Response and action design

Lead with a useful answer adapted to the inquiry. Use structured response, source, process, document and Work cards when helpful; do not force every prompt into a generic six-phase planner. A card has a clear title, relevant excerpt/recorded status, scope/source indication and a real action such as Open sheet, View row, Open task or Review draft. Long answers remain readable/expandable. Never print serialized context/internal IDs as prose or substitute a wall of links for a designed response.

Process requests produce contextual steps, dependencies, known owners and a reviewable proposal. They do not silently create projects, send invitations/messages, approve spending, change permissions or carry out personnel decisions. Use warm, lightly witty language when appropriate, and a clear professional tone for serious or sensitive work. A draft must never be described as an executed task.

Treat documents/cells/messages/catalogue excerpts as untrusted source data, not instructions. Keep tool allowlists, server authorization and safe rendering independent of the prompt. Validate model output; reject arbitrary actions/URLs/generated executable HTML. A citation is not proof of a verified external lookup.

### AI cells and enrichment — planned, not deployed

The first proposed scope is one explicitly selected target cell with bounded readable context from the same row. Support summarizing/rewriting/drafting or classifying into existing option IDs. Do not automatically expand narrower references, unrelated rows or private chat history. Missing evidence produces no candidate rather than an invented contact/fact.

1. Generate into a separate review buffer, not canonical cell state.
2. Show current/proposed value, target field, reason and context/source versions, plus Apply/Cancel.
3. Apply through the canonical typed-cell write with current identity, readable context, writable target, schema/context/record versions and an idempotency key.
4. Record actor/provenance; stale/revoked/expired proposals produce no write. Cancel ignores late responses. Blur, prompt submission or changed selection must not auto-apply.
5. Undo is an authorized compensating update against the post-apply version; do not overwrite intervening edits or erase history.

External enrichment remains a separate explicitly reviewed feature requiring validated sources, retrieval time and entity/field matching. Never infer real phone numbers, email addresses, private employment facts or roles from a name or plausibility. AI proposals cannot send messages, create identities, grant access or launch consequential workflows without the existing explicit controls.

## Communiverse design system

This contract governs parent pages **and subpages**, dialogs, sheets, cards and both Cosmos surfaces. Use Communiverse's calm art-led identity; borrow useful Slack/Trello/Notion interactions without copying their branding or creating independent themes.

### Tokens and typography

| Role | Product baseline |
| --- | --- |
| Page background | `--cv-glass-bg: #edf2f8` |
| Reading / secondary text | `--cv-glass-ink: #243248` / `--cv-glass-muted: #55647a` |
| Primary / selected state | `--cv-glass-blue: #245ccc` / `--cv-glass-soft: #e7eefb` |
| Surface, border, elevation | Existing `--cv-glass-surface`, `--cv-glass-line`, `--cv-glass-shadow`; opaque fallback when glass is unavailable |
| Typeface | Existing system-sans stack, regular reading weight; no feature-specific replacement font |
| Reading / controls / editable fields | 15px reading baseline, 14px controls/labels, secondary at least 12px; phone editable fields at least 16px |
| Headings | Page 28–40px, section 22–26px, card 15–19px; short headings wrap naturally; no repeated oversized title in a nested card |
| Targets / icon gap | At least 44px interaction target; 8px icon/text gap |
| Surface / spacing | Main panel radius 24px, nested baseline 18px; spacing 4/8/12/16/24/32px |

Newer source owners are `worker/design-system/glass.css`, `worker/polish-v5/shared.css` and feature aliases, subject to the source-coverage warning above. Use semantic tokens, not a new palette per feature. Functional colours include labels, not colour-only meaning. The luminous orb represents Cosmos; avoid unrelated decorative orbs/gradients.

### Shared component roles

- Label actions use pills; avatars and icon-only controls are circular. Menu rows, sheet cells, message bubbles and cards retain their own semantic role—do not make everything another pill.
- Keep the outer header transparent; glass/blur belongs to floating navigation/overlays, not a full-width header rectangle or every scrolling table cell.
- Use 16–24px card content insets, including nested approval/source previews. Text must not touch the card edge. Use grid/flex gaps, shrinkable text children and readable line-height.
- Paired fields use one label-copy block, equal-height controls and a shared baseline. Optional text must not create an extra grid row. Stack on phones; do not fix alignment with per-field offsets.
- Reflow actions/labels before shrinking or clipping them. Essential button/region text must remain available; icon-only actions need names and full targets.
- Preserve input DOM identity, values, listeners and unsaved drafts during upgrades. An enhancer must not compete with retained observers for the same label/class/state.
- Include loading, empty, saving, saved, retry, read-only, denied and conflict states. Show success only after confirmation and actual last editor/time, or an honest historical-attribution limitation.
- Keep genuine multi-select semantics; navigation is not a radio group or checkbox collection. Do not add selection dots to Workspace tabs.
- Use semantic controls, consistent SVG glyphs, visible keyboard focus and adequate contrast. Support zoom, forced colours, reduced transparency and reduced motion; no blanket removal of focus outlines.
- Use accessible menu-button behavior, normal navigation links, Escape/focus return and predictable dismissal. A `role="menu"` requires its keyboard model.

### No disclosure triangles

Expandable sections use a restrained plus/minus or labelled Show/Hide affordance. Preserve native `<details>/<summary>` keyboard/open semantics while suppressing both `::marker` and Safari's `::-webkit-details-marker`; later feature CSS must not re-enable disclosure markers. Check closed and open states. Decorative affordances are hidden from assistive technology; native summary text/state remains available. Do not hide arbitrary SVG polygons or legitimate voice/video play controls to remove triangles.

## Responsive behavior and performance

### Geometry

- Start from a consistent 16px phone gutter, then increase on wider screens. Flex/grid children use `min-width:0`; images preserve proportions and reserve dimensions.
- The page stays within its viewport. Only a labelled, keyboard-reachable sheet/board region may scroll horizontally. Do not hide global overflow to mask broken layouts.
- Phone Circles uses readable, tappable named rows and deferred offscreen rendering; retain canonical filters and selection when switching modes. Desktop can keep the constellation, with no phone collision/orbit animation work.
- Dialogs fit the viewport with an internal content scroll region, a reachable close action and preserved form state. Use safe-area/dynamic viewport support with fallback. Test the real mobile keyboard.
- Fixed Cosmos/conversation controls must not obscure fields, the last row or submission actions. Keep focus clearance and scroll margins appropriate to actual header/keyboard height.
- Use semantic tables and stable editable targets. Row inspectors, selected-cell editing, persistent column layouts and full grid navigation are follow-on contracts, not assumptions about the deployed sheet.

### Smoothness

Keep scrolling native. No scroll hijacking, perpetual resize/scroll measurement loops, blanket `will-change` or blur across large scrolling tables. Deduplicate reads, cancel stale requests and paginate before rendering whole large collections. Investigate route-scoped loading of Workspace-only bundles without dropping retained behavior or immutable assets.

Immediate state/focus/input feedback does not wait for animation. Use shared, short, interruptible motion tokens (roughly 100–160ms feedback, 180–260ms overlays), animate appropriate transform/opacity properties, and stop offscreen/background nonessential work. Clean up timers/listeners/observers/object URLs on teardown. Keep a reduced-motion final state and a visible pause/stop when ongoing motion needs one.

Measure transfer/decompressed bytes separately from latency, layout shift, interaction delay and frame behavior. A byte reduction, green build or a small-phone screenshot does not prove “60fps”, good Core Web Vitals or buttery-smooth behavior everywhere.

## Development, release and recovery

### Source owner map

These newer families describe responsibility in the retained release/workbench. They are not all published in this branch yet:

| Family | Owner |
| --- | --- |
| Canonical root / private Cosmos | Retained Marketplace modules; `worker/cosmos` and retained-build tooling |
| Connect, navigation, room coordination, calls | `worker/connect-v4` |
| Work authority / auxiliary progress | `worker/connect-v4/workspace-access.mjs`, `progress.mjs` |
| Tools / fields / registry / shared sources | `worker/connect-v4/tools.mjs`, `sheet-fields.mjs`, `tools-registry.mjs`, `shared-tools.mjs` |
| Account, management, Work, Tools and Cosmos presentation | `worker/polish-v5` |
| Mobile/Circles HTML wrapper and successors | `worker/mobile-v8` |
| Shared visual tokens | `worker/design-system` |

No autonomous background deployment is authorized by this guide. Read applicable repository instructions and release records, inspect current source coverage, then use the actual release owner.

### Local legacy app

The published package uses Next.js 15.5.26 / React 19.1.0. For that retained app:

```sh
npm ci
npm run dev
npm run lint
npm run build
```

The configured dev port is 43123; the app's path is `/communiverse/`. These commands develop/build the legacy source, **not the entire current production stack**. Its Wrangler preview/configuration must not be used as a production release recipe. Use isolated Worker fixtures and the exact module manifest for current full-stack work; never point synthetic fixtures at production mutations.

### Safe release procedure

1. Resolve the intended branch/commit, repository, Worker, zone routes and active traffic. Preserve dirty user changes; hydrate needed cloud-only files. Do not equate the local checkout with production.
2. Capture the exact retained module inventory, including binaries, hashes, bindings, compatibility flags, assets and route ownership. Avoid decoding binary multipart modules as UTF-8 and re-uploading lossy bytes.
3. Build with the verified retained/full-module release workflow. A narrow presentation patch may preserve exact unchanged deployed text modules; it cannot stand in for edited or missing backend source. Preserve immutable old URLs and give successors new URLs.
4. Run component/API/ACL tests and retained-neighbor integration tests. If an avatar/menu enhancer is involved, include the retained profile-label observer test; if source cards are involved, reject internal/serialized context as prose.
5. Inspect migrations separately. Use additive, repeatable migrations with version/idempotency guards and foreign-key checks; never reset shared activity or create live fixtures as an incidental release step.
6. Upload a **version**, preserve/inherit bindings strictly and existing runtime settings, stage at zero public traffic, and verify actual traffic plus candidate overrides. Do not overwrite the stacked root with a standalone legacy deploy.
7. Check apex/www HTML, assets and exact byte parity, APIs, denied access, authorized workflows, media/CSP, Cosmos, pause controls and unaffected Espacios routes. Local runtime compatibility is not proof of production compatibility.
8. Promote only passing versions; independently re-read final version/traffic and repeat live checks. Record date/time, commit/source coverage, version/deployment IDs, rollback target and missing verification.
9. Publish only scoped, sanitized code/documentation. No private contacts, privileged account mappings, secret values or production dumps. Do not blindly merge stale branches or stage the entire dirty tree.

The deployed V8 presentation can roll back to gateway version `44709b35-c0be-4cbc-b5f1-6ee6a352e8c4` after rechecking current state. Rollback changes traffic/code; it does **not** undo database writes or provider/account changes. Original immutable code/media remains preserved.

Root full-stack recovery must preserve Marketplace, Connect, Search, booking/legacy dependencies, D1, private R2, Durable Objects, Supabase provider/session configuration and server secrets independently. A Worker content snapshot is not a full database/media/secret/static-assets disaster-recovery backup. Restore from authorized verified backups; do not republish secret values in a manifest.

### GitHub and configuration boundary

The current [deploy.yml](.github/workflows/deploy.yml) is a **read-only verification workflow**, not an automatic Cloudflare deployment. Its push filter does not include README-only updates. Earlier pinned verification/snapshot jobs and [PRODUCTION.md](PRODUCTION.md) describe historical targets; do not blindly run them as current-source reconciliation or certification. A connected Cloudflare tool does not supply an Actions secret, and an earlier missing-secret observation is not evidence of today's configuration.

Use Worker secret mechanisms for `GROQ_API_KEY`; configured Supabase URL/public-key bindings remain separate from privileged secret/service-role credentials. Do not commit environment files or paste secrets into issues. Preserve `CALLS_ENABLED=false` and `LIVE_CALLS_BUDGET_CONFIRMED=false` until an explicit enablement release. Credential/provider/DNS changes require their own authority and validation.

## Acceptance matrix and remaining work

### Evidence already recorded for V8

- Exact deployed presentation baseline recovered and checked by hash; successor syntax and local Worker passthrough/HEAD/immutable behavior tested.
- Synthetic rendered checks at 320, 390, 768, 1280 and 1440px: no page overflow, 48px inputs, 16px preview padding, aligned desktop/tablet fields and stacked phone fields; keyboard disclosure and input identity preserved.
- Phone Circles measured 82px labelled rows at 390px, retained filter/profile actions, selection across desktop/phone switch and reduced-motion behavior. Retained aspect-ratio/absolute-orbit conflicts were fixed before upload.
- 34 zero-traffic HTTP checks and the same 34 live checks: nine page families on apex/www, nine new/retained asset hashes, three original immutable hashes, three signed-out API denials, health scope and the unaffected Espacios homepage.
- An authenticated ordinary-staff Workspace/Tools/account-menu check passed after promotion. Amount/Currency tops matched on desktop; the 390px request dialog fit with 48px inputs; fourteen sheet summaries had no disclosure triangles. No request, message, cell or task was submitted during acceptance.

This evidence is **not** a claim that every page, role, OAuth flow, voice recording, call or performance target was certified. The empty text/numeric sheet row measured about 123.6px versus 133.6px in the earlier audit; that is a density improvement, not a completed Notion grid.

### Required for subsequent work

| Dimension | Acceptance coverage |
| --- | --- |
| Public | Home/feed, Discover/booking, Artists/gallery/detail, Events/detail/host, Communities/detail/create, Circles/person, Objects, People/Ambassadors, Join/Sign in/recovery and onboarding |
| Workspace | Focus, Work projects/list/board/task/request, request/meeting editors, Connect channels/DMs/threads/media, private/shared Cosmos, account/profile and every Manage tab |
| Tools | Library, folders/notebooks/notes, sheet types/menus/filter/sort/pagination, references/attachments, conflicts and planned AI review/apply/undo |
| Geometry/state | 320/390/768/1024/1440px, phone landscape, 200% zoom, real mobile keyboard, long content, reduced motion, loading/empty/failure/read-only and unsaved input |
| Authority | Owner, member/collaborator, authorized leadership, ordinary staff, non-staff and guest; account switch, revocation and changed shared-source/room access |
| Scale/reliability | Larger synthetic fixtures, concurrency/idempotency, reconnect/backfill, source/media denials, slow reads and measured latency/interaction/frame behavior |

Remaining work is explicit: complete source reconciliation on GitHub; every-role/subpage acceptance; physical-device/keyboard/zoom/landscape checks; performance traces and route-scoped bundle work; full Notion-like row/grid/column interaction; formulas/export/exact-decimal calculations where approved; AI-cell review/apply/undo and verified external enrichment; and separately authorized paid-call enablement. Keep these in planning until implementation and acceptance evidence exist.

## Historical release notes

The following original October 7–10 notes are retained for provenance. Their words “latest”, “current”, “LIVE”, route counts, module inventories and source/credential observations apply to those historical releases only. The current snapshot, boundaries and source-coverage warning above supersede them. Historical Plug terminology is preserved as release evidence, not the current product label.

## Latest release — Unified Search V4 & Plug story cards (10 October 2026)

**LIVE:** [Communiverse](https://espacios.me/communiverse/) now uses `communiverse-search-v4-20261010` for the six public page families: Homepage, Artists, Events, Communities, Discover and Plug. The same release is active on both `espacios.me` and `www.espacios.me`. Earlier V3/booking release notes below remain historical references.

- Communiverse-aligned 52px search fields, compact borderless AI action, aligned Region/Where/What controls, responsive ordering and consistently layered AI suggestions. Existing input values, filters and click handlers are preserved.
- Plug's `Read their story` action remains inside its white profile card. Only portrait circles crossing that button temporarily clear during animations; they return when the story closes.
- The release was made with **14 new narrowly scoped routes** (8 page-family routes + 6 versioned assets) and **4 existing routes updated in place**, not a global `/communiverse/*` proxy. All 18 route IDs and rollback order are in [deployments/20261010-communiverse-search-v4.md](deployments/20261010-communiverse-search-v4.md).
- Underlying Workers for Marketplace, V3/Workspace, booking, identity, authorized AI knowledge, Supabase and D1/R2 remain unchanged. The production search gateway has no QA scripts or staging-only POST block.
- Staging: 583/583 real-public-page responsive checks, 102/102 component checks, 48/48 Plug story states; GitHub CI passed. After deployment, 12/12 mobile/desktop public-page checks passed; www, private APIs and existing V3/booking paths were also checked. Real signed-in AI POST and account-specific workflows still require authenticated end-to-end QA.
- Source: [worker/search-v4](worker/search-v4) · [merged PR #17](https://github.com/gugmaae-prog/communiverse/pull/17).

---

## Homepage compact artwork reader — 10 October 2026 (latest)

On [Communiverse](https://espacios.me/communiverse/), selected artwork now occupies **3 of the 5 desktop feed columns** (2 at tablet widths, full available width on mobile). The related artworks directly beneath it use their own regular two-column grid with aligned 4:5 image frames, readable artist attribution and native recommendation clicks. All artwork images are fitted without cropping/stretching.

**Source:** [worker/experience-v3/experience-v3.css](worker/experience-v3/experience-v3.css) · [PR #16](https://github.com/gugmaae-prog/communiverse/pull/16) · [deployment and rollback](deployments/20261010-homepage-compact-reader.md).

This was a **CSS-only** update to the existing V3 Worker, with no Cloudflare route, API, media, account, D1, R2 or Supabase changes. Staging verified 174/174 real-gallery assertions across six widths and 44/44 existing workspace fixture checks. The previous V3 Worker version remains available for rollback. Authenticated workflows were not tested here.

---

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
