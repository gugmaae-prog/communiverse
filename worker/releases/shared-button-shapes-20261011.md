# Shared action-button shapes — 2026-10-11

The public site and workspace accumulated different action radii: primary
`.cv-button` controls were 14px, secondary controls 12px or 28px, and newer
actions were already pills. `worker/shared-button-shapes.css` establishes a
single 999px action radius, scoped to the existing Communiverse action classes.
Avatars, icon controls, radio tiles and clickable content cards keep their shape.
Colours, sizing, focus states and interaction handlers are unchanged.

## Runtime integration

The production `communiverse-marketplace` Worker imports `social.css` in
`social-entry.js` and injects it into Communiverse HTML, including pages served
through the search, booking and workspace gateways. The source repository does
not contain the complete retained marketplace runtime. Append the shared CSS
to the active runtime's `social.css`; do not deploy the repository's legacy
Worker as a replacement for the current marketplace.

Release only the stylesheet delta, preserving every other module's raw bytes,
module MIME types, binding configuration and compatibility settings. Fetch
`/content/v2` to retain module types and binary media accurately. Upload a version,
test at zero traffic using version overrides, and promote the verified version.

## Released version

- Worker: `communiverse-marketplace`
- Version: `72869316-cf64-4e49-9293-5393fd47b083`
- Deployment: `a91e900e-adfd-4e34-96f1-dac64a7a3625`, 100% traffic
- Rollback version: `4a659bea-6915-4093-a7e7-8ab9c85ccfb4`
- Changed module: `social.css`; 118 other modules retained byte-for-byte
- All seven bindings and compatibility date retained

Validation: 14 canonical routes returned HTTP 200 with the shared rule, desktop
workspace at 1440px, mobile workspace at 390px without horizontal overflow,
request dialog opened with pill draft/send actions, and the legacy ambassador
page's existing pill CTAs remained intact. No forms were submitted during QA.
