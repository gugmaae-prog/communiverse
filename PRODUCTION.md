# Communiverse production reconciliation

## Latest simplified shared navigation

Release `20261008-simple-nav-1`; Worker `communiverse-marketplace`; version `62b35c00-4a47-4a11-a02e-aedd41d2dad5`; deployment `cbf4c477-ab75-48fd-8363-6b0db47071d0`; 100% traffic. Rollback version: `83f1bdb4-e7e4-44ef-8679-967a5cb4b382`.

The remaining legacy pages use Discover, Artists, Workshops and Plug in place of the six-tab shared header and More menu. All four tabs stay visible on mobile. Contact stays outside the desktop tab pill; existing footer links and legacy routes remain available. Marketplace and Plug headers are retained.

Source: `worker/releases/simple-nav-20261008/`; assembly: `scripts/prepare-simple-nav.mjs`; verification: `scripts/verify-simple-nav.mjs <verified candidate> live`. Fourteen current runtime modules remain byte-identical; three header modules are added. Streaming HTML rewrites preserve the existing security policies, content, forms, directory, galleries, media, D1/service bindings and observability. No records or form submissions changed.

Live proof: `deployments/20261008-simple-nav-1.json`; retained route/media/source checks: `deployments/20261008-simple-nav-retained-checks.json`. All nine legacy page GET/HEAD requests and the new immutable script checksum passed. Desktop 1440x900, mobile 390x844 and 320px width showed one simplified header, four destinations and no horizontal page overflow; mobile links are 44px tall. Browser navigation into Artists and Plug, ambassador content and group-session prefill were checked in preview.

## Previous artist galleries and mobile animation

Release `20261008-plug-gallery-1a` on `communiverse-marketplace`; version `83f1bdb4-e7e4-44ef-8679-967a5cb4b382`; deployment `d9b82c9a-1801-4100-af5d-869b37d43426`; 100% traffic. Full checks are recorded in `deployments/20261008-plug-gallery-1a.json`. Presentation assets remain `20261008-plug-gallery-1`.

All ten artisans have a named gallery CTA outside the Plug detail cards. Each gallery includes separate films and descriptions, workshop/group-session request links and a concept store enquiry. Actions sit outside the gallery cards as well. Date and estimated group-size fields feed the existing message payload; no automatic booking, payment, inventory, schema or form submissions were added. Artist gallery CSS is embedded in their HTML under the unchanged inline-only style CSP.

Mobile selection restores the 640ms selected-orb and peer animation. Cards stay in a fixed compact tray; opening an artist leaves scene height unchanged. At 390x844, video is 112x199, detail cards are 224x204 and page scrollWidth remains 390. Communiverse still includes 23 people, ten artists, ten Cool Kids and three ambassadors, with six back-office people.

Source: `worker/releases/plug-gallery-20261008/`; assembly: `scripts/prepare-plug-gallery.mjs`; live checks: `scripts/verify-plug-gallery.mjs <verified candidate> live`. All ten prior refine runtime modules remain identical. The final styling fix retains thirteen of fourteen gallery-1 modules and changes only the entrypoint. Legacy content, original glass bytes, old immutable assets, D1/service bindings and observability remain. Existing route/media/source checks passed: `deployments/20261008-plug-gallery-retained-checks.json`.

## Previous Plug refinement

Release `20261008-plug-refine-3`; Worker `communiverse-marketplace`; version `383cdd17-a26a-449e-ad98-526be3d64748`; deployment `a2a3d3c2-c38c-46fa-9c1a-3391ed416661`; 100% traffic. Rollback version `413ac851-8d29-4f00-8b14-0717de155364`.

Artists is a fourth filter alongside Communiverse, Cool Kids and Ambassadors. All 23 people remain. Videos are independent rounded media elements; craft details and concept photos are in their own card. Mobile selection opens a compact fixed tray and leaves circles in place. Transparent social marks preserve real supplied destinations. The ten artist pages use the shared site theme and separate film/detail/photo elements.

Request a commission opens the retained contact form, prefills the craft and offers a preferred date. The date is part of the existing message payload. Requests are saved by the retained waitlist endpoint, not confirmed bookings or orders. No schema, bindings, credentials or database records changed; no test enquiries were submitted.

Source: `worker/releases/plug-refine-20261008/`; assembly: `scripts/prepare-plug-refine.mjs`. Six previous runtime modules and old immutable asset URLs are retained byte-for-byte; four scoped modules are added. Live verification: `deployments/20261008-plug-refine-3.json`. Existing route/media/source checks: `deployments/20261008-plug-refine-retained-checks.json`. Mobile 390x844: width/scrollWidth 390, circle movement 0, video 124x221. Desktop 1440x900: no horizontal page overflow, film ready and playing. Contact prefill/date state, close, filters, dark mode and reduced motion checked in browser. Ten work photos returned image/jpeg HTTP 200.

