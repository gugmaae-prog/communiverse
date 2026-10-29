# Public release and account-page recovery

## Recon map

The production Worker remains `communiverse-workspace-ux-v3-20261009`. Before this repair, version `3879ee91-5f0f-44db-a412-df034a2f1142` served 100% of traffic and full A-K candidate `29964e9f-2d18-4405-b5be-f72e02ff9e08` remained at 0%. The community/scroll refinement in #48 was source and preview only. No browser-cache refresh could make it appear in production.

Both live header buttons lead to the existing Espacios account routes. Anonymous GET requests to `/communiverse/sign-in/` and `/communiverse/join/` return Cloudflare Error 1101. A bounded, self-IP Worker tail captured a D1 daily row-read limit exception from the retained Marketplace service. This is current capacity evidence, distinct from the older storage-capacity blocker. No account data was read or exported.

## Isolated release

`public-experience-entry.mjs` dispatches only reviewed public GET/HEAD pages, public Home pagination, and fresh v28 client assets to the current public presentation. All mutations, providers, protected routes, old versioned clients and account traffic retain the production v25 implementation. The public presentation export omits the new form, account-origin, security-policy and SEO middleware.

The v25 source is pinned to the reconciliation commit in `manifests/public-experience-source.json`. Its only runtime patches are the exact already-live public cursor repair and compatible Durable Object implementation, each pinned by SHA-256. Relocated imports continue using all 146 unmodified retained modules. The new profile uploads only the 321 existing public assets, excluding all 55 pending sharing images. Existing plaintext settings, service/D1/KV/email bindings and server-held secrets are preserved. No Durable Object migrations or namespace changes are introduced.

New account-page handling catches service failures on the original Sign in/Join URLs and shows a private, branded HTTP 503 recovery page instead of a Cloudflare exception. It sets Retry-After, never sets cookies, never reflects query strings or stack traces, and preserves provider callbacks. Normal successful account responses are unchanged. Actual sign-in cannot succeed while D1 refuses authentication queries; the recovery page does not claim otherwise.

## Verification

- Both standard and isolated public builds pass; lint passes; 53 tests pass.
- Public-profile tests execute the actual bundled runtime, verify all 45 Home-eligible works and 48 directory/Circles works, compare mutation/provider/cookie responses against the separately built retained v25 reference, and exercise database-limit recovery.
- All 146 retained-module, 321 original-static and 55 site-fix asset hashes verify. Only the original 321 assets are included in this publication profile.
- Existing full A-K promotion gates remain intact. A separate public-only acceptance gate requires the source boundary, public crawl, Circles geometry, retained mutations, graceful account failure and a recorded rollback. Account cutover and sharing-image promotion must both remain false.
- Stage at 0%, verify using a Cloudflare version override, then promote only after acceptance. Keep the full A-K candidate at 0% after promotion and retain the previous 100% version as rollback.

## Remaining blockers and human inputs

Cloudflare's daily D1 query limits reset at midnight UTC, currently 04:00 Dubai time. Successful authenticated reads/writes, registration persistence and provider end-to-end acceptance remain blocked or unverified until capacity is available. No billing changes are authorized. The earlier storage-capacity condition and LinkedIn configuration still need separate rechecks. Pending sharing-image approval and real form-delivery acceptance remain requirements for the broader A-K release; this public profile does not enable those changes.

Legal draft placeholders, workshop facts and Hira's portrait remain existing human inputs. The public profile preserves the real catalogue, all 14 community records, Hira's initials fallback, Gemma's three works and all existing public portraits.
