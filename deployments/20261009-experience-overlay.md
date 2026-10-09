# Communiverse experience release — 9 October 2026

Status: LIVE on https://espacios.me/communiverse/

## Runtime

New presentation Worker: communiverse-experience-20261009
Worker version: f29340a1-748f-4c09-9c1e-c35fef8deeeb
Worker deployment: 6bcd6d03-823c-40c2-a94e-27c195fbc01d

The original communiverse-marketplace Worker remains unchanged at version 4a659bea-6915-4093-a7e7-8ab9c85ccfb4 and remains the authority for application operations and data.

The new Worker delegates via service binding COMMUNIVERSE_RUNTIME, preserves the existing D1 database via COMMUNIVERSE_DB, forwards unchanged requests, and injects experience CSS and JS only into successful GET HTML responses. No database writes, media uploads, account changes or existing Worker deployments occurred during this release.

## Routes

For BOTH espacios.me and www.espacios.me:
- /communiverse/* → experience Worker
- /communiverse/_public/* → original marketplace Worker (static/media bypass)
- /communiverse/media/* → original marketplace Worker
- /communiverse/api/* → original marketplace Worker
- /communiverse/_public/cv-experience-20261009.js* → experience Worker
- /communiverse/_public/cv-experience-20261009.css* → experience Worker
- /communiverse/api/workspace/pipeline* → experience Worker
- /communiverse/api/knowledge/query* → experience Worker

Existing /communiverse* routes remain with communiverse-marketplace.
The mail.espacios.me callback route remains unchanged.

## Features

1. Avatar-only account chip with accessible user label.
2. Wider responsive artwork viewer and larger, uncropped imagery.
3. Related-work navigation into existing item deep links, plus source-based related-work query.
4. Authorized workspace task cards with real owners, project, due dates, status and avatars.
5. Polished file picker UI, filename feedback and client size limits; server upload flow retained.
6. Pipeline 'Assigned ambassador' avatar (real D1 assignment and verified staff identity; not represented as verified original onboarder).
7. Structured read-only knowledge API for authorized task lists, team, review requests and assigned artist relationships.

## Production validation

- Live mobile homepage includes experience script and style; visual content renders.
- Plug, Workspace (signed-out), Discover, Artists, Join, Sign in, Objects, People, Events and Communities loaded.
- Versioned JS and CSS endpoints load.
- Public related artwork response includes real work IDs; targeted item API returns a record with related works.
- Unauthenticated pipeline endpoint preserves login requirement.
- GitHub syntax and knowledge-model checks completed successfully.

Authenticated workflow and user interaction tests remain to be completed with a suitable login. Do not claim that live task owner tooltips, uploads, account sign-in or artist pipeline controls were user-tested end to end.

## Rollback

Query Cloudflare zone Workers routes. Remove ONLY the 16 new routes listed above (8 per hostname). Retain the original routes ending communiverse* and the mail callback. Verify traffic returns to communiverse-marketplace. Only then optionally disable the experience Worker. D1 data is unchanged. Never deploy legacy root Wrangler against this application.
