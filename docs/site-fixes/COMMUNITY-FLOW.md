# Default artwork loading and intentional community flow

## Recon map and release state

- Live public v25: default SSR cursor differed from the browser's blank q/region query and returned 410. PR #47 normalizes blank filters. Version `3879ee91-5f0f-44db-a412-df034a2f1142` is at 100%, with broader A-K candidate `29964e9f-2d18-4405-b5be-f72e02ff9e08` retained at 0%. Both Home and Discover were independently traversed to 48 unique works without a For you reset. Authentication and existing runtime bindings are unchanged.
- This PR: preview/source refinement, based on #47. No visual candidate has been promoted. The new public asset namespace is v27 so a future release cannot reuse cached immutable v26 clients.
- Default Home client: the identity read delayed observer setup. It now prepares SSR records, controls and the observer before identity completes, preserving authenticated personalization after sign-in resolves.
- Home cursor identity now considers actual feed filters rather than attribution parameters. Initial q/region controls match the requested URL.
- Retained natural-browsing tools recycled offscreen Home cards after the last batch and compensated with scrollBy. The new separately versioned copy disables only the Home recycler, preserving existing chat and artist controls.
- Retained artwork client measured and wrote one card at a time. The new copy batches reads before changed writes, measures dirty cards, and stops dense backfilling. SSR and appended images reserve their verified dimensions and aspect ratios.
- Circles: random rectangle packing is replaced with alternating measured arcs. Additional members extend the community down the page, with consistent portrait sizes and 24px separation. Paths are decorative composition guides, not asserted relationships.

## Resulting interaction

Hover and keyboard focus reveal the actual role/location and give the portrait a 3px lift with a small 1.025 scale. Mobile shows the captions without requiring hover. Selection retains the clicked arc in place and inserts a context band below it; later arcs move together and restore on dismissal. A small native scroll reveals the opened content when it would be below the viewport. Normal page scrolling has no animation loop or position compensation.

The context band keeps background, Instagram/website links and every work. The artwork rail uses native horizontal scrolling, previous/next controls, and arrow-key focus movement. Choosing a work enlarges its upright image and opens its existing story, facts, full-image link and standalone page link. Empty-canvas clicks and Escape deselect in stages, returning keyboard focus to the portrait. No Circles close buttons are added.

Catalogue: 14 real people; six artists; 48 works across Works and Circles. Artist portfolios: Ms. Petunya 1, Chandni 11, Tamer 26, Sophiko 2, Cristina 5, Gemma 3. Home preview retains the three previously requested Home-only exclusions, leaving 45 eligible works. No record or portrait is replaced.

## Verification

- Build, lint and 47 automated tests passed. Added coverage executes the actual generated client with a delayed identity response, checks batched masonry reads/writes and unchanged spans, verifies SSR image dimensions, prevents Home recycling, and validates attribution/filter cursor boundaries.
- Original publication hashes: all 146 retained modules, 321 original static assets and 55 site-fix assets verified.
- Browser geometry: 375px phone, 820px landscape and 1440px desktop; all 14 portraits remain circular and no profile/context rectangles overlap. All six portfolios retain their exact work counts. First-arc selection preserves its positions; lower arcs shift together by 487px in the measured case and return exactly on dismissal.
- Native Escape and rail arrow keys verified. Empty-canvas dismissal also verified with a synthetic click on the actual listener. Reduced motion leaves zero running animations. No real-device touch acceptance is claimed.
- axe: zero automated WCAG A/AA violations on the selected mobile profile. The labelled artwork rail has an explicit group role. Translucent/image surfaces remain manual contrast-review items. New role text uses #526781 against the pale surface; all visible content remains readable in screenshots.
- Matched 1440 by 925 local run: layout passes 61 to 26; style writes 39 to 31; layout-shift entry sum 0.8385 to 0.0631 (about 93% lower). Both runs loaded all 45 eligible works without a For you reset. This is a single controlled comparison, not a full CLS session-window score or FPS guarantee.

## Remaining blockers and human inputs

The broader production release remains guarded by the existing live form-delivery/CAPTCHA acceptance and sharing-image approval. Account cutover remains disabled until D1 write capacity and all retained providers pass end-to-end checks; LinkedIn configuration is still unverified. This PR does not change DNS, billing, database policy, production submissions or accounts. Existing legal placeholders, workshop facts and Hira's missing portrait remain documented human inputs.
