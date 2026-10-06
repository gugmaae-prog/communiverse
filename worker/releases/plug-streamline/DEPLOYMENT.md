# Communiverse Plug — streamlined styles, separated portraits and profile enrichment

## Live deployment

- Page: https://espacios.me/communiverse/plug/
- Worker: `communiverse`
- Version: `53b3f842-67cf-4241-864b-f21a597952ce` (39)
- Deployment: `9e581a2e-c7c2-444d-9db2-2982aeb8b72e`
- Published: 2026-10-06 15:25:32 UTC
- Public traffic: 100%
- HTTP release and browser marker: `20261006-plug-streamline-2`
- `window.__cvPlugRelease` and `window.__cvPlugFocusRelease` expose the release.
- Final public verification: 2026-10-06 15:27:04 UTC, ordinary requests with no version override.
- Pre-task rollback baseline: `04c383d6-9d41-4125-b3c2-e29e7169cbb8` (`20261006-plug-glass-2`).

## Exact scope and preservation

The live baseline was newer than the previous chat description: the four requested tabs and confirmed Haseeb/Keiffer presentation deduplication were already present. They were preserved rather than reverted.

This release wraps the actual retained production Worker, not repository main. All 69 pre-task modules, including 29 binary image/video modules, were compared byte-for-byte and retained. Static-assets configuration and the ASSETS, WAITLIST_DB, WAITLIST_LIMITER and WAITLIST_NETWORK_LIMITER bindings are unchanged. No D1/Supabase writes, account merges, invitations, messages, private-contact reads or other Worker edits were performed. No PR was merged. Previous immutable Plug assets remain available.

An initial `20261006-plug-streamline-1` refinement was promoted, then the ordinary live stress check caught one transient mobile collision during fast filtering. The final `streamline-2` release adds a post-projection radius bound. Final staged and public checks detected zero contacts. The first revision remains available as a previous asset version, not the active page release.

## Styles

The original Espacios root and `/plug` were read live. Their common typeface is `-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif`, not the mixed monospace/Fraunces treatment previously used on this page.

The new Plug page uses that native font across headings, copy, tabs and controls, with Espacios ink #172033, muted blue-grey text, restrained borders and a clean #f3f6fb canvas. The old dot pattern and decorative confetti are absent. Liquid glass remains limited to the detail cards. Unused Google font requests were removed from this page only. Source portrait bytes were not changed or generatively altered.

## Tabs and records

Only these four tabs are present: Communiverse, Cool Kids, Ambassadors, Artisans.

The observed public presentation contains 68 records: 7 Cool Kids, 3 Ambassadors and 58 remaining public Plug records under Artisans, as directed by the user. These are directory records, not a claim of 68 verified artisans or unique authenticated people. Existing organization and non-craft records were not silently deleted or described as vetted craftspeople.

Communiverse displays an airy 11-portrait composition per page, with pagination for the remainder. Other categories show up to 8 per page; all seven management and all three ambassador portraits are accessible in their respective tabs.

Haseeb is represented once as `cv-haseeb-wasim`, with `Founder & CEO`, and is the only record marked as the Communiverse founder. His user-supplied sitting-on-grass portrait remains `/communiverse/_public/portraits/20261006/haseeb-wasim.png`. His matching public Plug summary/location/chips and profile link are merged in presentation; the original account remains unchanged. The explicit profile action links to `https://espacios.me/plug/u/haseeb-wasim-5626fe`.

## Interaction and separation

Clicking a portrait stays on the page. The selected portrait moves to the viewport centre; the other visible portraits gather to the left, remaining selectable. The details appear on the right on desktop and below on narrow screens. Switching updates the existing panel and returns the previous selection to the side group. Close/Escape restores the original composition. There is no body scroll lock.

The layout uses minimum-travel peer assignment, an interruptible spring controller, a separation projection each frame, and a final radius bound. The projection is applied to display coordinates without feeding collision displacements into spring state, avoiding equilibrium deadlocks. The final radius guard only contracts displayed circles when required during crowded transitions; original image bytes and settled dimensions remain intact.

Resting Instagram icons are absent. Selecting someone with a supplied account reveals a recognizable Instagram camera icon inside a 44px control. Existing handles are preserved. No Instagram posts are scraped, embedded or automatically imported.

## Public-profile enrichment and source boundaries

Each enriched detail card includes its public source links. Identity matches use supplied labels/companies/handles, not facial recognition.

