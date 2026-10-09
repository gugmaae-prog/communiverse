# Communiverse business knowledge

## Live release

Release `20261009-knowledge-1` is installed as the independent Cloudflare Worker `communiverse-business-knowledge`. Worker version: `b4b618e9-4804-4139-904b-cff102520f16`; deployment: `0bbe292e-e038-42dd-9155-2c5109c70972`.

The existing workspace assistant routes now reach this gateway. It authenticates through the original application service, queries authorized D1 records, retrieves audience-filtered business knowledge, and returns source-aware answers. Strategic prose reuses the original Groq integration through the APP service; no provider credential was copied. Explicit drafts and submit operations retain the original assistant handler and its permissions.

The base application remains at version `4a659bea-6915-4093-a7e7-8ab9c85ccfb4`. No marketplace module, experience-v2 module, page layout, media asset, account credential, Supabase configuration or existing business record was replaced. New persistence consists of `cv_knowledge_documents`, its visibility index, 28 source-labelled entries and the `20261009_business_knowledge.sql` migration record.

## Knowledge coverage

The initial corpus has 28 entries: 8 member-level implementation explanations, 14 internal staff entries, 5 restricted leadership entries and 1 technical/platform entry. The business sources are the October 2 pre-seed deck, the October 1 draft ambassador department deck, and inspected Social 12 implementation. Confidential source text is held in D1, not this public repository.

Coverage includes mission, audiences, five proposed revenue streams, Learn/Make/Collect/Belong, regional strategy, RAL, dated roadmap, restricted financing/modelled budget, programme responsibilities, recruitment, scorecard, consent/content standards, restricted compensation/equipment proposals, reporting and actual application workflows. Historical, proposed and draft claims remain labelled; they do not become approved prices, contracts or live commitments.

Sixteen live lookup areas are implemented: tasks, projects, approval requests, team, artist assignments/pipeline, catalogue, events, communities, meetings, messages, file metadata, recorded sales, products, booking requests, permitted earnings and notifications. Counts are computed over permitted records rather than the first 60 tasks in an LLM prompt. Records are paginated, with IDs, links, source collection, source dates, checked-at timestamps and explicit incomplete/unavailable results.

## Access boundaries

Identity comes only from the APP service response, never a request-supplied role or ID. Project and request scopes follow the reviewed production policy. Messages and meetings require participant membership, including for executives. Artist finance follows studio/assignment permission; members never receive internal ambassador earnings. File keys and customer contact details are not selected. Credentials and secret values are never knowledge sources. Missing records do not imply zero business activity; assignment is not evidence of sourcing/onboarding. External listings and manually recorded income are not proof of inventory or settlement.

POSTs require the canonical origin and JSON, with a 12 KB body limit. The gateway has per-identity rate limiting, no-store responses and query-redacted operational logs. New documents require reviewed ingestion, not automatic policy overwrite through chat.

## Build and tests

Node 24 is used by CI. No npm dependency is required.

```sh
node worker/business-knowledge/assemble.mjs
node --check worker/business-knowledge/dist/worker.mjs
node --test worker/business-knowledge/worker.test.mjs
```

The assembler checks the original source digest and applies five bounded, unambiguous transforms for intent coverage and result provenance. It refuses unexpected source or output. The assembled/deployed SHA-256 is:

`1b675a845386ac95e15db48926f4c9e40bd745736611d3ecfb5bc432c5475f54`

All 43 local tests passed. GitHub Actions run `37915964989`, job `113772083259`, independently completed successfully: checkout, Node setup, checksummed assembly, syntax and the SQLite-backed permission tests.

The test suite covers scoped tasks/counts/pagination, request reviewers, studio/finance isolation, participant-only messages, private file metadata, SQL/prompt-injection scope, document audiences, draft/source preservation, explicit-submit forwarding, provider fallback, relative dates and no-credential exposure. Fixtures are synthetic and use in-memory SQLite; they are not production test accounts.

Live checks at `2026-10-09T10:07:41.696Z`: knowledge health 200; anonymous assistant, alias, query and restricted-document requests 401; existing artist-assignment endpoint remains 401 on its original Worker; experience-v2 JS/CSS, workspace/home HTML and a sampled WebP all returned 200. The uploaded source was downloaded and hashed to the tested digest before assistant activation.

## Routes and rollback

Only these new route IDs belong to this release:

| Route pattern | ID |
|---|---|
| espacios.me/communiverse/api/knowledge/health* | 693e76382daa480b98bc8da201d6aaf2 |
| espacios.me/communiverse/api/knowledge/query* | 43ae351b9295488c8fde67686f96dbb6 |
| espacios.me/communiverse/api/knowledge/documents* | d3607ca6ec4f473eb3c4797e6b6a4082 |
| espacios.me/communiverse/api/assistant* | 65434878f71649088d92c013199909bd |
| espacios.me/communiverse/api/workspace/assistant* | 30b365072f374ccbbec3c13d6ad16fed |

Handlers accept only their explicit paths; wildcards accommodate query strings and a trailing slash. They do not expose a general D1 proxy. The existing `/api/knowledge/artist-assignments*` routes remain owned by `communiverse-experience-v2-20261009`.

Rollback: remove only the five route IDs above after verifying current ownership. The original `/communiverse*` application route then handles the original assistant again. Do not remove the base application, experience Worker, source documents, account records, media or database. Do not redeploy the old repository root Wrangler configuration. `upload-metadata.json` records this independent Worker's API bindings, not a replacement app configuration.

## Remaining boundaries

This is a source-grounded business assistant, not omniscience. Unrecorded decisions and unconnected documents remain unknown. Arbitrary PDF/Office/image/video contents are not automatically read; file lookup currently returns authorized metadata. Newly added business documents need reviewed ingestion and audience tagging. Document facts are dated snapshots; operational D1 records are read at question time. Query intent/term matching is bounded, not a universal semantic search engine. Dates use UTC boundaries unless the record carries its own time zone. The event lookup uses the discovery catalogue, not live external ticket inventory.

A real signed-in human session and a live Groq business answer were not exercised during this release. The authenticated role matrix and provider behavior were tested with isolated adapters, while production checks covered routing, anonymous denial, source/configuration and unchanged public surfaces. Separate authentication findings from the full-stack audit remain outside this knowledge-only change.
