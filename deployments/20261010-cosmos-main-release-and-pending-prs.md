# Communiverse Cosmos release and pending PR audit — 10 October 2026

## Production release

**Status:** LIVE. The safe, merged default-branch update is deployed.

- Source commit: `bb0bd62c140cc9a2c27da3b57254065749cc6eb6`, five commits ahead of the prior deployed `339fc251...` source.
- Changed source files: `worker/experience-v3/experience-v3.js`, `experience-v3.css`, and `qa-runner.js` only. **No** D1, R2, Supabase, database migration, backend API route, or identity file changed.
- Worker: `communiverse-workspace-ux-v3-20261009`.
- New Worker version: `557fc417-4574-4000-8e08-8206c6a6b95a` at 100% traffic.
- Deployment ID: `c28937e1-abda-4165-9dfa-9daec3a4dc5a`.
- Previous version for rollback: `8a690243-4f2c-413f-88c8-2a02758731e4`.
- Exact live Worker modules compared byte-for-byte with the source commit: `gateway.mjs` (2,566), `v3-client.txt` (50,377), `v3-style.txt` (27,675): **all 3 match**.
- Existing `MARKETPLACE → communiverse-marketplace` service binding and all six V3 routes preserved. Search V4, artist booking, the marketplace Worker and the business-knowledge Worker were not modified.

### New experience

Cosmos shows record-grounded context from permitted Workspace overview data: recorded ambassadors and their regions, the lead when recorded, relevant open or blocked tasks, and the distinction between estimates and approved requests. The existing interactive plan includes inclusion/exclusion circles, editable steps, progress, working formulas and explicit unsent-email labels. The draft/submit action remains the only submission mechanism; editing the board itself does not send email or create a booking.

### Verification

- Isolated V3 staging Worker from the exact main source: 58/58 QA checks at 320, 390, 768, 1024, 1280 and 1440px = **348/348 passing**.
- Public staging: homepage and signed-out Workspace rendered normally on phone/desktop; Cosmos JS and CSS were accessible.
- Live public checks: homepage, Workspace, Plug and Discover rendered; both apex and www Workspace serve the V3 bundle; the private Workspace overview endpoint still requires authentication.
- After release: Cloudflare confirms all 3 modules match `bb0bd62...`, 100% traffic, zero reported active issues. The temporary Cosmos staging subdomain was disabled.
- One deeper public artwork interaction QA attempt timed out in Cloudflare Browser Rendering and is **not** counted as passed. The artwork-reader code was not changed by this release.
- Real authenticated user-specific interactions, email delivery and final request submissions **were not** tested end to end.

### Rollback

Restore **only** `communiverse-workspace-ux-v3-20261009` to version `8a690243-4f2c-413f-88c8-2a02758731e4`, without changing any existing routes, original Marketplace Worker, Search V4, booking, D1/R2 or Supabase. Recheck the Workspace and asset URLs after the existing short-lived JS/CSS caches expire.

## Open draft PRs requiring disposition — **not automatically deployed**

An open PR is not proof of a safe, pending production release. The following branches were compared with `bb0bd62`. They are all diverged and require separate review/rebase/test, or supersession.

| PR | Subject | Source distance from current main | Deployment decision |
| --- | --- | --- | --- |
| [#20](https://github.com/gugmaae-prog/communiverse/pull/20) | Initial interactive plan | 11 behind / 1 ahead | **Superseded**: PR explicitly says the plan landed on `main` as `a19c3bb`. Current live V3 includes the subsequent plan, notify and Cosmos improvements. Do not merge stale copies over current source. |
| [#10](https://github.com/gugmaae-prog/communiverse/pull/10) | Unified accounts, artist studios, permissions and marketplace | 36 behind / 86 ahead; 243 changed files | **Blocked**: major identity, permission, D1/R2, email and backend scope. Rebase and full-stack signed-in/role/data-migration QA first. Existing live production can contain some similar functions independently; verify exact differences. |
| [#9](https://github.com/gugmaae-prog/communiverse/pull/9) | Artist marketplace and ambassador review | 36 behind / 7 ahead; 40 changed files | **Blocked**: catalog/media assets and migrations, review permissions and possible fictional sample content. Validate real media provenance, migration plan, and permissions before promotion. |
| [#8](https://github.com/gugmaae-prog/communiverse/pull/8) | Five supplied craft videos | 42 behind / 2 ahead; 15 changed files | **Blocked**: multimedia asset/release integration from a stale branch, not a self-contained V3 CSS/JS update. Verify media provenance, R2 deployment and current feed associations. |
| [#7](https://github.com/gugmaae-prog/communiverse/pull/7) | Plug background / navigation simplification | 42 behind / 21 ahead; branch based on a different base | **Blocked**: old Plug rendering and layout can conflict with the current constellation. |
| [#6](https://github.com/gugmaae-prog/communiverse/pull/6) | Plug people cluster and names | 42 behind / 7 ahead; 12 changed files | **Blocked**: needs rebase/diff against the current 127-circle Plug experience and existing live styles. |
| [#5](https://github.com/gugmaae-prog/communiverse/pull/5) | Original website visual design | 45 behind / 5 ahead; 24 changed files | **Blocked**: large old Next.js layout replacement; current Cloudflare Worker experience differs. |
| [#4](https://github.com/gugmaae-prog/communiverse/pull/4) | Legacy routes and waitlist | 45 behind / 1 ahead; 20 changed files | **Blocked**: old Worker entry point, configuration and SQL migration; needs migration/route reconciliation. |

**Next step:** Treat each remaining distinct feature as a new narrow PR rebased on the live source, stage it without production routes, run relevant non-destructive and authenticated tests, then deploy it through the right existing Worker. Do not bulk-merge these historical drafts.
