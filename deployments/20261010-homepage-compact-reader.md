# Communiverse homepage compact reader — 10 October 2026

**Release status:** LIVE (CSS-only change to existing V3 Worker)

## Issue

The selected artwork on the homepage occupied all five columns of the desktop feed because the existing V3 rule explicitly set `grid-column:1/-1!important`. Its nested related-work grid reused the generic 8px masonry auto-row system, resulting in tall, scattered recommendation cards and misaligned images.

## Exact change

File: `worker/experience-v3/experience-v3.css`
PR: https://github.com/gugmaae-prog/communiverse/pull/16

Only the inline homepage reader and its contained recommendations changed:
- At viewport widths >=1200px, selected artwork spans **three of five** desktop columns.
- At 701-1199px, selected artwork spans two columns; internal hero and credits stack when needed.
- At <=700px, selected artwork spans both phone columns and remains readable.
- Related recommendations are a separate two-column CSS Grid with natural rows instead of nested masonry spans; at <=360px, a single column.
- Suggested artwork media uses equal 4:5 frames with `object-fit:contain` (no cropping or stretching). Artist names, titles, click handlers and saved-state controls remain intact.
- V2/V3 JavaScript, service bindings, backend APIs, account/session storage, and all other routes unchanged.

## Cloudflare production

Worker: `communiverse-workspace-ux-v3-20261009`
New version: `d7c00c62-a512-428c-8125-f374048b05c2`
New deployment: `a8ea6a7f-fa70-4aae-9054-34995178532d`
Rollback version: `7f92c45c-0cb1-4164-866e-d9d7ffa29d3b`

**No route changes.** The existing four exact homepage/workspace routes and V3 stylesheet/script paths remain as configured. Service binding remains MARKETPLACE -> communiverse-marketplace.

## Verification

- **174/174** public-gallery staged browser checks at 320,390,768,1024,1280,1440px (29 each) using real Communiverse artwork and item API. Tests cover opening a real artwork, URL update, responsive width, image sizing, related recommendation grid columns, natural row heights, no overlap, titles/artist links, image `object-fit:contain`, clicking related artwork to a different work, no stale expanded tiles, and no horizontal overflow.
- Desktop 1440: 5 feed columns, selected card `grid-column:span 3`, width ratio **0.593**; suggestion grid 2 columns, `grid-auto-rows:auto`.
- Tablet 768: 3 feed columns, selected spans 2, width ratio 0.656. 1024: 4 feed columns, selected spans 2, ratio 0.488.
- Phone 390: 2 feed columns, selected fills available width, related has 2 columns; 320 has one related column.
- **44/44** existing V3 mocked workspace fixture regression checks (390,1440) pass.
- Both GitHub CI workflows passed before merge.
- Post-production read-only: homepage/workspace on apex and www render normally, V3 CSS URL returns revised 17,725-byte source with `grid-column:span 3!important`, and original MARKETPLACE service binding is preserved.

## Safety and limits

No signed-in live-account E2E or mutation was performed. The modified CSS has no selectors for tasks, accounts, authentication, uploads, database or workspace components. The live production homepage was smoke-tested after deployment; the full interaction suite was run on the matching isolated staging Worker.

## Rollback

Cloudflare Workers deployments allow restoring version `7f92c45c-0cb1-4164-866e-d9d7ffa29d3b` of the **same** `communiverse-workspace-ux-v3-20261009` Worker. Revert only that Worker, not the original marketplace Worker or DNS/routes. No database rollback is necessary. Check homepage opening, related cards, workspace and CSS after any rollback.
