# Communiverse shared glass system

The shared marketplace layer owns the palette, regular font weights, action labels, pill actions, circular icon buttons, input surfaces and round selectors. The retained workspace gateway adds topic-specific plans and permission-scoped guidance. Existing search, booking and marketplace wrappers continue to delegate to those workers.

Action labels are 14px with a 44px minimum target. Reading text is 15px; labels are 14px and secondary text is at least 12px. Mobile text fields use 16px. Headings range from 19px to 40px. All text is regular weight. The primary accent is #245ccc; muted text is #55647a. The product stays light regardless of the device's color preference. Forced colors and reduced transparency remain supported.

The outer sticky header is transparent, without a page-wide rectangle, divider or blur. Blur belongs to the floating navigation capsule. Plug's older fixed pseudo-element overlay is removed, and its cards, artist profiles, marketplace variables, and workspace status pills inherit the light palette. Browser theme metadata also stays light. `scripts/build-light-marketplace.py` patches the verified 125-module export, retaining historical focus assets and adding a new immutable focus URL for current Plug pages.

Native checkboxes remain independent selections and use the same circular dot presentation as radios. Workspace, feed and Plug navigation keep their original button semantics and selected pill styling, without selection dots. Arrow-key radio behavior applies only to actual radio groups. Person and request pickers keep their original form controls. X and trash controls retain the prior shared icon release and accessible labels.

The workspace renderer processes the leaf participant container once. Each person has one avatar, one named input and one search field per group. The feed displays repeated image/video references as text cards while retaining the original item and its detail/save actions. It does not delete catalogue records or deduplicate profile images across separate contexts.

`operating-guides.json` contains 12 general workflow guides covering recruitment, artists, events, content, sales, partnerships, business planning, communities, procurement, travel, product experiments and training. They are explicitly general guidance, not company policy or proof of completed activity. Existing D1 documents retain their audience rules, source dates and draft status. Guidance is retrieved only after the user opens the planner's guidance section; unavailable sources have a retry state.

Build the marketplace from a verified full production export with `scripts/build-glass-marketplace.py SNAPSHOT OUTPUT`. Its baseline module inventory and checksums must match; it preserves 117 of the 120 prior modules byte-for-byte, patches the entry/style/main client, and adds one presentation script. Never deploy the root legacy project to replace the retained marketplace.

Build the workspace with `node scripts/build-workspace-v3.mjs OUTPUT`. Build knowledge with `node worker/business-knowledge/assemble.mjs`; then run `node --test worker/business-knowledge/worker.test.mjs worker/experience-v3/tests/goal-planner.test.mjs`.

Browser fixtures: the existing 64-check workspace integration fixture, 22-check planner fixture and `guidance-qa.html` with 13 additional checks, plus `controls-qa.html` with twelve checks for legacy Plug markers, navigation without radio circles, genuine radio keyboard behavior, and independent selections and search borders and search action sizes keyboard focus and hidden states. Test actual CSS widths around 320, 390, 768 and 1440 pixels. Account for browser zoom when using device emulation.

Implementation references: [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) and [WAI radio group keyboard pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).
