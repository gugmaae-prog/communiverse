# Communiverse people and navigation

The directory retains all ten Cool Kids (including Haseeb) and the three ambassadors: Luna, @_turbooz and Abd Allah Mahmoud. The 58 imported Artisans entries remain removed. All 13 people appear under the default Communiverse filter; Cool Kids and Ambassadors remain usable subgroup filters. The empty Artisans filter is removed.

The shared navigation now labels the directory Communiverse instead of Plug, matching the highlighted tab in the user screenshot. The existing /communiverse/plug/ route and profile links remain valid. The separate Ambassadors information page remains available. No account, database or biography changes.

Use `node scripts/prepare-plug-team.mjs <exact-current-capture> <candidate>` to replace only `members-20261007-entry.js` and `shared-plug-ui-20261007-entry.js` in the captured production runtime. Other 123 modules, including every photo/video and original shared-header asset, are retained byte-for-byte. Do not deploy the top-level legacy application.
