# Communiverse Plug — repo note 20261006-plug-1

This repository change adds Plug as a public people page inside Communiverse. It does not deploy onto the live stacked `communiverse` Worker, and it does not move Plug’s private handlers.

## Route

Canonical page: `https://espacios.me/communiverse/plug/`

`/communiverse/plug` and `/communiverse/plug/` both serve the page. `/communiverse/people` and `/communiverse/people/` redirect to the canonical path. The page CSS and script live at `/communiverse/_public/20261006-plug-1.css` and `.js`.

`worker/plug.js` handles those paths only, and only when the host is `espacios.me` or `www.espacios.me`. `worker/index.js` calls it after the ambassadors handler and before static assets. Other Communiverse routes stay with the existing handlers.

## How members load

Each page view fetches the public directory HTML from `https://espacios-auth-central.thekeifferjapeth.workers.dev/plug`, reads the public profile cards, and places them in a constellation: circular portraits on a gray field, with All, Founders, Design, and Market filters. A filter collapses the other circles onto the people in that group. The mark under the cluster cycles the next group. Each circle links to `https://espacios.me/plug/u/<slug>`.

Message, offer, team invite, course suggestion, and rating stay on that Plug profile. This page does not send them. Offers, bids, rates, and contracts are not a payment flow. Espacios does not process payments.

The directory is a public slice with a server cap. Account sync can create a public approved Plug profile, so this page does not describe the list as manually approved.

If that fetch fails, or the HTML has no public cards, the page explains the network and links to `https://espacios.me/plug`. It does not invent member names.

The Next.js route `app/plug/page.tsx` is the same presentation for the static export and local Next dev. The export cannot refresh members per request, so it reads the directory when the page is built. On `espacios.me`, the worker handler runs first and is the request-time page.

## Production

Do not publish this repo with `npx wrangler deploy` or the Deploy workflow. That would replace the live stacked Worker — ambassadors-entry, rigid-entry `20260930-rigid-arc`, and the older layers down to the static asset worker — with this repo’s asset worker.

A production publish has to wrap the existing live modules, the same method as ambassadors release `20261006-ambassadors-1`. This change does not perform that upload. No live Communiverse version was created from this repo note.
