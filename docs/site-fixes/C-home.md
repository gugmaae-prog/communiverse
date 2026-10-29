# C: Home, navigation and feed curation

Home is canonical; Discover redirects with 301 and retains its query. The value proposition is a visible, responsive introductory line before the existing featured artist. Footer email is a working address. People redirects to its explicit filter. Objects is hidden until the actual Works directory lands in E.

The Home-only API surface reads the current upstream feed, deduplicates it, then interleaves artists in batches of at most 18 artworks and no more than three per artist. Shorter batches are deliberate when the cap cannot fill all slots. Catalogue/filter fingerprints invalidate stale cursors. Artist, Saved and Following requests bypass Home curation. New records default to visible unless hideFromHome is true.

The three requested titles are excluded by their verified stable IDs, not by an approximate text match. They remain in the catalogue, artist pages and other surfaces. International artists remain represented. Workshop images are actual portraits, so their alt text identifies the host and workshop rather than claiming they show a session in progress.

Needs human input: founder confirmation of the three Home-only exclusions. No original records or images were deleted.
