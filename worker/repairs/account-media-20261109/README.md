# Communiverse media completion — 9 November 2026

This source package builds a small addition to the **current live account-pause and media-recovery release**, version `6bb81c45-be64-40da-b09a-62e8e6f08316` on `communiverse-workspace-ux-v3-20261009`. It preserves that release's account handling and existing **403-file static asset bundle**. No asset re-upload, authentication restoration, provider change, or database migration is part of this addition.

The large baseline module is omitted from the repository package. Its exact SHA-256 is `87370e2eb8aad872779d481ea60dcde3251e2c876048f6383c0cbe319808d5fb`; its version, archived part name, and byte count are recorded in [`baseline.json`](baseline.json). The release owner retains the captured bytes separately in the private release archive.

## Changes

- `media-type.mjs` corrects successful public image responses delivered as `application/octet-stream`, preserving their bytes, status, range, and caching headers.
- `unavailable-media.mjs` removes dead comparison-photo references for nine verified unavailable originals and a missing film poster. It labels those originals temporarily unavailable while retaining displayed artwork, identity, films, attribution, and provenance. It does not invent replacement photographs.
- `scripts/optimize-baseline.mjs` creates a guarded derivative of the pinned baseline. It precomputes the same immutable portrait JSON and raw/escaped URL replacement pairs once, preserving their sequential replacement order. The original captured module is never modified.
- `entry.mjs` wraps the optimized application with those two media transforms, preserves its named exports and scheduled handler, and adds a release header.

## Setup and focused checks

```sh
npm ci
npm test
```

The default tests need only the packaged source. They cover MIME/status/cache preservation, exact unavailable-media boundaries, unchanged public identity/film/artwork, and the real Cloudflare HTMLRewriter with streamed HTML and embedded JSON through Miniflare.

## Supply the exact baseline

Place the privately retained module at `modules/public-worker.mjs`, matching `baseline.json`. Alternatively, extract it from the **archived multipart response for the pinned baseline**, without any network request:

```sh
python3 scripts/extract-archived-baseline.py --input-multipart /path/to/archived-source.multipart
```

Add `--verify-only` to validate an archive without writing the large module. The helper verifies complete byte length and SHA-256 before writing, and refuses a different release or conflicting output.

The final build rebundles this baseline, so the latest live Worker source does **not** necessarily contain an independently extractable copy of those original bytes. Do not use a GET of the latest Worker as an assumed baseline-recovery method. Keep the authorized original capture in the private release archive.

## Optional equivalence checks and build

These commands require the exact baseline file:

```sh
npm run test:baseline
npm run build
```

Four equivalence checks compare all eager catalogue/cache results, both portrait transforms on fourteen retained public HTML strings and two cache JSON strings, every raw/escaped portrait URL, serialized metadata, and repeated/combined/Unicode edge inputs. Node instrumentation stubs only the Cloudflare Durable Object base imports; these tests never invoke application handlers or make provider/database calls.

The build verifies the baseline SHA and two exact function anchors, generates `modules/optimized-worker.mjs`, then emits `build/repaired-worker.mjs` with a SHA-256 record. Esbuild runs with `platform: browser` and **`keepNames: false` explicitly**. The portable build reproduced the staged candidate artifact SHA-256 `24199b4ce198a198eb9105c55bdcff76cf46eca9dcc4fe8c3b325477bdf52905` exactly. Some retained code serializes functions with `Function.prototype.toString()`; `keepNames: true` can insert a helper into serialized functions that does not exist in the browser. Keep the explicit setting and run the tests before release.

Dependencies and the lockfile are pinned. Generated modules, build artifacts, local dependencies, multipart captures, and environment files are excluded from Git.

## Release boundary and evidence

This package contains no publishing command, credentials, production settings, database data, or media bytes. Uploading the generated module must preserve current bindings, secrets, compatibility settings, schedules, Durable Object migrations, and the current static asset bundle (`keep_assets: true` in the reviewed release flow). Re-read production state before any release; do not deploy over a newer unrelated version.

Local Wrangler 4.159.0 profiles measured active startup at 483.1 ms for the pinned baseline and 57.1 ms for the optimized derivative. These are local comparisons, not production guarantees. The staged final candidate `5708a309-7858-4d25-8047-005e0c84d6ec` reported 224 ms Cloudflare startup. Local optimization evidence is in [`optimization-evidence.json`](optimization-evidence.json).

The release owner fills the final record after live acceptance:

- Final version: `5708a309-7858-4d25-8047-005e0c84d6ec` (100% traffic)
- Deployment identifier: `ef948f1a-48ce-466c-a839-18ab21088aa5`
- Verified live behavior and media coverage: 188/188 referenced images returned 200 with image content types; 16 people and 63 works retained; Contact and Avid originals matched SHA-256; eleven public pages returned 200 and six account entry routes returned local 503 pages without redirects.
- Validation date and evidence location: 9 November 2026; `validation.json` records the release and focused acceptance checks.
- Remaining unavailable comparison originals/poster: nine historical before-editing originals remain unavailable and are labeled; Luna’s unavailable secondary film poster is omitted. No image was substituted.
- Code rollback target: `6bb81c45-be64-40da-b09a-62e8e6f08316`; all account data and the static bundle were preserved
