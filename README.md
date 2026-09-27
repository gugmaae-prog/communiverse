# Communiverse Clubs

A working replica of [communiverseclubs.com](https://www.communiverseclubs.com/). The live site is a Framer project. This copy is a Next.js app with the same pages, copy, and photography, laid out so the words and image paths can be rebranded from the files in `data/`.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:43123/communiverse/](http://127.0.0.1:43123/communiverse/). Every route is under the `/communiverse` base path.

## Deploy to Cloudflare Workers

The site is a static export (`output: 'export'`) with `basePath: '/communiverse'` and `trailingSlash: true`. `worker/index.js` strips that prefix before the asset binding, and serves the home page for `/communiverse` with or without a trailing slash. `wrangler.jsonc` publishes the worker as `communiverse` on `espacios.me/communiverse*`.

From this repo, after a build:

```bash
npm run build
npx wrangler deploy
```

Pushes to `main` also deploy through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow installs dependencies, runs `npm run build`, and publishes with `cloudflare/wrangler-action`. Add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` before the first run. The workflow can also be started manually with `workflow_dispatch`.

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

## Edit the content

- `data/site.ts` — name, email, navigation, social links, shared images
- `data/home.ts` — homepage sections
- `data/pages.ts` — how it works, makers, contact, empty routes

Photographs live in `public/media/`.

## Audit

`AUDIT.md` is the page-by-page record of the live site. Screenshots are in `audit/screenshots/`. Side-by-side comparisons are in `audit/comparison/`.
