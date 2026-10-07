# Shared Plug UI — deployment verification

Release: `20261007-shared-plug-ui-1`  
Worker version: `4a09f1da-b076-43e5-9663-c93dc1a188bd`  
Deployment: `81b6d569-6434-4c57-8388-cc80d5829e5b`  
Traffic: 100%  
Approved source/ledger commit: `c6aba6086e5a2504127bd9dec37330561959f632`.

## Published source matches this repository

GitHub Actions independently fetched both new public assets and confirmed byte equality against the checkout:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `20261007-shared-plug-ui-1.js` | 5,276 | `060e66cba2192173925a3ebeae691abc4d0445ffebe3def3b468e7b4271ebea6` |
| `20261007-shared-plug-ui-1.css` | 13,238 | `faf0a81d6362152a3c1b4c545ea3a29a824c05ddce7ca9be939febd43bb5549d` |

Previous squeeze-4 JS and CSS both still returned 200 to the runner.

## Browser checks after promotion

Ordinary public Cloudflare-rendered browser requests, with no version override, were tested at 390x844 and 1440x1000. Home, Contact, Ambassadors, Plug and the local Haseeb profile each had exactly one shared header and only the approved system-font stack among sampled visible headings, paragraphs, controls and fields. The root document width matched the viewport. All measured shared-header controls were 44px high. No captured runtime or React hydration errors appeared.

The home gallery still contained 25 moving cards. The gallery detail viewer opened and restored scrolling in staged checks. Plug profile selection opened its existing details in both live viewport tests. Contact retained optional Subject, 16px fields, field-specific empty-form errors, and focus on Name. GET against the waitlist endpoint returned its expected 405. No valid form submission was made and no database records were written.

The staged HTTP matrix covered Home, About, How it works, Makers, Founders, Brands, Startups, Contact, Ambassadors, Plug and a local person profile: all 200 with the shared release. Internal/RAL remained 404. Testing is synthetic browser verification, not physical iPhone/Safari testing.

## Two remaining GitHub blockers — not hidden by the browser results

1. **Full Worker snapshot not captured:** run `37633325029` failed before any Cloudflare read because this repository's Actions environment has no `CLOUDFLARE_API_TOKEN` secret. `CLOUDFLARE_ACCOUNT_ID` is present. All three files for this design release are committed, but the full 125-module historical Worker archive is not yet in `production/modules/`. The read-only, version-pinned snapshot workflow is included for use after that credential is configured. The separate Cloudflare static ASSETS collection is retained remotely and is not part of the content API export.
2. **Direct runner HTTP smoke checks failed with 403:** run `37634556133` passed both new asset hash checks and both old asset availability checks, but the GitHub-hosted runner received 403 for HTML routes, private-route probes and the media-range probe. These are not counted as passed tests. The same application paths rendered normally in the separate Cloudflare browser checks. No WAF/Access rule was weakened to make CI pass. The workflow artifact preserves all failures.

## Preserved scope and deployment guard

No gallery geometry, media bytes, profile/account data, D1 records, Supabase schema, DNS or other Worker routes were changed by this promotion. The retained security and internal-route controls stay in their existing handlers. The shared wrapper delegates all non-page/asset work to production.

The old unchecked build-and-Wrangler workflow is archived, and the legacy Wrangler entrypoint now fails before deployment with an explanation. Existing app source and history are retained. Conflicting draft branches were not mass-merged. The broader marketplace, real booking/payment, kit entitlement and full reference-content plan remains pending, not misrepresented as part of this design-only release.
