# E: Record routes and initial HTML

Recon map: the reviewed six artists and 48 works in the production public cache feed canonical artist pages, standalone artwork pages, and the Works directory. `record-routes.mjs` contains explicit stable ID-to-slug mappings. Titles can change without changing URLs. Valid legacy artist links redirect permanently and preserve relevant queries. Unknown artist, artwork, person, event, gallery and club identifiers return HTTP 404 rather than a default record.

Artist portfolios, work descriptions, verified artist portraits and selected Circles cards render in initial HTML. Circles keeps its current in-place artwork expansion and adds a standalone page link. Measured image dimensions are retained where local source files exist. Work pages retain save/report controls, provide an enquiry email prefilled with the work, artist and canonical page, and show Price on request where no verified price/currency is available.

Verification: standalone build/lint and 20 tests pass, including a real Worker crawl of all six artist pages and all 48 work pages, legacy redirects, representative unknown-record 404s and initial selected-profile HTML. Browser checks at 375px confirm the Sophiko portfolio, canonical artwork navigation, original image-provenance disclosure, enquiry and save/report controls. Final 375px/1440px captures and accessibility evidence are tracked in J.

Remaining blockers: authenticated writes remain at the retained account destination until G's cutover gates pass. Missing artwork facts and prices stay absent. No catalogue records or original modules were removed or rewritten. No human input is required for the routing itself.
