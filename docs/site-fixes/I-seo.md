# I: Record-based metadata and sharing

Recon map: the same reviewed artist/work mappings, people records, event programme, galleries and active club records supply page content, canonical URLs, metadata and sitemap entries. Superseded Discover/artist URLs and account/error routes are excluded from the sitemap.

Each public sitemap page has a unique server-rendered title, description and canonical. Open Graph and Twitter fields include the Communiverse name and 1200x630 sharing images. Artist pages use their verified portrait; work pages use the existing artwork without cropping it. The default image uses the existing orange logo on #edf2f8. No person or artwork was generated. All 55 new sharing assets have a separate reviewed hash manifest; the 321 original assets remain unchanged.

Organization JSON-LD identifies Communiverse and its supplied Common Folk Group, Inc. parent on Home. Artist pages use Person. Valid dated event records use Event; venues do not get fabricated dates or Event markup. Selected Circles profiles have their own initial title/description/canonical. Account and error pages are noindex. Every page gets the standard viewport.

The crawl also exposed new programme event IDs that the legacy page fallback did not know. Their validated event data now renders directly with its real image, source and details. Unknown IDs still return branded 404s.

Verification: build/lint and 27 tests pass. The real Worker sitemap crawl checks every sitemap URL for HTTP 200, unique title/description/canonical, sharing-image availability, viewport and applicable structured data. Six artists, 48 artworks and all 55 sharing images are checked; image dimensions are 1200x630. Source verification checks 146 original modules, 321 original assets and 55 added assets.

Needs human input: default sharing-image design sign-off and real search-engine/social fetch review after an approved preview release. Account cutover, legal placeholders, workshop facts and provider gates remain unchanged. No analytics or redesigned identity was added.
