# Public default-feed cursor fix

The live v25 Home and Discover responses render 16 works with a public1 cursor. The browser appends empty q and region parameters to its next-page request. The fallback feed included those empty fields in its fingerprint, producing HTTP 410. Clicking For you discarded the initial cursor and created a compatible one, hiding the underlying bug.

Normalize empty filter values when fingerprinting, while accepting the old empty-filter fingerprint for already-open pages. Real filter changes continue to invalidate a cursor. No records, sort order, public layout or authentication behavior change in the narrow live fix.

The release path uses the reviewed v25 reconciliation source, the already-active notification compatibility class and all 321 original assets. Compared with that active compatibility snapshot, only public-fallback.mjs differs. The full A-K candidate stays separate at zero traffic. Live promotion requires guarded version ownership, default/legacy cursor checks, real-filter rejection, source-boundary evidence and a rollback assignment. Account cutover remains false.

Local verification compiles the exact 187-module v25 upload rather than assuming the newer A-K bundle represents production. It reaches all 48 unique works from the initial HTML cursor without a reset, accepts the old browser cursor and rejects a changed filter. The local runtime uses its supported compatibility date; independent Cloudflare candidate and normal-traffic checks remain required.

See the [recon map](recon.md) and [release verification](release-verification.md). No DNS, billing, database, policy, form, legal, sharing-image or visual release is included in this hotfix. Broader scrolling and community-layout refinements are separate preview work.

The verified live hotfix is version `3879ee91-5f0f-44db-a412-df034a2f1142` at 100%, deployment `f78653cb-1630-4b60-ad65-f5209d6fcfeb`. The full A-K candidate `29964e9f-2d18-4405-b5be-f72e02ff9e08` remains at 0%. Independent normal-traffic checks reach 48 unique artworks on both Home and Discover with HTTP 200 next pages. Old browser cursors return 200; genuinely changed filters return 410. Account redirects and the old public interface are preserved. [Live evidence](evidence/default-feed-fix/live-check.json) and [rollback assignment](evidence/default-feed-fix/deployment.json) record acceptance.
