# Communiverse Plug — repo note 20261006-plug-3

This repository change adds Plug as a public people page inside Communiverse. It does not deploy onto the live stacked `communiverse` Worker, and it does not move Plug’s private handlers.

## Route

Canonical page: `https://espacios.me/communiverse/plug/`

`/communiverse/plug` and `/communiverse/plug/` both serve the page. `/communiverse/people` and `/communiverse/people/` redirect to the canonical path. The page CSS and script live at `/communiverse/_public/20261006-plug-3.css` and `.js`.

`worker/plug.js` handles those paths only, and only when the host is `espacios.me` or `www.espacios.me`. `worker/index.js` calls it before static assets. Other Communiverse routes stay with the existing handlers.

## How members load

Each page view fetches the public directory HTML from `https://espacios-auth-central.thekeifferjapeth.workers.dev/plug` and reads the public profile cards.

The pills are **Communiverse**, **Ambassadors**, **Artists**, and **All**, in that order. They filter on `plugCategory` tags: `communiverse`, `ambassador`, and `artist`. A profile can have more than one. The directory reads them from `data-plug-category`, `data-plug-categories`, or a skill chip whose text is exactly one of those three words. No one is assigned a category in this repo. Until a profile is tagged, only **All** has people.

To tag someone now, add a skill chip of exactly `communiverse`, `ambassador`, or `artist` on their Plug profile. Those chips are already saved and printed on the public card. A later `data-plug-category` attribute on the card is read the same way.

Placeholder and brand cards are not shown: `hello`, `espacios me`, `gugma ae`, `Member`, PSR Homes, Oak Residency, Dilfaz, and TNT. The Keiffer Japeth cards, including the Cantara spelling, are folded into the single richest profile.

Portraits use a spring on position, diameter, and scale (about one second to settle, with overshoot). Leaving portraits fade out and scale to 55% in place. Each circle opens `/communiverse/plug/u/<slug>`, which patches the known `replace(//$/,"")` syntax error on the Plug profile and adds a link back to Communiverse. The full cleaned directory is listed under the cluster.

## Preview

```bash
npm test
npm run dev
```

Open `http://127.0.0.1:43123/communiverse/plug/`. The worker handler itself only answers on `espacios.me` and `www.espacios.me`, so local Next is the preview. A production publish still has to wrap the live Communiverse modules.

Message, offer, team invite, course suggestion, and rating stay on that Plug profile. This page does not send them. Offers, bids, rates, and contracts are not a payment flow. Espacios does not process payments.

The directory is a public slice with a server cap. Account sync can create a public approved Plug profile, so this page does not describe the list as manually approved.

If that fetch fails, or the HTML has no public cards, the page explains the network and links to `https://espacios.me/plug`. It does not invent member names.

The Next.js route `app/plug/page.tsx` is the same presentation for the static export and local Next dev. The export cannot refresh members per request, so it reads the directory when the page is built. On `espacios.me`, the worker handler runs first and is the request-time page.

## Production

Do not publish this repo with `npx wrangler deploy` or the Deploy workflow. That would replace the live stacked Worker — ambassadors-entry, rigid-entry `20260930-rigid-arc`, and the older layers down to the static asset worker — with this repo’s asset worker.

A production publish has to wrap the existing live modules, the same method as ambassadors release `20261006-ambassadors-1`. This change does not perform that upload. No live Communiverse version was created from this repo note.
