# Communiverse Regression Recovery and QA — 9 October 2026

## Current status

Production remains on the original communiverse-marketplace Worker. All 16 routes added by the earlier experience gateway were removed. The three original domain and mail callback routes remain intact. No D1/R2 or account mutations took place.

Corrected experience-v2 is staging only: not merged and not deployed to the production domain. The signed-in "null" issue reported by the user is not yet reproducible with an anonymous browser session.

## Verified root causes of the previous release

1. The previous broad path gateway proxied almost the entire application without live authenticated verification.
2. The previous related-work script intercepted native gallery click handlers, created a competing navigation flow, and produced transition conflicts. The application already supports native data-open buttons and artwork URL changes.
3. The previous AI change tried to append task cards after Groq's prose response had been rendered, making interactive results unreliable.
4. The avatar-only header depended on a JavaScript-added class. The corrected CSS hides the visible text on its own and retains an accessible label.
5. The pipeline owner (frequently Louis) is not the assigned ambassador or proof of original onboarding.

## Implemented in the staging branch

- style.css: avatar-only header, neutral responsive artwork viewer with uncropped images, cards, polished native file picker, accessible focus indicators.
- client.js: intercepts task-list intent BEFORE the legacy assistant; uses server-authorized workspace/overview data for interactive task cards with native task IDs, owner and collaborators, filters, deadlines and statuses; does not cancel the native gallery click; removes only stale expanded artwork state.
- knowledge-worker.mjs: read-only authorization-first artist assignments from original pipeline authorization and D1 joins; labels "Assigned ambassador" rather than asserting original onboarding.
- staging-gateway.mjs: staging-only original Worker proxy with mock data on fixture paths, not a deployable replacement for production.
- qa-fixture.html, qa-runner.js and qa-public-runner.js: browser-based regression checks.

## Browser test results

Real public website with staging enhancement against the original Communiverse Worker:
- 390 x 844: 13 / 13 passed
- 768 x 1024: 13 / 13 passed
- 1440 x 900: 13 / 13 passed
Total: 39 / 39.

Staging simulated signed-in workspace fixture:
- 320 x 740: 15 / 15 passed
- 390 x 844: 15 / 15 passed
- 1024 x 768: 15 / 15 passed
- 1920 x 1080: 15 / 15 passed
Total: 60 / 60.

Combined browser assertions: 99 / 99. This is NOT a substitute for production signed-in testing.

Public route sweep returned normal content, without literal null, for Discover, Artists, Events, Communities, Plug, Join, Sign in, Workspace, Objects, People and Ambassadors (11 routes).

Unauthenticated artist assignment knowledge request returned "Please sign in" without exposing records. Unknown knowledge route returned "Not found".

GitHub CI Communiverse Regression Gates passed code syntax and knowledge-projection unit tests. Latest successful job as of verification: https://github.com/gugmaae-prog/communiverse/actions/runs/37909243057

## No-production-deploy gate

DO NOT merge or publish the new UI until:
1. A controlled authenticated test of the reported null view has passed.
2. Real staff task lists, role scoping, native task opening/editing and actual real identity photo work across sign-in, refresh and sign-out.
3. Staff artisan assignments show the correct real assigned ambassador (not default pipeline owner), without leaking unauthorized artist details.
4. File upload/download/validation is verified against real storage without destructive edits.
5. Real signed-in navigation and OAuth/callback paths are checked in portrait, landscape and desktop.
6. Reduced motion, keyboard and focus behavior are verified.
7. Release is limited, measurable and reversible, preserving the existing marketplace Worker and all data; no broad wildcard route flip.
8. Post-release error, latency and blank/null-page checks pass.

## Staging details

Code: worker/experience-v2/ on fix/communiverse-regression-qa-20261009.
Workers: communiverse-regression-qa-20261009 (staging browser fixture and real public proxy), communiverse-knowledge-qa-20261009 (authorization check). These are not bound to the production zone.
Production site: https://espacios.me/communiverse/
Original protected backend: communiverse-marketplace.

Important: Do not claim that live signed-in regression is fixed until a real authorized account test has been completed.
