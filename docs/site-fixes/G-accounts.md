# G: Branded account configuration and guarded adapter

Recon map: see docs/auth-domain-migration.md. Owned password handlers and retained in-process/service-binding routes are distinct from externally owned sign-in/OAuth initialization. Account links use CV_APP_BASE_URL and remain at the legacy destination until explicit cutover readiness. The reviewed target is https://communiverseclubs.com/account/.

Changes: per-request configuration, guarded same-origin account route/API adaptation, host-only cookies and private responses, centralized navigation/profile/recovery destinations and a safe return-path helper. No session-transfer tables, public credential proxy or DNS change was added. The default remains fresh sign-in on the current account origin until cutover gates pass.

Verification: build/lint and 25 tests cover configuration gating, destination allowlists, malicious return paths, recovery fragments and unchanged public/external URLs, alongside routing, forms and receipt tests.

Not done: account cutover is disabled. Metadata does not establish resolved D1 writes. Complete OAuth sign-in source lives behind retained service bindings, and profile connection code retains a legacy origin; those owners must supply origin-aware handlers and candidate releases. Live Google/LinkedIn/recovery/role flows cannot be accepted from URL rewriting or mocked tests.

Needs human input: provider access/configuration, retained auth release owner/candidate versions, isolated test accounts and resolved D1 write capacity. Exact callbacks, allowlists, release order and rollback are documented. No domain records need to change for the selected same-host target.
