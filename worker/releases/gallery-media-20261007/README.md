# Communiverse gallery additions — 7 October 2026

Five supplied craft videos are added to the existing opening gallery, taking it from 20 to 25 cards. Existing cards, motion, pause controls, detail viewer, and reduced-motion / Save-Data behavior stay under the same controller. Clips remain muted in the gallery; the viewer retains playback controls and the original audio track.

| Input | Web asset | Duration |
| --- | --- | --- |
| 1dda2b625efc1653a9ac32ed10ab60c1.mp4 | fine-lettering | 52.1 s |
| 86db903140229454a275e4da39879d29.mp4 | draped-wood-sculpture | 16.2 s |
| 4ac3282e62c6760ca681c8fe36297bf1_720w.mp4 | carved-dog | 10.0 s |
| 71197c6442889151a5939a4c158251e4_720w.mp4 | mirror-metal-sculpture | 19.0 s |
| b96435cd0b84738cf27e2e35f38b0f3a.mp4 | wire-sculpture | 57.2 s |

Web versions use H.264, AAC, 540 × 960, yuv420p, and faststart. Poster JPEGs retain 720 × 1280. Download originals are unchanged. Captions describe visible processes without assigning names, affiliations or product availability.

## Release assembly

The production homepage is ahead of repository main. This change wraps recovered production. Do not deploy repository main or replace its static-assets collection.

```sh
node scripts/prepare-gallery-media.mjs <recovered-production-directory> <new-candidate-directory>
```

The assembler verifies every retained module SHA-256, patches the existing gallery media list, copies the ten new assets, and creates a homepage-only entry. Only the homepage gallery script reference changes. Other routes, existing modules, bindings and assets stay with the retained production entry.

Baseline: `274fb6c1-664c-4637-9c6b-63553ef4158b`, 98 retained modules. Recover the then-current production version before each upload. New release id: `20261007-gallery-media-1`.

Validation: script syntax; Worker dry run; inherited-header and route-delegation checks; full, partial, suffix, invalid and HEAD video responses; all five videos decoded; desktop and 390px mobile viewer preview. The local preview uses the retained server HTML without Next hydration and is not evidence of production acceptance. Follow independent live verification after release.
