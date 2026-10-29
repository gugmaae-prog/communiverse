# Branded Communiverse accounts

Target: https://communiverseclubs.com/account/. Use fresh sign-in with existing accounts. Host-only cookies on the legacy host cannot and must not be copied to the branded host. No session-transfer tables or cross-domain credential exchange are introduced.

## Source and ownership

The reconciled Worker contains account password handlers and an adapter for retained account pages, authenticated APIs, workspace and profile connection routes. Registration, recovery, authorization, cookies and D1 throttles remain in their existing handlers. Google and LinkedIn sign-in initiation and some OAuth/email-link callbacks are served by retained Cloudflare application service bindings; their complete source is outside this reconciliation. The profile connection source also contains a fixed legacy origin. Those owners must make the callback/origin updates below and provide candidate versions before the cutover readiness flag may be enabled. Rewriting an authorization URL in the browser is insufficient.

`CV_APP_BASE_URL` is restricted to the existing legacy base or the reviewed branded target. The effective destination stays legacy unless `CV_ACCOUNT_CUTOVER_READY=true` and the target base is selected. Configuration is per request, with no mutable process-global origin. Public pages, navigation, generated clients, returned profile URLs and email messages use the effective destination. Existing host-only Secure, HttpOnly, SameSite=Lax cookies are retained. Personalized responses are private and no-store. Unsafe requests require the same Origin; retained tenant and role authorization still apply. Credential-bearing requests use in-process code and existing trusted service bindings, never a public proxy.

## Required order

1. Resolve D1 write capacity without billing changes in this task. Prove account registration, sign-in, recovery token consumption, logout and role-authorized writes in an isolated test tenant/database. Current metadata alone does not prove capacity.
2. Obtain the source/release owner for retained MARKETPLACE, profile connection, email-link and OAuth handlers. Configure their per-request Communiverse origin and return-path allowlist for the branded host. Keep legacy origin/callbacks operational. Do not apply this policy to other tenants.
3. In Google Supabase project `ypkfganbwdvcjrcxygta`, add `https://communiverseclubs.com/account/auth/callback/` to Auth URL Configuration redirect allowlist. Retain all existing legacy/mail callbacks and the project Site URL until their other uses are reviewed. The Google provider console redirect URI remains the Supabase endpoint `https://ypkfganbwdvcjrcxygta.supabase.co/auth/v1/callback`; no provider-secret rotation is requested.
4. In LinkedIn Supabase project `goyallnmiyvayxgwcpjz`, verify project access, the linkedin_oidc provider and its configuration, then add the same branded callback allowlist. The LinkedIn console callback remains `https://goyallnmiyvayxgwcpjz.supabase.co/auth/v1/callback`. Current project access/configuration remains unverified.
5. Both provider flows must request the branded callback above and preserve their existing PKCE verifier, single-use state, browser binding, provider issuer/subject and verified-email checks. Profile connection flows use that same branded callback and return to `/account/workspace/?profile=edit`. Ensure the correct handler receives profile-prefixed states. The existing mail.espacios.me relay remains for legacy flows only.
6. Recovery and confirmation email destinations use `/account/sign-in/` and `/account/confirm/` at the branded origin. Preserve token expiry, single-use consumption, no-referrer behavior and token removal from browser history. Test malicious `next`/return URLs and reject external destinations.
7. Verify the existing Worker custom-domain binding serves `/account/*` on communiverseclubs.com. The target uses the existing domain, so this plan requires **no DNS records**. Do not create app.communiverseclubs.com or change email DNS.
8. Configure production Turnstile and abuse/notification secrets, verify cookies and CSRF, then test every retained role, password sign-in, Google sign-in, LinkedIn sign-in, recovery, connected accounts, authenticated reads/writes and logout on a guarded candidate. Set `CV_APP_BASE_URL=https://communiverseclubs.com/account/` with readiness disabled until all evidence passes.
9. After successful end-to-end evidence, set the readiness flag and promote the reviewed Worker version with a rollback record. Visitors sign in again; legacy sessions are not transferred.

## Rollback

Set `CV_ACCOUNT_CUTOVER_READY=false` and restore the previous reviewed version/traffic assignment. Effective links return to the legacy base. Retain both callback allowlists during rollback and token expiry windows. Do not delete accounts, cookies in other browsers, session tables or provider configuration. Branded sessions remain host-only and are not copied to the legacy domain.

## Current gate

Disabled. D1 writes and retained authentication providers have not passed end-to-end acceptance. LinkedIn project configuration and the upstream fixed-origin OAuth/profile handlers remain blockers. No DNS, provider, database-policy or account cutover mutation was made by this PR.
