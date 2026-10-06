# Communiverse Plug: liquid-glass person focus

## Production

Published 2026-10-06 14:08:17 UTC. Rechecked with ordinary public requests at 14:09:19 UTC, no version override.

- Page: https://espacios.me/communiverse/plug/
- Worker: communiverse
- Worker version: 75465bdc-bd1c-4efb-a987-63b93a36f7b7 (30)
- Deployment: 2edb8ba0-512b-4770-9498-b661bcdc4394
- Traffic: 100%
- Release: 20261006-plug-glass-1
- Runtime markers: window.__cvPlugRelease and window.__cvPlugFocusRelease
- Source commit: bc14e0de03674118e3f6c8f59f0105e94d595d84
- Rollback: 272972e0-5952-441b-9e0c-d01a72f3b98c

## Behaviour

Selecting a visible circle now happens in place. The selected portrait moves to the horizontal viewport centre; every other visible portrait moves left and remains clickable. Three liquid-glass cards appear on the right with identity/role, a short work summary, and links. Selecting another person returns the former person to the left group while the new person moves to centre and the cards update. Closing or Escape restores the original cluster coordinates. No full-page navigation or modal scroll-lock is used for selection.

Desktop: left group, centred portrait, right cards. Mobile: a compact left portrait strip, centred portrait above, readable cards below/right rather than squeezing three text columns into 390px. Under 360px the left strip uses one column. Filters and close/link controls have at least 44px height. The animation uses one interruptible requestAnimationFrame spring loop, cancels overlapping panel animations, and responds to prefers-reduced-motion changes. Source photo bytes are unchanged. Failed upstream portraits display an initial rather than an empty circle.

The five explicitly supplied Instagram links are mapped to Elferah, Luna, Haseeb, Louis and Keiffer. Existing labelled ambassador handles @_turbooz and @abdallah_mahmoudd are retained as Instagram links. No additional handles are guessed. Work text is limited to public-facing role/focus descriptions from user-provided labels and existing public profile fields. No financial terms, private contacts, internal operating model or confidential source documents are published. Instagram posts are not scraped or embedded.

## Exact deployment mapping

- focus.js -> focus-script.txt (text module)
- focus.css + newline + focus-layout-fix.css -> focus-style.txt
- profiles.json -> focus-profiles.txt
- handler.js -> focus-entry.js (new main module)

The new main delegates unrelated requests to the retained people-entry.js. It only serves the Plug page and the two new versioned JS/CSS URLs. Previous versioned files and all existing person-detail pages remain available. The old page's animation script is replaced only in the new page response so two controllers never animate the same nodes.

All 62 original modules, including 29 binary media/portrait modules, were compared byte-for-byte and retained. Asset configuration and bindings were also compared and unchanged. No D1/Supabase/account/profile writes, no other Worker edits, no PR merge.

## Verification

Staged with 0% traffic before promotion. Final candidate checked at 320, 390 and 1440px. Ordinary post-deployment browser checks at 390x844 and 1440x1000 confirmed:

- Page and new JS/CSS: 200 with 20261006-plug-glass-1.
- Correct runtime markers, 73 retained presentation records, all ten supplied PNG portraits loaded.
- Selected portrait horizontally centred within 0.002px in the captured live checks.
- Every other visible circle moved left; three work cards shown; selected person's Instagram matched the supplied URL.
- Switching people kept the URL on /communiverse/plug/ and moved the former selection left.
- Close cleared selection without leaving the body fixed or scroll-locked.
- Document widths exactly 390 and 1440, no horizontal overflow in those checks.
- Team and Ambassadors filters retained 7 and 3 curated portraits in staged testing.
- Twenty rapid switches retained one panel and one selected node, with correct final content.
- Closing restored original circle geometry with 0px measured error in staged testing.
- Close control measured 44x44px, including at 320px.
- Captured Plug runtime error arrays empty.
- Existing homepage, ambassadors, makers and contact pages retain 200 and their prior release headers; sampled private/internal/admin routes retain 404.
- Prior rugs video byte range still returns 206, bytes 0-15/2834804, 16-byte body.

Reduced-motion selection, switching and Escape were additionally tested in an offline Chromium fixture with actual reduced-motion emulation; URL operations were adapted to the about:blank fixture. This was not physical-device testing. The production work did not retest a successful waitlist submission; its original handler and bindings were preserved.
