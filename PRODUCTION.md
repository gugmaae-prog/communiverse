# Communiverse production reconciliation

## Current connected workspace release

Release `20261009-social-12`; version `4a659bea-6915-4093-a7e7-8ab9c85ccfb4`; deployment `88adaa38-8222-4b86-aa66-247da6af593b`; Worker `communiverse-marketplace`; 100% traffic. Source commit `aa12f2789ea082887792ef9480767d1c5f76758e`. Rollback Worker version: `37e7cd9a-11b4-4c1d-84e7-e43afa632c30`. The additive Social 12 tables can remain in place during a Worker rollback.

Shared username/password identity gives every member an appropriately scoped workspace. Team-aware AI produces reviewed requests/tasks/conversations; server routing preserves Keiffer, Haseeb and Elferah dependencies. Mentions and replies create private workspace notifications and verified-contact email delivery records. Keiffer/Haseeb management supports account edits and previewed, confirmed cascading deletion. All Plug circles fit the current viewport, with enlarged selection and compact separate cards; feed details span two columns.

All 119 uploaded modules and 33 retained immutable script URLs were verified. The final live crawl returned 188 successful routes; 186 HTML documents passed presentation checks and 33 video elements retained autoplay/loop/muted/inline configuration. Shared identity, actual Groq Q&A, role boundaries and all three Worker routes were checked independently after promotion. Integration suites passed 513 assertions plus 23 collaboration groups. Native checks covered desktop, portrait, landscape and 320px phone views. No real test requests, messages, meetings, deletion or email deliveries were submitted to the team.

Evidence: [release record](deployments/20261009-social-12.json), [live feature checks](deployments/20261009-social-12-features.json), [page audit](deployments/20261009-social-12-page-audit.json), [runtime notes](worker/releases/social-20261008/README.md). Previous notes below describe historical releases.

## Previous marketplace, signup and in-place cards

Release `20261008-marketplace-1c`; presentation assets `20261008-marketplace-1`; Worker `communiverse-marketplace`; version `d6e5b7f4-5e0d-4545-9d54-72cee4b68563`; deployment `54b657f2-3b52-4b00-acf5-c433d909756a`; 100% traffic. Source commit `0402587606f43f448c9e003195e253271ebdb308`. Rollback version `6f84fe2e-2079-466e-9750-c43053945de5`.

Discover is a 16-object marketplace with eight craft categories, maker stories, 25 generated product/process images, craft films and 14 display currencies. Galleries add product enquiries and priced workshop/group date requests. Near You uses an official city guide across the nine requested countries plus Uzbekistan and can show registered artisan circles. Generated concepts and guide pricing are disclosed once at collection level. Orders and sessions require confirmation; payments and live host availability are not implemented.

One Join form collects private email/phone and optional social handles. Public first name, craft, city and supplied handles appear in Plug immediately after signup. Welcome email uses a restricted EMAIL binding on `welcome@communiverse.espacios.me`; confirmation tokens are hashed, single-use and expire after seven days. The additive member/limiter tables leave the three curated ambassadors, reviewer access, activity and existing applications intact. Legacy Join/Waitlist buttons enter this same signup after hydration. The calendar saves requests into the existing private submissions table. No test profiles were published. Separate provider email tests were accepted for Outlook and Gmail; Outlook delivery was confirmed, Gmail delivery remains unconfirmed.

Plug captures the selected circle's current position, keeps 640ms motion and places compact independent cards around it. Story cards have no internal vertical scrolling. Gallery/calendar styles are embedded under the unchanged inline-only style CSP; the policy was not weakened.

All twenty pre-marketplace modules remain byte-identical. The final image-sizing patch retains 55 current modules, changes only the scoped entrypoint and adds an inline stylesheet, for 57 modules total. Published immutable CSS bytes remain unchanged; inline image styles override the retained HTML height attributes so product cards display square photographs. LEGACY, D1, the restricted EMAIL sender, assets, runtime and observability are retained. Canonical and www Communiverse routes still map explicitly to this Worker; the separate Espacios homepage returns HTTP 200.

Source and pricing/venue provenance: `worker/releases/marketplace-20261008/`. Assembly: `scripts/prepare-marketplace.mjs`; integration checks (Node 24+): `scripts/test-marketplace.mjs`. Full module, migration, staged/live, privacy and browser evidence: `deployments/20261008-marketplace-1c.json`; retained route/media/source checks: `deployments/20261008-marketplace-retained-checks.json`. Signup/session state transitions were tested using real in-memory SQLite with a controlled mail binding; production reads, validation/Origin rejection, D1 upsert RETURNING and sender delivery were verified independently. The public signup happy path was not submitted with a test member.

## Previous compact mobile orbit cards

Release `20261008-plug-orbits-1`; Worker `communiverse-marketplace`; version `9563f02e-0cb5-471c-abc9-de2772678887`; deployment `0dfc87d7-6943-4bae-b53c-3806ae7f6cfd`; 100% traffic. Rollback version: `62b35c00-4a47-4a11-a02e-aedd41d2dad5`.

Mobile Plug replaces the fixed bottom tray with separate small profile, video, craft-detail, social and gallery surfaces in the constellation. Surfaces follow the selected orb during the existing 640ms motion, and quick switches retain the most recent card pose. The gallery action remains outside the cards. On 390x844 the live video is approximately 98x174 and plays; profile/detail cards are 128px/160px tall. Short screens use 112px/144px cards. Native scrolling and independent card scroll areas retain access to full details. A 148px mobile scroll margin keeps the scene clear of the fixed header and filters.

Source: `worker/releases/plug-orbits-20261008/`; assembly: `scripts/prepare-plug-orbits.mjs`; verification: `scripts/verify-plug-orbits.mjs <verified candidate> live`. All seventeen current runtime modules remain identical, with three scoped presentation modules added. Desktop card geometry, four-tab navigation, artist galleries, request forms, all 23 people and original media remain. No schema, records, form submissions, bindings or security policy changes.

Evidence: `deployments/20261008-plug-orbits-1.json` and `deployments/20261008-plug-orbits-retained-checks.json`. Live asset checksums, gallery/nav preservation and glass byte-range checks passed, as did 20 retained route/media/source checks. Browser checks covered mobile 390x844, short mobile 320x568, desktop 1440x900, rapid selection, close/filter handling, reduced motion, dark mode and real member social links. Mobile panel position is absolute, video transform moves then settles, scene height remains 480px before/after selection, and page scrollWidth is 390px.

## Previous simplified shared navigation

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
