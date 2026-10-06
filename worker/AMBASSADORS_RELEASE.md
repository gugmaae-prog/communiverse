# Communiverse ambassadors — release 20261006-ambassadors-1

Published 6 October 2026 at 09:45 UTC.

## Live route

https://espacios.me/communiverse/ambassadors

Both `/communiverse/ambassadors` and `/communiverse/ambassadors/` are served. Canonical URL ends with `/`.

- Worker: `communiverse`
- Version ID: `9836e27f-09e7-4c19-a420-cf6b7eb1b31f`
- Deployment ID: `ded6d2e1-0b59-471f-985e-1ee560927b29`
- Traffic: 100%
- Page/asset release header: `x-communiverse-release: 20261006-ambassadors-1`
- Browser marker: `window.__cvAmbassadorsRelease === '20261006-ambassadors-1'`
- Rollback baseline: `b6328edf-e114-435d-9695-25341fa7090a`

## Scope

Added a public ambassador landing page, lightweight menu script and scoped CSS. Content covers discovering makers, documenting craft, local gatherings and relationships between communities. Internal compensation, operational terms, recruitment shortlists and financial information are not published. No new application schema or commercial programme terms were invented.

The Express your interest CTA links to `/communiverse/contact/#contact`. The existing contact form and D1-backed handler are retained. No Supabase tables, policies or functions were created or changed. Inspection of the connected Supabase project's table names did not find a Communiverse/ambassador table; this is not a claim that the entire project was audited.

The GitHub page source is `worker/ambassadors.js`; `worker/index.js` now checks that handler before its existing routing. Source integration commit: `cfaa8be7063e9d731e2078fb1ac8048238c479b1`.

## Production preservation

The deployment was made through the Cloudflare connector, by adding two modules to the actual live Worker rather than rebuilding the older main-branch application. All 41 previous Worker modules, including 19 binary media modules, were checked byte-for-byte through the version modules API and retained. The existing static asset collection, D1 binding, rate-limit bindings, homepage carousel, security restrictions and other handlers were preserved.

The homepage still reports `20260930-rigid-arc`; this is intentional, because only the new ambassador route and its assets use the new release marker.

IMPORTANT: This change synchronizes the new ambassador route into this repository, not the whole production stack. The earlier production-versus-main mismatch remains. Do not run the main deployment workflow expecting a complete production-equivalent rebuild until that broader reconciliation is done.

## Verification

The candidate passed tests at zero public traffic, then was promoted to 100%. Ordinary live public requests (no version override) were rechecked at 09:46 UTC on 390 x 844 and 1440 x 1000 browser viewports.

- New page and both CSS/JS assets: 200; release header and runtime marker correct.
- Image loaded; 3:4 crop retained.
- No horizontal overflow or sampled clipped text.
- Header and navigation targets: at least 44px; header clear of content.
- Mobile menu opens and closes, including Escape.
- Both interest links point to the existing contact form.
- Eight prior public pages: 200 with their previous release headers.
- Internal/admin checks: 404.
- Retained rugs video range request: 206, bytes 0-15/2834804, correct 16-byte body (candidate check).
- Contact form exists and Subject remains optional.
- No failed resource responses in the new-page browser checks.

These were browser/viewport-emulation checks, not physical-device testing. No production contact submission was made, and no customer data was read or modified.
