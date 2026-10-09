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

## Safety / release gates
No production routes, APIs, Supabase records, D1/R2, credentials, auth, booking submissions or AI services changed.
Staging gateway blocks POST intentionally. Its search design can be reviewed but live AI requests and form submissions must not be attempted there.
Before production: inspect mobile/desktop rendered visuals and keyboard focus, check AI result panel and Escape, verify search filter refetch and URLs, test real authenticated search and ensure no UI overlap.
Release public pages incrementally; avoid broad /communiverse/* routing. Retain exact rollback route IDs.

Current production status: UNCHANGED; V3 homepage/workspace, booking Worker on Discover/Artist, original Marketplace elsewhere.