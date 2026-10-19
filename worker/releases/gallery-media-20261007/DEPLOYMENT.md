# Verified gallery release

- Public URL: https://espacios.me/communiverse/
- Worker version: `a7ecd721-a8c6-441c-9cd6-fe643021994a`
- Deployment: `75ac8b6b-81e0-46b8-8a9c-9f610fefd926`
- Release: `20261007-gallery-media-1`
- Traffic: 100%.
- Implementation commit: `48190ece4be4d2d7546921fad7a674b24c5ae39d`.
- Rollback baseline: `274fb6c1-664c-4637-9c6b-63553ef4158b` (Plug ios-2).

An earlier candidate was uploaded against Plug ios-1 but never deployed. The production guard detected a concurrent Plug update. The final candidate was rebuilt from the latest version, preserving all 98 baseline modules byte-for-byte. Its 111 total modules, bindings, static assets, compatibility date, and observability were independently compared to the uploaded Worker.

The final candidate was staged at 0%. The staged homepage returned 200 with the new script reference; all ten new media assets passed content type and release checks; all five video Range requests returned 206 with the requested 16 bytes. Plug, Ambassadors, Makers and Contact all returned 200 with their existing release markers.

After promotion, ordinary public requests without overrides passed those same ten new media checks and the gallery script check. The public homepage returned 200 and the new script reference. The real browser rendered 25 cards, all five added video elements, and no document overflow. The live lettering video loaded to readyState 4 in the detail viewer at 390 × 844, with playback controls and no horizontal overflow. Closing returned focus to its gallery card. No runtime errors were captured in the live check.

Local desktop preview verified all five clips decode. Reduced-motion preview verified five paused videos with preload=none and readyState=0 after reload, with all 25 cards still navigable. The live reduced-motion preference was also toggled and keyboard navigation / viewer opening checked; the preference and temporary viewport were reset afterward.

Original media, Plug ios-2, waitlist, database bindings and unrelated pages are retained. No database writes, messages, profile edits, or PR merge were performed.
