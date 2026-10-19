# Haseeb-only Communiverse Plug

The user requested removal of all displayed Plug entries except Haseeb Wasim because artists have not joined yet. The public Communiverse Plug directory now emits only `cv-haseeb-wasim` in its hydration data, portrait nodes and no-JavaScript list. The 70 other displayed entries are removed from the page, rather than hidden by styling.

Haseeb retains his existing biography, portrait and social/profile links. Empty groups use the existing empty-state behavior. Espacios Plug account records and profile URLs are not deleted. Existing standalone profiles and the separate Ambassadors page remain outside this page-specific change.

`members-entry.js` replaces the existing `members-20261007-entry.js` module in an exact production capture. Other modules, assets, bindings and settings are retained. Assemble with `node scripts/prepare-plug-haseeb.mjs <capture> <candidate>`. Do not deploy the legacy top-level Next.js build.
