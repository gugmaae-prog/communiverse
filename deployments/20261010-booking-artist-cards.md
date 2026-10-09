# Communiverse booking artist picker — 10 October 2026

**Release status:** LIVE; CSS-only correction to the session-booking artist selector.

**Affected public pages:**
- https://espacios.me/communiverse/discover/
- https://espacios.me/communiverse/artist/
- Artist detail URLs with query parameters.
- Equivalent www URLs.

## Root cause

The booking form renders artist options using `<label class="cv-pick cv-group-pick">`. A legacy `market.css` rule defines `.cv-pick { width:65px }`. The booking form adds display, padding and an internal grid but did not override that inherited intrinsic card width, producing very tall 65–120px-wide cards separated by large unused whitespace.

## Correction

Scoped stylesheet: `worker/booking-card-fix/artist-cards.css`.

- Scope ALL overrides under `html[data-cv-social] #cv-group-form #cv-group-artists`.
- Force grid item width 100% and stretch, clear inherited max widths.
- Two equal columns above 760px, one column on narrower devices.
- Artist portraits are 60px (52px on mobile), circular and never stretched.
- Names/descriptions wrap normally and remain readable.
- Native radio controls remain, preserving original form submission and artist IDs. Selected artist has an explicit blue outline around its portrait and a selected-card highlight.
- Keep the final "find a maker" fallback spanning all columns, with keyboard focus and reduced-motion behavior.
- No changes to booking prices, filters, artists, APIs, accounts or analytics.

## Cloudflare deployment

Worker: `communiverse-booking-cards-20261010`
Version: `ce5f7847-1769-4c4b-9709-d96ee050005d`
Deployment ID: `424b4663-db2b-47c6-af0e-35e32cdc5439`

Worker has only `MARKETPLACE` service binding pointing to unchanged `communiverse-marketplace`. It delegates all requests to that original Worker. For successful GET HTML on the two allowed paths only, it injects an inline scoped stylesheet. No data storage/secret bindings, write endpoints or migrations.

**New Cloudflare routes and rollback IDs:**
- `espacios.me/communiverse/discover/*` — `6ff77500dde446a59c069908d8c46662`
- `www.espacios.me/communiverse/discover/*` — `a8780184c41c4125bcf498fcaf52cd5c`
- `espacios.me/communiverse/artist/*` — `90122c23b9084388be7c2cbd1218fd67`
- `www.espacios.me/communiverse/artist/*` — `3d327dfd0b8a455d88ba4d0af9424aba`

All original catch-all `/communiverse*` routes, the V3 home/workspace Worker, Supabase, D1/R2/media, identity, auth and the AI knowledge Worker remain unchanged.

## Validation

- Isolated staging Chromium layout fixture derived from the actual `/api/booking/artists?country=AE&city=Dubai` response (9 real artist records).
- Six viewports: 320, 390, 600, 768, 1306 and 1440px; **42/42 assertions passed**.
- Checks: card width matches grid track, names remain readable, artist radio selection works, clear blue selected-state ring, no horizontal overflow, all controls remain in the original form.
- Browser screenshot inspected: cards appear symmetrically, readable, and selected state obvious.
- Live smoke checks: Discover/Artist on apex and www plus a query-parameter artist link all render the original page with `data-cv-booking-cards-fix="20261010"` injected; no literal `null` response. Home, Workspace and Plug unaffected.
- CI `Communiverse booking artist cards QA` passed after correcting a CI-only over-escaped assertion.
- Cloudflare observability: zero active issues reported at release check.

**Limit:** No booking was submitted during QA and live logged-in flows were not mutated. Browser rendering did not successfully wait for the async Dubai artist list to load on the real page; the visual interactive tests used the live catalog data in an isolated, representative form fixture. Do not claim a full authenticated booking flow certification.

## Rollback

Delete ONLY the four new route IDs above using Cloudflare Workers Routes API. The original `espacios.me/communiverse*` and `www.espacios.me/communiverse*` routes will immediately resume original styling. Do not change `communiverse-marketplace`, the V3 Worker, Supabase, D1 or R2. Verify Discover, artist page, booking form and a query-string artist link after rollback.
