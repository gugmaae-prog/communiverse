# Communiverse Plug — labelled portraits

Published 2026-10-06 at 13:27:34 UTC. Verified again at 13:28:40 UTC with ordinary public requests and no version override.

## Production

- URL: https://espacios.me/communiverse/plug/
- Worker: `communiverse`
- Version: `272972e0-5952-441b-9e0c-d01a72f3b98c` (28)
- Deployment: `30d713cd-c8e1-4288-981e-7e7a809ecb02`
- Traffic: 100%
- Release header: `x-communiverse-release: 20261006-plug-portraits-1`
- Runtime: `window.__cvPlugRelease === '20261006-plug-portraits-1'`
- Rollback: `f06b18fb-cf94-4111-bbe6-b75060156718`

## Portraits

Ten user-supplied, labelled portraits were extracted to lossless PNGs at source resolution, with screenshot chrome cropped away. No generative editing, upscaling, or text painted onto photos.

Team: Haseeb Wasim; Alison Gonzalez; Abel Thomas; Louis Mitchell; Elferah Saidil; Keiffer; Hassan B. Mirza.

Ambassadors: Luna; @_turbooz; @abdallah_mahmoudd.

Only the photos, their supplied names/handles, and Team/Ambassadors grouping are published. No source document, financial information, internal operational terms, compensation, private contacts, or biographies were uploaded to the public repository or website.

The files and checksum manifest are in `public/people/`. Runtime URLs are `/communiverse/_public/portraits/20261006/<filename>.png`. All ten live images returned 200, image/png, and matching SHA-256 checksums in both viewport checks.

## Presentation and links

The ten portraits are prioritized in the existing spring cluster. All shows fourteen entries, including all ten new portraits. Team shows seven; Ambassadors shows three. Existing Founders, Design, and Dubai filters remain. The existing 63 public-network entries remain; adding ten curated presentation entries is not a claim that ten new accounts or ten unique additional people were created.

Each new portrait links to `/communiverse/plug/person/<id>/`, containing the labelled portrait, broad group, and Contact Communiverse link. These are public presentation pages, not fabricated authenticated Plug accounts. Their ten routes returned 200 and matched the labels/photos. Private-data markers were absent from their page text. Existing member profile links are retained.

## Preservation

This is an additive wrapper around the actually live `pr6-entry.js`, not a deployment of repository main or the newer un-deployed plug-3 rewrite. All 47 original modules, including 19 binary media modules, were compared byte-for-byte and retained. The static asset configuration, D1 and rate-limit bindings, old Plug files, existing homepage carousel, and other routes are unchanged. No Supabase or D1 writes were performed. No pull request was merged.

## Verification

Staged at 0% before promotion. Post-deployment public browser checks at 390x844 and 1440x1000 confirmed:

- Plug and new JS/CSS: 200; expected release and runtime markers.
- Ten added photos loaded; ten portrait pages: 200 with matching names.
- Team filter: seven; Ambassadors: three; all ten featured in All.
- Filtered portraits remain inside the viewport; document widths exactly 390 and 1440.
- Circular detail image dimensions confirmed in final candidate after correcting intrinsic image height.
- Existing home, ambassadors, contact, makers, and old Plug JavaScript: 200 with their prior release headers.
- Internal and admin sample routes: 404.
- Retained rugs video: 206, Content-Range bytes 0-15/2834804, 16-byte body.

Browser emulation was used, not physical-handset testing. Existing unrelated upstream member-image failures were not altered.

## Source and build

Branch: `codex/plug-people-portraits-20261006`.

`plug-people-20261006.mjs` supplies the public-name manifest, guarded transform of the deployed plug-2 source, and scoped entrypoint. Use `plug-people-detail-20261006.css` for the final `people-detail.css` module, overriding the original builder's DETAIL_STYLE so width and height are explicitly equal. Final source commit before deployment: `e66bd7b81cd12f4d23c4e6da6b793406ca26bb35`.

The one-off portrait import workflow completed successfully (run 37469582101); it fetched only the ten approved PNG paths, verified their checksums, and committed them to this branch. It does not deploy the website.
