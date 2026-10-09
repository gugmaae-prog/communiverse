# Communiverse — 9 October 2026: UX and AI Knowledge implementation

Status: PROPOSED / NOT DEPLOYED. Source design and testable implementation package prepared in the conversation. Do not deploy the legacy Next.js Wrangler configuration; production currently routes to communiverse-marketplace, and GitHub does not yet contain its complete source and binary modules.

## Screenshot-driven requirements

1. Header account: retain the user's avatar; visually remove the name; keep accessible name and keyboard focus.
2. Expanded artwork: give the primary image more space, preserve aspect ratio, use a wider editorial detail panel at desktop and full-width stacked layout on touch. Keep work credits, related content, back/close and masonry stability.
3. Related artwork: every recommendation card opens the selected work's actual detail view and refreshes further recommendations. Filter duplicates, hidden items, and unverifiable purchase availability.
4. Workspace assistant: answer “what are my tasks?” using typed task cards fetched from the authorized workspace API, NOT just a language-model paragraph. Include real title, project, status, due date, priority, owner and involved-person avatars; each avatar identifies its real person on hover/focus. Task cards deep-link to live task details.
5. File controls: provide consistent paper/glass appearance, selected filename and size, keyboard access, focus outlines and upload progress. Preserve native file inputs and real permissions; enforce sizes and content safety on the server.
6. Artist pipeline: show Assigned ambassador with photo and tooltip from cv_artist_assignments to cv_staff to cv_identity_profiles. The current pipeline view shows pipeline owner louis by default; that is NOT the ambassador. Do not claim Onboarded by without separate auditable provenance.

## Verified production facts (read-only audit)

- Cloudflare: communiverse-marketplace is the live router; D1 communiverse-waitlist; R2 communiverse-media; Supabase shared identity; Groq model; legacy Worker service.
- D1 catalog: 390 total, 160 works, 111 artists, 92 events, 13 videos, 11 venues, 3 ambassador catalog entries.
- Workspace: 6 projects, 16 tasks, 13 active staff. Artist assignments: 111, Ammar 43 / Luna 35 / Balo 33.
- Artist pipeline overrides: 0. Sale-ready artist products, artist transactions, workshop slots, ambassador earnings: 0 (do not fabricate commercial readiness).
- The existing assistant receives only 60 tasks + 40 requests in its prompt and generates plain-text answers. It needs source-aware structured response types.
- The current workspace/overview endpoint enforces project-scoped access; all new knowledge tools must reuse this server-side authorization, rather than relying on prompt instructions.

## Comprehensive knowledge domains

People and roles; reporting and review; task/project ownership and dependencies; approvals and requests; artist provenance; art and materials; credits and media; member communities; event discovery and confirmed bookings; artist studio inventory; communications, meetings and files; account/session privacy; source freshness and deployment health.

## Response contract

Use discriminated, validated types: task_collection, task_detail, approval_queue, artist_assignment_collection, artist_provenance, related_works, event_collection, file_collection, source-backed answer, and editable draft. Each record includes durable ID, link, source table/API, last-known timestamp, confidence/verification state, and permitted actions. The model produces explanatory language only; UI renders the actual cards and interaction.

## Safety invariants

- Authenticate and scope BEFORE retrieval. Never send all private D1 records to a model for post-hoc filtering.
- Separate assigned from onboarded, catalogued from verified, guide price from confirmed price, and discovered event from bookable slot.
- Do not auto-send, approve, invite, upload, purchase or modify records without an explicit permitted user action.
- Fall back to deterministic authorized records when Groq fails; distinguish unavailable, unknown, and unpermitted information.
- Follow the same image/token/identity handling as production; prevent XSS, dangerous upload types, unauthorized links, and cross-role data leaks.
- Keep keyboard accessibility and reduced-motion semantics.

## Rollout gates

1. Recover exact source/bindings and R2/ASSETS backup data for the active Worker.
2. Validate pure knowledge-model tests, static UI patch syntax and source-to-production parity.
3. Stage cosmetic UI changes and API additions without production traffic.
4. Run authenticated staff and artist E2E tests at 390, 768 and 1440px, including recommendations, task cards, mentions, uploads, authorization and rollback.
5. Promote only a verified version; monitor and keep rollback pointer.

Do not use this note or the companion package as a deploy entrypoint until source parity and authenticated browser tests are complete.
