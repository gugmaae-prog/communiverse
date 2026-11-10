# Communiverse account cutover candidate — 10 November 2026

This package restores the existing sign-in and join UI behind the two-part `CV_ACCOUNT_CUTOVER_READY` and `CV_APP_BASE_URL` gate. It retains the captured public Worker and its existing assets, media repairs, D1 data, service bindings, and secrets. It does not introduce new account tables or provider credentials.

## Source and build

Place the privately retained `public-worker.mjs.gz` in `modules/`. Its uncompressed SHA-256 must be `87370e2eb8aad872779d481ea60dcde3251e2c876048f6383c0cbe319808d5fb`; `optimizeBaseline()` rejects any other bytes. The source archive and generated Worker are intentionally ignored by Git. Run `npm ci`, `npm test`, `npm run build`, and `npm run smoke` from this directory.

The release wrapper routes branded account pages to the existing marketplace account service, corrects the public header, links, canonical URLs, and runtime account base, redirects legacy account navigation, and rewrites account API sign-in destinations. It preserves unrelated public routes and the earlier media response fixes. The social callback helper preserves the browser's host-only session cookie and rewrites account destinations.

## Current release state

The active `communiverse-workspace-ux-v3-20261009` deployment serves version `6f3e4ff8-d51c-4d4b-94eb-e3efdc59f209` at **100%**. Candidate `57df9d27-0f02-4ded-bc4a-b3424ba39099` is at **0%**. The candidate was built with SHA-256 `271b445c0d30e8590af1a8053af2d6823d39794dc54e26095e9bdc86f2e2e30c`, carries 23 inherited bindings, and keeps the existing static asset bundle. It must not be promoted yet.

Using a Cloudflare version override against the public domain, `/account/sign-in/` and `/account/join/` return 200 with their real forms; `/communiverse/workspace/` redirects to `/account/workspace/`; `/communiverse/api/account/session` returns 401 with the branded sign-in URL. The Google and LinkedIn entry routes still return 404 on the 0% candidate. The provider settings report both providers enabled, but no real sign-in or signup completed.

Cloudflare D1 rejects a reversible test write with `7500` and the explicit message `Your account has exceeded D1's maximum account storage limit`. The 15 listed D1 databases total approximately 12.07 GB; `communiverse-waitlist` itself is about 2.3 MB. This account-wide condition blocks OAuth flow rows, password registration, sessions, and other account writes. The write did not complete. The live account pause remains in place to avoid presenting nonfunctional forms.

IDrive E2 private media is also not connected. The Communiverse Worker has no IDrive E2 credential or secure service binding, and the available bucket is not a substitute for an authorized private-media route. No media was copied or moved.

## Release gates

1. Resolve the D1 account storage restriction without deleting unrelated databases or changing billing implicitly; repeat a reversible D1 write and read test.
2. Resolve the candidate's marketplace OAuth dispatch 404, then verify Google and LinkedIn redirect/callback origins and browser cookies with test accounts.
3. Complete password signup, confirmation, login, recovery, logout, staff/member role isolation, and a real mobile browser check with the existing Turnstile and email integrations.
4. Establish a scoped IDrive E2 credential or a reviewed internal service binding, then test private upload, authorized read, and backup integrity before claiming IDrive integration.
5. Only then promote the exact reviewed candidate and repeat ordinary public URL checks. Keep `6f3e4ff8-d51c-4d4b-94eb-e3efdc59f209` available for rollback.
