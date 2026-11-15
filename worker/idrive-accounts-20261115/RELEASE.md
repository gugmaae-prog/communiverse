# Communiverse IDrive account release — 2026-11-15

## Production state

- Public host: `https://communiverseclubs.com/`
- Public Worker: `communiverse-workspace-ux-v3-20261009`
- Released version: `8b9e7e68-150d-4896-aa1f-2f23169a9aa3`, deployment `083f51db-5495-4364-b5aa-ec18a1ecccde`
- Rollback version: `82162bee-789c-4996-a4b7-2c814e39811a` at 0% in that deployment
- Private account service: `espacios-ai-router` version `212c1b07-2df1-4aee-89f1-5f771a4d0b57`, accessed only by version URL and bearer binding. The shared router's normal traffic remains on `ba0e47e8-5153-4ca5-8d13-46677e68861c`.
- IDrive E2: `espacios-store-f`, prefix `communiverse-private/20261115/`; account and session bodies use AES-GCM with an independent Cloudflare-held root.
- Username/password, unverified contact email and phone, one-time recovery code, profile updates, session revocation and logout no longer call Supabase at runtime.
- `CV_ACCOUNT_CUTOVER_READY=false` remains in the public Worker. This release restores account access; legacy D1 workspace/community writes are still paused.

## Migration evidence

- Live D1 `cv_accounts` (8), `cv_members` (11), and `cv_staff` (13) exactly matched the retained November 11 export before import.
- Imported 14 distinct legacy usernames: eight account rows and six staff-only rows. Seven of the eight account usernames share staff rows with identical password material. The eight original member IDs and staff associations are preserved.
- Second import read back all 14 encrypted records, with zero new writes and 14 already present.
- Legacy passwords remain PBKDF2-SHA256/100,000 until successful first login; login upgrades the record to the new six-stage KDF and issues a recovery code once.
- Supabase project `ypkfganbwdvcjrcxygta` is `INACTIVE` and SQL is unavailable. Available Auth audit logs for Nov 11 show 14 signup IDs and 14 matching deletion IDs; Nov 10 and Nov 12–15 show no signup events. Thus no additional retained signup identity was observed. This is log evidence, not a direct database inventory.

## Verification

- Private service health returned 200 with IDrive readable.
- Private service smoke: unauthorized 401; signup 200; duplicate 409; wrong password 401; login 200; session 200; profile 200; recovery 200; previous session 401; previous password 401; new password 200; one-use code 401; logout 200 and revoked session 401.
- Synthetic hidden legacy account: import 200, wrong password 401, first login 200 with recovery code, original member ID preserved, second login 200 with no second code.
- Staged public Worker at 0%: join 200, Circles 200 with `x-communiverse-release: idrive-accounts-20261115`, signup/profile/logout succeeded through the site.
- Normal public traffic after release: signup, account, profile, logout, login, recovery, old session invalidation, wrong password and new password all passed; Circles and sign-in returned 200. Existing IDrive public media bridge health returned 200.
- Follow-up navigation repair: `/sign-in`, `/signin`, `/login`, `/account/login`, and legacy Communiverse login paths now redirect to `/sign-in/`. A paused-account script had removed the header links; the replacement preserves account navigation while continuing to pause D1 workspace actions. Older public-domain JavaScript had rewritten live header links to `espacios.me`; both `v25` and `v69` navigation assets now keep account links on `communiverseclubs.com` with cache-busted URLs.
- After publishing the follow-up repair, real Chrome clicks from Discover, Events, Clubs, and Circles reached the sign-in form; mobile 320px and 390px widths and 667×375 landscape were checked. Normal public traffic without a version override passed home/mobile, Events/desktop, and Circles/landscape browser clicks.

## Operational limits

- Attempting to retain the private service in a 0% shared-router deployment failed with Cloudflare error `10136` because an unrelated `espacios-plug` R2 binding requires R2 to be enabled. The account service currently relies on its version-specific URL, as the Communiverse public media bridge already does. Do not delete that Worker version or change its URL binding while accounts depend on it. Move to a dedicated Worker with a Communiverse-scoped IDrive key when available.
- The IDrive credential's bucket-level scope was not independently verified. Application encryption and a hardcoded private prefix limit data exposure, but a dedicated bucket-scoped key is preferable.
- Contact email and phone are stored as unverified details. No confirmation or recovery messages are sent.
- Account objects and rate-limit objects have no storage lifecycle rule yet. Configure retention or cleanup before long-term growth.
- The local ignored `build/bridge-token` and `build/vault-root` files are required for service version updates. Preserve them securely; never commit them. The staging script refuses a partial secret set and reuses both existing values.

## Rollback

For the public Worker, deploy `82162bee-789c-4996-a4b7-2c814e39811a` at 100% and `8b9e7e68-150d-4896-aa1f-2f23169a9aa3` at 0%. This restores the last verified Circles sign-in route, though legacy navigation on the home, Events and Clubs pages can still rewrite Sign in to `espacios.me`. Keep the IDrive service version and stored accounts intact for a forward repair. Recheck ordinary public traffic after any rollback.
