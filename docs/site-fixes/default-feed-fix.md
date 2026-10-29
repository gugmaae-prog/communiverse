# Public default-feed cursor fix

The live v25 Home and Discover responses render 16 works with a public1 cursor. The browser appends empty q and region parameters to its next-page request. The fallback feed included those empty fields in its fingerprint, producing HTTP 410. Clicking For you discarded the initial cursor and created a compatible one, hiding the underlying bug.

Normalize empty filter values when fingerprinting, while accepting the old empty-filter fingerprint for already-open pages. Real filter changes continue to invalidate a cursor. No records, sort order, public layout or authentication behavior change in the narrow live fix.

The release path uses the reviewed v25 reconciliation source, the already-active notification compatibility class and all 321 original assets. Compared with that active compatibility snapshot, only public-fallback.mjs differs. The full A-K candidate stays separate at zero traffic. Live promotion requires guarded version ownership, default/legacy cursor checks, real-filter rejection, source-boundary evidence and a rollback assignment. Account cutover remains false.

Local verification compiles the exact 187-module v25 upload rather than assuming the newer A-K bundle represents production. It reaches all 48 unique works from the initial HTML cursor without a reset, accepts the old browser cursor and rejects a changed filter. The local runtime uses its supported compatibility date; independent Cloudflare candidate and normal-traffic checks remain required.

See the [recon map](recon.md) and [release verification](release-verification.md). No DNS, billing, database, policy, form, legal, sharing-image or visual release is included in this hotfix. Broader scrolling and community-layout refinements are separate preview work.
