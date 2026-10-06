# Communiverse Clubs

The Communiverse site published at [espacios.me/communiverse](https://espacios.me/communiverse/). This Next.js app is that dark gallery experience. Copy and image paths live in `data/`. [`AUDIT.md`](AUDIT.md) records the earlier Framer site at communiverseclubs.com.

Use this repository as the reference when replicating the site. The audit records what the live site contains; the `data/` files are the copy and image paths the app actually renders.

## How to use this repo to replicate the site

1. Read [`AUDIT.md`](AUDIT.md). It is the page-by-page record of the live site: sitemap, navigation, copy, and which routes have a real page body.
2. Open [`audit/screenshots/`](audit/screenshots/) for the visual reference. Screenshots are JPEG. Each page folder (`home`, `how-it-works`, `makers`, `contact`, `about`, `for-founders`, `for-brands`, `for-startups`, `not-found`) holds frames from desktop (1440×900), tablet (768×1024), and mobile (390×844):
   - full-page shots: `desktop-full.jpg`, `tablet-full.jpg`, `mobile-full.jpg`
   - scroll frames: `desktop-scroll-*.jpg`, `tablet-scroll-*.jpg`, `mobile-scroll-*.jpg`
   - hover states: `hover-*.jpg`
   - the open mobile menu: `mobile-menu-open.jpg`

   `not-found` only has `desktop-full.jpg`.
3. Compare the replica with the live site using the side-by-side JPEGs in [`audit/comparison/`](audit/comparison/) (`<page>-desktop.jpg` and `<page>-mobile.jpg`).
4. Change words and image paths in `data/`, not by editing copy inside components:
   - [`data/site.ts`](data/site.ts) — name, email, navigation, social links, shared images
   - [`data/home.ts`](data/home.ts) — homepage sections
   - [`data/pages.ts`](data/pages.ts) — how it works, makers, contact, and the empty routes

Photographs in [`public/media/`](public/media/) are capped at 1600px on the long side.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:43123/communiverse/](http://127.0.0.1:43123/communiverse/). Every route is under the `/communiverse` base path.

## Deploy to Cloudflare Workers

The site is a static export (`output: 'export'`) with `basePath: '/communiverse'` and `trailingSlash: true`. `worker/index.js` strips that prefix before the asset binding, and serves the home page for `/communiverse` with or without a trailing slash. `wrangler.jsonc` publishes the worker as `communiverse` on `espacios.me/communiverse*` and `www.espacios.me/communiverse*`.

From this repo, after a build:

```bash
npm run build
npx wrangler deploy
```

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs only when someone starts it with `workflow_dispatch`. A push or merge to `main` does not deploy. Add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then run the Deploy workflow from the Actions tab.

To deploy again on every push to `main`, put the push trigger back in that workflow:

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

Add the two secrets before turning the push trigger back on. The workflow installs dependencies, runs `npm run build`, and publishes with `cloudflare/wrangler-action`.

The packaged artifact `communiverse-deploy.zip` is the same worker, config, and export (images resized for the 25 MB limit). From the unzipped folder:

```bash
unzip communiverse-deploy.zip -d communiverse-deploy
cd communiverse-deploy
npx wrangler deploy
```

Preview the export locally with `npm run preview`, then open [http://127.0.0.1:8788/communiverse/](http://127.0.0.1:8788/communiverse/).

## Pages

| Path | What it is |
| --- | --- |
| `/communiverse/` | Home |
| `/communiverse/how-it-works/` | How it works |
| `/communiverse/makers/` | For makers |
| `/communiverse/contact/` | Waitlist form |
| `/communiverse/about/` | Shared chrome only, as on the live site |
| `/communiverse/for-founders/` | Shared chrome only |
| `/communiverse/for-brands/` | Shared chrome only |
| `/communiverse/for-startups/` | Shared chrome only |

The contact form validates in the browser and does not submit. Wiring it to a backend is marked with a `TODO` in `components/waitlist-form.tsx`.
