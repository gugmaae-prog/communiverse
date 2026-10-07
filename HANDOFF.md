# Communiverse Plug handoff

Written 2026-10-07. This is a status note for the next person. It is not a deploy.

The page people are reviewing is https://espacios.me/communiverse/plug/. Two open pull requests describe different versions of that page. The live site is neither of those pull requests.

## What is live

Recorded in `worker/releases/plug-streamline/DEPLOYMENT.md`:

- Worker: `communiverse`
- Version: `53b3f842-67cf-4241-864b-f21a597952ce`
- Published: 2026-10-06 15:25 UTC
- Browser marker: `20261006-plug-streamline-2`
- Rollback baseline: `04c383d6-9d41-4125-b3c2-e29e7169cbb8` (`20261006-plug-glass-2`)

That publish wraps the existing stacked Worker. It does not replace it with this repository’s `worker/index.js`.

Check the running page with `window.__cvPlugRelease` and `window.__cvPlugFocusRelease`. On that deploy both should read `20261006-plug-streamline-2`.

Live behavior, as last verified on that deploy:

- Tabs, in order: Communiverse, Cool Kids, Ambassadors, Artisans.
- Communiverse shows 11 portraits per page. The other tabs show up to 8. A pager (`nav.glass-pages`) appears when there is another page.
- Choosing a portrait stays on the page. The portrait moves to the center. The others gather to the left. Details open on the right.
- Counts recorded then: 7 Cool Kids, 3 Ambassadors, 58 Artisans. These are directory records, not a customer count.
- Haseeb appears once as `cv-haseeb-wasim`. Keiffer’s duplicate public cards are folded in presentation.
- The “Back to everyone” button is still in the published script. It was removed only in source after that publish.

Assets for that release:

- https://espacios.me/communiverse/_public/20261006-plug-streamline-2.css
- https://espacios.me/communiverse/_public/20261006-plug-streamline-2.js

`espacios.me` HTML often returns a Cloudflare challenge to plain `curl`. The CSS and JS URLs above returned 200 with a browser user agent on 2026-10-06.

## Do not deploy this repo over production

`npx wrangler deploy` from this repository replaces the live stacked `communiverse` Worker. That stack is ambassadors-entry, then rigid-arc, then older layers, then static assets and the waitlist. A normal repo deploy drops those layers.

A production publish has to wrap the modules already running, the same way ambassadors `20261006-ambassadors-1` and Plug `20261006-plug-streamline-2` were published. This environment’s Wrangler is not authenticated. Cloudflare MCP can read Workers. It cannot deploy.

Plug CSS and JS are cached `immutable` for a year. A visible change needs a new release id in the HTML. Reusing `20261006-plug-streamline-2` will keep serving the old file.

## Two pull requests

### PR 7 is the continuation of the live page

https://github.com/gugmaae-prog/communiverse/pull/7

- Branch: `cursor/plug-flat-background-c1ee`
- Base: `codex/plug-streamline-20261006`
- Tip: `11b7626` — Slow Plug focus portrait motion so a move settles in about 1.2s.

Commits on top of the live streamline note:

| Commit | What changed |
| --- | --- |
| `5115d1f` | Flat canvas `#f3f6fb`. No dot grid in the source styles. Profile name uses the system font. |
| `6579cc3` | Removes the “Back to everyone” button from `worker/releases/plug-glass/focus.js`. |
| `11b7626` | Slows the focus spring. Release constant inside that script is `20261006-plug-streamline-4`. |

None of these three commits are on the live Worker.

### PR 6 is a separate constellation page

https://github.com/gugmaae-prog/communiverse/pull/6

- Branch: `cursor/communiverse-plug-c1ee`
- Base: `main`
- Tip: `041a731` — Set the Plug person name in Fraunces.

This branch builds one cluster of every cleaned public profile, with no pager. Filters there are Communiverse, Ambassadors, Artists, All. It is not the glass page that is live. Do not merge it over PR 7 expecting the live layout to remain.

## Source map for the live-style page

On `cursor/plug-flat-background-c1ee`:

- `worker/releases/plug-glass/focus.js` — selection, spring, pager, profile panel. This is the script that matches the reviewed UI. Communiverse is the way out of a profile: a tab click calls `close(false)`. Escape still closes. The close button is not created.
- `worker/releases/plug-glass/focus.css` — glass panel, and `background-image: none` on the page. `.glass-close` is `display: none` so an older script’s button stays hidden if this CSS is what loads.
- `worker/plug-present.js` — shared directory CSS. Canvas is `#f3f6fb` with no dot grid.
- `worker/plug.js` — Next and Worker directory renderer. Release constant here is still `20261006-plug-3`. It is not the focus release.
- `worker/releases/plug-streamline/DEPLOYMENT.md` — last real publish. Read this before touching production.
- `app/plug/page.tsx` — local Next page. It renders `worker/plug.js`. It does not boot `focus.js`.

