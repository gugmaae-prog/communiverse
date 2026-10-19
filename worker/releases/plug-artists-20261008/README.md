# Plug artists, films and circles

This release adds the ten supplied artist concepts to Plug. The Communiverse filter contains 23 people: ten artist concepts, ten Cool Kids and three ambassadors. The original public people remain intact. Existing operations, engineering, marketing and design members are marked Back office within Cool Kids. No invented real social handles, account records, prices, bookings, credentials or certifications are created.

Artist concepts keep a concise Sample profile label and a clear film attribution note. Studio biographies are invented within that context. Craft films illustrate techniques and are never attributed to the sample identities. Priya, Diego and Awa receive explicitly related textile/metal/weaving films because the existing library does not contain their exact techniques. Elias receives the supplied 18.518519-second glass-shaping clip; its bytes/audio are retained.

Plug portraits use per-document random diameters and collision-free centered placement. Selection retains the existing motion controller. Video-first cards play muted inline, preserve native controls, pause when closed/hidden and respect reduced motion. Social links use standalone branded SVGs, include only supplied profile links, and preserve accessible labels and touch targets. Instructional subtitle text is removed. Mobile details use full-width work cards.

The active host route is owned by communiverse-marketplace, with LEGACY delegating to communiverse. This release wraps a checksum-verified capture of the current marketplace script (one bundled module) and retains it byte-for-byte. It adds five modules: presentation entrypoint, data, CSS, browser script and glass MP4. The compact marketplace header, databases, application flows, metrics, private admin behavior, service binding and existing media remain retained. Only Plug and the ten supplied artist detail pages are rewritten.

Assembly: `node scripts/prepare-plug-artists.mjs <current-marketplace-capture> <candidate>`. Always recover current traffic first. Never deploy the legacy top-level app or overwrite the marketplace with its branch source without a current capture.

Final deployment tag: `20261008-plug-artists-1a`. It only polishes biography wording. The existing immutable presentation/MP4 asset URLs remain `20261008-plug-artists-1` with identical bytes. Reassembly now supports subsequent captures of this wrapper and verifies unchanged modules before replacement.