## Previous artist and Plug update


Release `20261008-plug-artists-1a`; active Worker `communiverse-marketplace`; version `413ac851-8d29-4f00-8b14-0717de155364`; deployment `85fefe9a-a2c5-4d5b-8a3e-091eb99856ba`; 100% traffic. Presentation asset URLs remain `20261008-plug-artists-1`. The final revision only fixes biography wording and preserves those immutable asset bytes.

The active marketplace route delegates legacy content and media to `communiverse`. Its exact original marketplace bundle was retained, with five scoped presentation/media modules added. Ten supplied artist concepts join the existing 13 people; sample labels and craft-reference attribution remain explicit. Plug circles, video cards, social icons and mobile details are refined. The ten linked artist pages replace concept-work stills with craft films. The supplied glass clip is preserved byte-for-byte. No account, database, service binding, route, metrics or application changes.

Source: `worker/releases/plug-artists-20261008/`. Assemble using `scripts/prepare-plug-artists.mjs` against a verified current marketplace capture. Deployment and all ten live profile checks: `deployments/20261008-plug-artists-1a.json`. Existing retained-route/media checks: `deployments/20261008-plug-artists-retained-checks.json`. Never redeploy the older marketplace branch wholesale against the live system.


## Previous directory update

Release `20261007-plug-team-2`; Worker version `fb1e0cac-7c50-4a38-a8f3-18cc0b0effc6`; deployment `4d0fa6b2-a0fa-4294-b040-5d10dda62bd3`; 100% traffic. Ten Cool Kids and three ambassadors appear together under Communiverse. The highlighted Plug navigation link is relabelled Communiverse and group filters sit below the header. The 58 imported artists remain removed. Source: `worker/releases/plug-team-20261007/`; verification: `deployments/20261007-plug-team-2.json`. No database or account changes. The root `/communiverse/` currently returns the separate `X-Communiverse-Marketplace: 20261007-marketplace-2` page; its ownership and content were retained. The verifier checks that root as marketplace content rather than requiring this directory release header.


## Shared design baseline

Release `20261007-shared-plug-ui-1`; Worker version `4a09f1da-b076-43e5-9663-c93dc1a188bd`; deployment `81b6d569-6434-4c57-8388-cc80d5829e5b`; 100% traffic. Previous production version: `428c7e34-252c-4ef7-97c4-62ce49cd11ab`.

The editable entrypoint, stylesheet and header script are recorded in `worker/releases/shared-plug-ui-20261007/`. The entrypoint delegates to the retained production Worker. It does not rewrite gallery logic, public profile records or the D1 API. Source-scoped record: `deployments/20261007-shared-plug-ui-1.json`.

## Actual source coverage

The new design source is committed. The complete 125-module runtime snapshot is **not yet captured**. Its read-only Actions job was executed and failed because `CLOUDFLARE_API_TOKEN` is absent in this repository. Do not infer that a connected ChatGPT Cloudflare tool grants GitHub Actions an API token.

`Sync exact Communiverse production source` can be run manually on `main` after the secret is added. Its pinned request targets the now-live version; it aborts if traffic/latest-uploaded version changes, verifies the three approved source files, scans for credentials, and would commit 125 exact modules (55 binary) plus a hash/config manifest. It performs only Cloudflare GET requests, no database queries and no deployments. Exported binding metadata excludes credential values.

The separate static ASSETS collection is not included in `/content/v2`; it remains remote. A module snapshot using `keep_assets:true` is not an independent full-account disaster-recovery backup. Existing repository `public/` remains retained.

## Safe deployment

Until production source reconciliation succeeds, use the Cloudflare connector/API to upload scoped versions around the exact retained runtime, retain ASSETS/D1/rate-limit bindings and runtime settings, test a zero-traffic candidate, then promote after checking the current version. Do not run the legacy app's Wrangler configuration against production. The new active workflow verifies live source hashes; it does not deploy automatically. The former workflow is retained as a non-executable example under `docs/legacy/`.

Rollback changes Worker traffic only. It does not undo database state; this particular release made no database changes. Previous immutable code/media URLs remain available.

## Validation scope

Staged 390x844 and 1440x1000: shared system font, one header, menu expansion and Escape, unobscured headline, 25-card movement, correct gallery viewer, scroll restoration and no observed hydration errors. All ten public page routes and one local person profile returned 200 with the design release. Internal and RAL routes remained 404. Production is checked again by the live verification workflow and browser tests.

The broader marketplace/session/kit entitlement plan remains separate. This release does not claim real orders, bookings or payments. No Supabase schema/record changes, D1 writes, public identity substitutions or internal RAL publication occurred.
