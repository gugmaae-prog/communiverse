# Communiverse accounts on Supabase

Cloudflare Worker `communiverse-workspace-ux-v3-20261009` serves the public site and account pages. Supabase project `ypkfganbwdvcjrcxygta` stores the private account tables and authenticates passwords. IDrive E2 continues to serve public media. The original D1 account tables remain intact for rollback and historical data.

The 20-table D1 account export was reconciled and imported into the private `communiverse` schema. Migrations `003_auth_profile_schema.sql`, `004_username_contacts.sql`, and `005_legacy_auth_identity.sql` add Supabase Auth linkage, unverified contact details, rate limits, and a separate internal login identity. The private tables have RLS enabled and no `anon` or `authenticated` table grants.

## Current account flow

- New members choose a username and password, then enter a contact email and phone with country code. These contact fields are **unverified**. They do not trigger email or SMS and never claim an existing member by matching email.
- Supabase Auth receives an internal non-deliverable `@accounts.communiverse.invalid` address and password. The public account page displays the member's contact email and phone, not the internal Auth address.
- Signup shows a high-entropy recovery code once. The code is stored only as a hash. A signed-in member can rotate it after confirming their current password. Password recovery consumes the code once.
- An existing D1 username and password can be used at the new sign-in. On the first successful login, the gateway verifies the historical PBKDF2-SHA256 password, creates the Supabase Auth identity, links the **same member ID**, and shows a recovery code. Hidden member records remain eligible for sign-in; their public visibility is unchanged.
- The public Cloudflare Worker calls `communiverse-account-gateway-v1` using a secret held only in Worker and Edge Function configuration. The gateway enforces database-backed IP rate limits. `communiverse-profile-v1` reads and edits only the authenticated member's profile. The browser receives HttpOnly, Secure, SameSite=Lax session cookies.

As of 2026-11-11, Worker version `ad2cd8ed-a439-4acb-bc5d-bc78a19cecb4` serves 100% of public traffic. The previous account version `36d6c113-6e0d-4873-b0e0-0ff51e4d7179` is retained at 0%. The original paused-account version `aec9fa7e-82fc-4ba0-be03-75eb50cc688e` is also retained in version history. Normal public checks returned 200 for home, Circles, Join, Sign in, and recovery; a disposable account completed signup, profile, logout, and login. The 0% candidate passed new-account recovery rotation and legacy first-login tests. All disposable records were removed.

## Remaining boundaries

The older D1 workspace and community write routes are still paused by `CV_ACCOUNT_CUTOVER_READY=false`; this release restores account creation, sign-in, profile editing, and password recovery through Supabase. Staff capabilities and the wider workspace need a separate migration before those features can be called fully restored. Contact email and phone verification are deferred until a delivery provider is configured. Do not flip the D1 cutover flag to enable them.

`stage-account.mjs` pins the currently observed public deployment and stages a Worker version without sending it traffic. Update its pin only after verifying the active deployment. Do not commit the service-role key, gateway secret, or private D1 export. The old Worker version can be restored with a version deployment if public checks fail.