`worker/releases/plug-glass/handler.js` still says release `20261006-plug-glass-1` and imports `focus-script.txt`, `focus-style.txt`, and `people-plug.js`. Those generated files are not in the checkout. The handler is behind the script in `focus.js`. Do not treat the handler as the live entry without rebuilding it.

Local preview of the Next directory:

```bash
npm test
npm run dev
```

Open http://127.0.0.1:43123/communiverse/plug/. That is the `worker/plug.js` page. To review the focus motion, the page has to load `worker/releases/plug-glass/focus.js` the way production does, after the directory HTML.

## Motion, as of `11b7626`

In `focus.js`:

```js
function spring(p, v, t, dt) {
  const nv = v + (18 * (t - p) - 7.8 * v) * dt;
  return [p + nv * dt, nv];
}
```

Opacity eases with `1 - exp(-dt * 2.8)`. A 60fps step response overshoots by about 0.006%. At 400ms about 45% of the move remains. Error is inside 2% at about 1.2s. The final snap only runs inside 0.05px. `prefers-reduced-motion: reduce` still snaps immediately.

The published `streamline-2` script is the fast spring (`78` stiffness, `17` damping). The slow spring is source-only until a wrapped publish of `streamline-4`.

## Review notes that are easy to get backwards

- The user asked for every Communiverse portrait at once, with no pager and no overlap. PR 6 does that. The live glass page, and `focus.js` on PR 7, still paginate. Communiverse uses 11 slots (`WIDE`). Other tabs use 8 (`TIGHT`).
- The user rejected the dotted grid. Source styles on PR 7 are flat `#f3f6fb`. A screenshot on 2026-10-06 still showed an 18px dot grid, which is the older `20261006-plug-portraits-1.css` rule. `streamline-2.css` sets `background-image: none !important`. If dots are still visible, the page is not loading that override.
- The user rejected “Back to everyone” because Communiverse already leaves the profile. Removed in `focus.js` on PR 7. Still present in the published `streamline-2` script.
- “Our font” was ambiguous. PR 6 sets the directory name in Fraunces. The streamline deploy note says the live page uses `-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif`. PR 7’s glass name follows that system stack. Do not mix those without asking which page is in front of the reviewer.
- Categories are data. Do not invent who is an ambassador, artist, or cool kid. On the directory parser, a tag is `communiverse`, `ambassador`, or `artist` from `data-plug-category`, `data-plug-categories`, or a skill chip whose text is exactly one of those words. Add the chip on the Plug profile. No Supabase column was added.
- Hidden from the directory presentation: slugs `hello`, `member-11a676`, `psr-homes-9e4436`, `oak-residency-09aff6`, `dilfaz-group-30f2eb`, `tnt-finances-27f363`, `espacios-me-0aa3ba`, `gugma-ae-4e8b34`, and the matching names. Keiffer’s public cards collapse to one, preferring the richest profile.
- Profile links on the Communiverse side go to `/communiverse/plug/u/<slug>`. That proxy patches `replace(//$/,"")` to `replace(/\/$/,"")` and adds “Back to Communiverse”. The live glass card links at the public Plug profile URL instead.
- Directory fetch is `GET https://espacios-auth-central.thekeifferjapeth.workers.dev/plug`. It is the public approved slice, capped by that server. Account sync can create a public approved profile. This page does not send messages, offers, invites, bids, reviews, or AI requests.

## Tests

`npm test` runs `node --test worker/plug.test.mjs`. Last run on the motion change passed 7 tests. Node prints a module-type warning because `package.json` is not `"type": "module"`. That warning is expected.

`node --check worker/releases/plug-glass/focus.js` checks the focus script as a script. It is not part of `npm test`.

## Suggested next step

If the reviewer is on https://espacios.me/communiverse/plug/, publish PR 7 by wrapping the current live Worker. Serve `focus.js` and `focus.css` under a new id, `20261006-plug-streamline-4`, and point the page at those URLs. Leave every non-Plug module in place. Confirm `window.__cvPlugFocusRelease` is `20261006-plug-streamline-4`, the dot grid is gone, “Back to everyone” is gone, and a portrait takes about 1.2 seconds to settle.
