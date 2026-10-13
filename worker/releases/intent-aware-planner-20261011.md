# Intent-aware Cosmos planner — 11 October 2026

A recruitment question previously received generic steps and a travel allowance
calculator. Clear ambassador recruitment goals now open the approved planning
layout directly from authorized workspace context, without creating a request
proposal merely by asking.

## Result

- Seven phases: brief, sourcing, shortlist, interview/trial, approval, onboarding,
  and outcome review. Every phase has actions, an output, an owner and optional
  due date. Native grouped details keep one phase expanded at a time.
- Region, target headcount and start date stay unset unless explicitly supplied.
  Existing ambassadors are never treated as the desired recruitment headcount.
  The submitted typos are recognized.
- Funding is optional and collapsed. Recruitment and general planning have no
  days × people × allowance formula or zero working estimate.
- Event and content planning have their own phase templates. Other planning
  goals get an editable delivery outline and the assistant's authorized context.
  Simple support requests and informational questions retain their original flow;
  equipment and travel keep their existing specialized controls.
- Drafts save in this browser, scoped by workspace identity and goal, with a
  bounded 20-draft inventory. This release does not introduce cloud draft sync.
- Review shows every proposed task and requires owners. Users can create a new
  project or use an accessible existing project. Existing project membership is
  checked before creation; required CEO sign-off is carried onto the approval
  phase. No fees, availability, dates, assignments or approvals are invented.
- Project/task writes use the existing APIs and stable request UUIDs. A saved
  creation snapshot supports interrupted/lost-response retries without duplicate
  tasks. Editing freezes once creation begins; completed drafts reopen the
  recorded project. Notifications remain owned by the original backend.
- Recruitment waits for native workspace hydration, so its final render stays
  visible when a user asks immediately after page load.

## Build and runtime ownership

Run `node scripts/build-workspace-v3.mjs <output-directory>` to produce
`gateway.mjs`, `v3-client.txt` and `v3-style.txt`. The client combines
`goal-planner.js` with `experience-v3.js`; styles combine the existing stylesheet
with `goal-planner.css`. `production-gateway.mjs` injects versioned asset URLs.

Deploy only these modules to `communiverse-workspace-ux-v3-20261009`, retaining
its existing `MARKETPLACE → communiverse-marketplace` service binding, six
routes and compatibility settings. Do not deploy the repository's legacy root
Worker over the retained marketplace runtime.

## Release evidence

- Version: `9fe8debf-97c5-4180-8ec3-a89f9ab106cb`, 100% traffic
- Deployment: `2cb2f548-247e-4531-8b8a-8210209947e4`
- Rollback before this feature: `557fc417-4574-4000-8e08-8206c6a6b95a`
- Three live modules byte-identical to the focused build
- Binding, six routes, compatibility date `2026-10-09`, flags, usage model,
  placement, tail consumers and logpush preserved
- No backend, identity, notification, D1/R2/Supabase configuration or schema change

Validation: five Node intent/context tests; 22 browser behavioral assertions at
320, 390, 768 and 1440px; 64 existing/integration assertions including hydration,
support-request preservation and informational answers; focused Wrangler dry
run; zero-traffic and production HTTP asset hashes and signed-out API denial.
Authenticated production verified the submitted typo and normalized goal, seven
phases, blank headcount, stable visibility after load, review/back navigation,
44px icon controls and no mobile overflow. Creation/retry tests used mock API
responses, including a response lost after a task was recorded. No production
projects, tasks, submissions or notifications were created during QA.