- Haseeb: Communiverse founder affiliation corroborated by Contra; business development, partnerships, market growth, KU Leuven and campus student-representation background from his public professional profile.
  - https://contra.com/haseeb_wasim_xg4avzes
  - https://ae.linkedin.com/in/haseeb-wasim
- Alison: the supplied Lil Horse association matches the professional profile discussing operational clarity, connected systems and decision-making. Her Communiverse role stays LatAm Regional Partner.
  - https://ae.linkedin.com/in/alison-gonzalez-lh
- Hassan: the supplied Blue Studio association matches his portfolio. Enrichment covers branding, UI/UX, typography, Faqeeri and Ministry of Men work.
  - https://www.behance.net/_bakhti_
  - https://www.behance.net/gallery/112413147/Faqeeri-Free-typeface
  - https://www.behance.net/gallery/187240475/Ministry-of-Men-Branding
- Luna: the podcast producer page explicitly links the supplied `viajera.deluniverso` handle. Enrichment is limited to travel/documentary storytelling and the published conversation about travel between Latin America and Europe.
  - https://shows.acast.com/historiasquemolestan/episodes/hqm-33-no-me-arrepiento-de-nada-ft-luna

Other team descriptions remain grounded in supplied public-facing role labels and existing profile text. In particular, an unrelated Abel Thomas/Emerson marketing search result was NOT assigned to the platform engineer. No guessed employment history, follower counts, licensing, private contacts, financing, compensation or internal operating terms were published. The source deck was not uploaded to the website or repository.

## Verification

The final guarded candidate was tested at 0% before promotion. Ordinary post-deployment checks at 390x844 and 1440x1000 confirmed:

- Page, new JS and CSS return 200 and the correct release.
- Exactly four requested tabs; counts 7/3/58; one Haseeb and one Communiverse-founder flag.
- All ten supplied portraits decode successfully.
- Selected Haseeb centred within 0.007px in the captured live sample; peers remain to his left.
- Correct Haseeb Instagram icon/link; no Instagram icon in resting state.
- Haseeb, Alison, Hassan and Luna source links appear with their corresponding details.
- Thirty rapid selections leave one panel with the correct final state; close restores the layout and unlocks scrolling.
- Final live spacing monitor: mobile 648 sampled frames, minimum gap 11.997px, zero contacts; desktop 560 frames, minimum gap 17.997px, zero contacts. Small rounding differences from 12/18px are rendering precision.
- Document widths exactly 390 and 1440; captured runtime-error arrays empty.
- Selected/closed layouts settle; the desktop controller can still be in the subpixel settling tail at the fixed 1.8-second sample, and subsequently reaches its final state.

Earlier staged checks also covered 320px and 768px layouts. A reduced-motion check used the same interaction script in an isolated same-origin frame with the preference simulated before startup, plus origin/history adaptations for srcdoc. Selection, switching, resize and Escape completed without animation. The final radius guard does not alter that preference branch. No physical handset or physical tilt test was performed.

Preserved-route checks: homepage, ambassadors, makers and contact return 200 with their previous release headers; internal/admin samples return 404; previous Plug files return 200. The retained rugs video returns 206 for Range bytes=0-15 with Content-Range bytes 0-15/2834804 and a 16-byte body. No successful live waitlist submission was performed; the original handler and bindings were retained unchanged.

## Source recovery

The exact source is retained in the pinned Cloudflare Worker version. `recover-release.mjs` is a read-only, checksum-verified recovery utility added to this branch; it was not executed during this deployment. It exports modules into a new local directory, not the separate static-assets collection. This documentation and utility do not make repository main production-equivalent.

New final modules:

| Module | Bytes | SHA-256 |
|---|---:|---|
| spaced-entry.js | 6352 | 0c87b427499fc3cec3a9be085a4302dc02c7fa387858288d893260aab24c91e9 |
| spaced-profiles.txt | 6192 | a003e7ae42f03133e8d5e5be6a13748221ef85410176681d36d1fe9706ebaec8 |
| spaced-script.txt | 19589 | 523d54ca02d03811a40fbcee47bc2a6aa3fa52d222378f9740c81354dd789168 |
| spaced-style.txt | 15833 | f04e7b847350ef185f925ab64b1cb6490fdc7622809a276a9f44cb51556552f2 |

Final main: `spaced-entry.js`; delegates unrelated requests to retained `streamline-entry.js`, then the previous production chain. Do not deploy a fresh checkout of main over this stack.
