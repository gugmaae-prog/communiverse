**Historical staging note:** The V4 public search and Plug corrections were subsequently promoted to production on 10 October 2026. This document records pre-release staging constraints; production does **not** use its read-only proxy. For exact live Worker version, routes, preserved backends and rollback, see [deployments/20261010-communiverse-search-v4.md](../deployments/20261010-communiverse-search-v4.md).

# Communiverse search v4 — reusable public search (staging only)
Date: 10 October 2026.
Status: STAGED ONLY; NOT LIVE. Do not merge or deploy without final review.

## Design and behavior
Preserve Communiverse's neutral editorial look: same background tokens, translucent white surfaces, controlled rounding, 52px fields, understated focus states and compact typography. No decorative redesign or changes to the artwork feed.
Homepage search and Region align in one concise desktop row. On phones search is full width above filters.
Artists uses the same search and Region layout. Events uses query, Where and What aligned as a toolbar. Communities uses query, craft, and location. Discover preserves its collection keyword search, sort, chips and unrelated booking forms. Plug preserves people search and its network pagination.

## Technical implementation
worker/search-v4/search.css: contextual responsive search styles.
worker/search-v4/search.js: idempotent adapter wraps the ORIGINAL public search input. Moves the ORIGINAL asynchronously injected Search with AI button into the search row without replacing its event listeners, input, panel or filter controls. Uses native accessibility names and SVG magnifier.
worker/search-v4/staging-gateway.mjs: read-only staging Worker proxying existing Marketplace, V3 homepage, booking and V2 assets. No D1 or secrets, no original Worker replacement.
worker/search-v4/qa-fixture.html and qa-runner.js: delayed AI button fixture and public-page browser QA.
Workspace prompt/search is intentionally not modified because authenticated roles and task forms require separate end-to-end QA.

## Staging validation
Fixture tests: 18/18 at 320px, 18/18 at 390px, 18/18 at 768px, 19/19 at 1280px, 19/19 at 1440px.
Real public-page browser tests at 1280px: Homepage 15/15, Artists 15/15, Events 15/15, Communities 15/15, Discover 15/15, Plug 12/12.
Mobile/public tests: Homepage 320/390 14/14 each; Artists 390 14/14; Events 390 14/14; Communities 390 14/14; Discover 390 14/14; Plug 390 12/12; Events 768 14/14.
GitHub Actions search-v4 source syntax and no-mutation invariant checks: passed.
An extra browser measurement injection timed out and is NOT counted as passed.

## Plug story-card overlap correction — staged after visual feedback

**User-observed problem:** 'Read their story' extended below its white card into the circular portrait constellation on the Plug preview. Raw JSON test results were also visible at the end of preview pages.

**Verified root cause:** The existing marketplace stylesheet imposes `max-height:180px` on Plug `.glass-card`. Its story content needs ~193px of scroll height, so the 36px button extended ~14px below the rendered white card. The orbit layout measures the truncated card bounding box, making the overflow collide with nearby circles.

**Scoped correction:** On desktop, only the collapsed Plug work card now uses its natural height (about 209px in the tested case), so the button sits ~15px inside its card. The existing orbit placement and ResizeObserver remain authoritative. On mobile, the native story card and portrait constellation are preserved. A Plug-only focus-clearance helper temporarily fades **only** portrait circles crossing the story CTA during animated transitions; it does not hide all portrait circles or replace/move existing nodes. On closing/switching profiles, circles reappear.

**Preview cleanup:** Normal staging pages no longer automatically inject the raw QA reporter. Explicit `?cv4qa=layout` and `?cv4qa=plug` modes keep testing available without exposing diagnostics to reviewers.

**Actual-browser Plug checks:** 8 states (initial collapsed, expanded, collapsed again, five distinct artist profiles) at each of 320, 390, 768, 1024, 1280 and 1440px = **48/48 passing states**. The story button remains inside its card, with no visible portrait/button or gallery-link/button intersection in tested states. At 390px the expanded view kept at least 117 of 127 portrait circles visible, and all 127 returned on close. Expanded CTA remains reachable by scrolling at 320px. The Plug layout/animation fix does not modify search/booking/backend data or its original click handlers.

**Cross-site search regression:** Homepage, Artists, Events, Communities, Discover and Plug at 320, 390, 768, 1024, 1440px = **583/583 passing checks**. GitHub Actions including syntax checks of both new Plug scripts passed.

**Remaining gate:** This is still a *read-only Cloudflare staging release*. Production routes and data were not changed. Signed-in workspace and real AI POST requests are untested in staging by design and must be checked before production promotion.

## Final pre-deployment visual regression audit — 10 October 2026
Source screenshot: the old prominent AI Search pill sits against the search field border and looks clipped.
Root causes found and corrected in staging:
1. Nested pill border within a second rounded search border: replaced the existing AI button's visual content with a compact 44×34 borderless control (13px sparkles SVG + AI). The ORIGINAL clickable button and its listener are reused. Aria label and tooltip remain Search with AI.
2. Legacy AI button align-self:start positioned the button near the top field border on Discover and Plug; overridden with align-self:center and consistent dimensions.
3. Events filters appeared above primary keyword search around 768–790px; explicit responsive grid rows put keyword search first, location/type directly below.
4. AI suggestions appeared behind adjacent content on desktop/tablet for Communities and Discover; the toolbar/search field elevate their stacking only while a suggestion panel is open, preserving normal page layering.
5. Input overflow, label alignment, keyboard semantics and suggestion panel clipping were covered by additional browser tests.

Final staging results:
- Real public pages (Homepage, Artists, Events, Communities, Discover, Plug) at 320, 390, 768, 1024, and 1440px: **583 / 583 browser assertions passed**, zero failures across 30 cases.
- Representative delayed-AI fixture at 320, 390, 768, 1280 and 1440px: **102 / 102 assertions passed**, preserving original input/change events, AI button action and selected native Region control.
- GitHub Actions source syntax and presentation invariant checks passed on latest branch.

Boundaries:
- This remains a **draft staging change**, not production. No DNS/Worker production routes, accounts, D1, Supabase, uploads, or original search API have been touched.
- The staging gateway deliberately rejects POST requests; real successful AI model output and user-specific workspace search still require authenticated live end-to-end verification.
- A human final visual review of the staging preview is recommended before promoting; the earlier optional screenshot extraction was not independently certified.

## Safety / release gates
No production routes, APIs, Supabase records, D1/R2, credentials, auth, booking submissions or AI services changed.
Staging gateway blocks POST intentionally. Its search design can be reviewed but live AI requests and form submissions must not be attempted there.
Before production: inspect mobile/desktop rendered visuals and keyboard focus, check AI result panel and Escape, verify search filter refetch and URLs, test real authenticated search and ensure no UI overlap.
Release public pages incrementally; avoid broad /communiverse/* routing. Retain exact rollback route IDs.

Current production status: UNCHANGED; V3 homepage/workspace, booking Worker on Discover/Artist, original Marketplace elsewhere.