# Communiverse confirmation mail on a free sender

The current Supabase Send Email hook is shared with Espacios Mail. Communiverse signup and recovery require delivery to arbitrary new addresses, so the Supabase default mailer and Cloudflare Workers Free email binding cannot serve them. The existing AWS SES credentials are rejected. This release uses a Communiverse-only Resend path in the shared hook while leaving other Mail actions on their current route.

Resend's current free transactional allowance is 3,000 emails per month, up to 100 per day. It requires a verified sending domain. The code uses `Communiverse <accounts@auth.communiverseclubs.com>` so its DNS can be configured on a dedicated subdomain without changing the site's web records.

## Setup and release

1. Sign in to an existing Resend account or create a free one. Add and verify `auth.communiverseclubs.com`. Add the exact DKIM/SPF/MX records Resend provides to the Cloudflare zone; do not guess their values.
2. Create a **Sending access** API key restricted to that domain. Save it as the `CV_RESEND_API_KEY` secret on the `espacios-mail` Worker using Cloudflare's secret interface. Do not put the key in source code, a PR, or chat.
3. Run `npm run build` and `npm test` from `worker/supabase-accounts-20261111`. Check the candidate hash in `mail-hook/resend-cutover.mjs`; if the build hash changed, review the diff and update the guard deliberately.
4. Run `node mail-hook/resend-cutover.mjs apply` from the same directory. The script verifies the currently active Mail code and the secret binding, saves a local rollback copy, and preserves current Worker bindings.
5. Test signup and recovery to an inbox you control through the normal Supabase flow. Check that the confirmation link lands at `/account/confirm/`, the recovery link at `/account/reset/`, and both create valid Communiverse sessions. Check normal Espacios Mail login again.
6. Promote the staged Communiverse account Worker only after those mail tests pass. Repeat ordinary public checks for home, Circles, Join, Sign in, account, and media. If the Mail cutover fails, run `node mail-hook/resend-cutover.mjs rollback` before promoting Communiverse.

The Resend allowance is shared with any other use of the same Resend account. Monitor its daily limit and delivery failures; a free tier is not an unlimited sender.
