# Communiverse IDrive public portraits — 11 November 2026

The production Communiverse Worker serves the 33 static files in `verified-portraits.json` from IDrive E2, covering the visible portraits for all 16 people in Circles. Five avatar URLs first redirect to their static image paths. For each file, the copied bytes were read back from E2 and compared with the original SHA-256; all 33 passed through the staged public-domain route and again through ordinary production traffic. The normal public site falls back to the prior asset handler when E2 does not return a valid image.

Production Worker `communiverse-workspace-ux-v3-20261009` is version `aec9fa7e-82fc-4ba0-be03-75eb50cc688e` at 100% in deployment `b4b0d2b0-8f2a-4b02-83a6-cae09a47910d`. Version `515898f3-62aa-461c-971f-b9dadd3220e3` is retained at 0% for immediate rollback; original public version `6f3e4ff8-d51c-4d4b-94eb-e3efdc59f209` remains available as an earlier rollback target.

The E2 bridge is version `e5bb9d53-9d4b-4a65-a181-aa9b2ba1b14e` of `espacios-ai-router`. It inherits only `E2F_KEY` and `E2F_SECRET` from the active router version and has an independent upload token. Its version-specific URL serves only allowed Communiverse public image paths under `communiverse-public/20261111/` in `espacios-store-f`; uploads require the token and a matching SHA-256. The bridge is not in the router's active deployment. Cloudflare rejected a 0% router deployment with error `10136` because the active router has an R2 binding and this account reports R2 as not enabled. The version-specific URL worked from the staged and live Communiverse Workers. This dependency should be revisited if the router is retired.

The inherited IDrive credential's full IAM scope was not independently verified. The bridge restricts reads and writes at the application path. It contains no private account media and must not be used as an account database.

## Source and verification

- `gateway.mjs` implements the limited E2 S3 Signature V4 bridge; `gateway.test.mjs` checks denied paths and uploads.
- `copy-public.mjs`, `copy-circles.mjs`, and `copy-avatar-redirects.mjs` copy public images with checksum and readback verification. Local upload token and receipts are kept under ignored `build/`.
- `build.mjs` builds a media-only derivative of the pinned captured public Worker. The source archive is intentionally retained locally and ignored by Git; its uncompressed SHA-256 must match `87370e2eb8aad872779d481ea60dcde3251e2c876048f6383c0cbe319808d5fb`.
- `stage.mjs` and `stage-site.mjs` were pinned to the exact versions and deployments present during this release. They fail closed after the production deployment changes and are release records rather than generic redeployment commands.

The normal public `/`, `/circles/`, `/works/`, and `/artists/` returned 200 after promotion; the five tested avatar redirects reached E2. `/sign-in/` and `/join/` still return the existing 503 pause. IDrive object storage does not execute the relational account queries currently handled by D1. A reversible D1 write probe on 11 November still failed with Cloudflare `7500` (`Your account has exceeded D1's maximum account storage limit`), so the staged account cutover was deliberately not promoted. Private media, artwork migration, and account repair are separate release work.

## Header correction

The follow-up production release removes the exposed `Accounts unavailable` text from the shared public header with a streaming `HTMLRewriter` transform. It does not insert a sign-in action while the account routes cannot complete. Worker version `aec9fa7e-82fc-4ba0-be03-75eb50cc688e` is at 100% in deployment `b4b0d2b0-8f2a-4b02-83a6-cae09a47910d`; the prior IDrive media version `515898f3-62aa-461c-971f-b9dadd3220e3` is at 0% for rollback. The candidate was checked at 0% across nine public pages before promotion. After promotion those nine pages returned 200 without the header label, `/sign-in/` still returned 503, and the ordinary Chrome Circles page visibly showed a clear upper right header area.
