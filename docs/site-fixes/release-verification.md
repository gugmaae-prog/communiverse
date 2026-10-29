# A-K integration, verification and guarded release

## Source and PR order

The source reconciliation is #32. Workstreams A-K are separate stacked PRs #33-43, in order. Integration PR #44 is based on K and contains the final repairs, release tools and sanitized evidence. [Recon](recon.md) maps the actual Worker, catalogue, services, forms, authentication and tenant boundaries. The root Next.js deployment remains guarded.

## Exact release state

At the final verification checkpoint on 29 October 2026:

| State | Worker version | Traffic |
| --- | --- | --- |
| Public v25 with runtime compatibility | `771fd47e-62f4-4243-801c-13cd6f9edbc6` | 100% |
| Full A-K candidate | `29964e9f-2d18-4405-b5be-f72e02ff9e08` | 0% |
| Pre-work v25 rollback | `802e5e6d-760f-4946-801a-2dab6fbc8273` | 0% |

The candidate source commit is `43f00b3b6a4abd077f5c880d8d80867d64eaba33`. Later evidence-only commits do not change its runtime. Deployment `4faed79f-e305-4a2d-9c3a-790ec77f004a` records the assignment. The account cutover flag is false. Normal public responses still identify v25.

The runtime compatibility update is a real production change. A zero-percent candidate initially could not call the new limiter RPC because Durable Object code follows the active version. The compatibility release uses the reviewed source-reconciliation/v25 snapshot, all 321 original assets and a backward-compatible RegistrationDelivery class. It changes no namespace, schema or existing notification state. Local tests preserve legacy completed receipts and prevent mixing limiter and notification objects.

## Verification evidence

- Build and owned-module/client syntax lint pass; all 38 tests pass. Tests cover stable artist/work URLs, initial HTML and metadata, unknown-record 404s, redirects, Home curation/pagination, hubs, reports, honeypots, Turnstile failure/replay, concurrent limiter transactions, duplicate receipts and isolated D1 authentication boundaries.
- Original 146 retained modules and 321 assets remain hash-verified. The 55 new 1200x630 sharing images have a separate manifest. Publication scan covers 589 files with zero findings; high-confidence token scanning of 380 tracked text files finds none. Dependency audit reports zero vulnerabilities.
- The final anonymous Cloudflare crawl covers 171 sitemap pages, including all six artists and 48 works, plus discovered versioned clients and additional internal links. See [crawl evidence](evidence/public-crawl.json) for exact counts, headers and results. Filled honeypots return 200 without delivery; valid payloads lacking a challenge return 400. A repeated Join-client probe returns 200 ten times after removing its unnecessary retained-service/D1 dependency.
- The final edge concurrency probe returns five HTTP 204 responses and fifteen HTTP 429 responses for twenty concurrent sanitized CSP reports. It queues no notifications. A new regression also verifies limiter storage errors and malformed RPC replies return 503; CSP reporting does not silently accept limiter failures.
- Axe reports zero automated violations on Home, Workshops, selected Circles and an artist portfolio at 375px and 1440px. Gradient contrast remains an incomplete/manual audit item. No Lighthouse 95+ score or completed performance acceptance is claimed.
- Browser geometry checks at 375px, 1440px, 845px landscape and reduced motion find 14 people, 1:1 portraits, no touching cards and no horizontal overflow. Outside click deselects; Escape closes artwork and then profile, including direct links with body focus. No Circles card close buttons were added. The report dialog has one close control, five reasons, optional 1000-character details, focus containment/return and a disabled reset state.
- Sixteen screenshots cover 375px and 1440px. They show the local candidate/public-data fallback. Overall-empty event/club examples are labeled QA fixtures; catalogue records were not deleted. Screenshot pixels precede only nonvisual keyboard and limiter failure-handling changes.
- Initial requests immediately after an upload briefly reached v25 at two URLs. The later complete verification run records routing retries and version headers separately; this does not establish user acceptance of the candidate.

## Integration repairs

The retained browser API used both body and data parameter names. Its adapter now supports both, protects writes and reports successful catalogue reads without referencing an undefined variable. The public Join helper is owned and independent of D1. Active-hub overall totals distinguish filtered emptiness. Unknown gallery API records return 404. Stale workspace-only script links and retired public links are removed. Account configuration initializes externally; prefixed APIs, host-only cookies, logout cleanup, safe returns and WebSocket responses are preserved behind the disabled cutover. Security applies to generated pages without broadening shared-host HSTS or global CSP reporting paths. Required labels, visible card names, report reset state and sticky header contrast are repaired.

## Promotion gates and human inputs

Full site promotion remains blocked by successful production Turnstile plus notification-delivery acceptance and default sharing-image design sign-off, as required by the user's plan. Production widget and secret configuration are installed. The verified sender and private notification recipients remain unchanged. No real challenge was solved and no successful live email delivery is claimed.

Branded accounts remain independently blocked by production D1 write capacity and all retained authentication providers passing end-to-end. Current edge logs additionally confirm daily D1 read-quota exhaustion. Public catalogue fallback responses are not proof of write readiness. LinkedIn project access/configuration remains unverified. [The account runbook](../auth-domain-migration.md) records callback, recovery, provider changes and rollback. No DNS changes are needed or performed.

Legal review/placeholders, workshop facts and Hira's actual portrait remain human inputs. The legal draft banners and neutral HS avatar are intentional. Sharing images require approval. Supabase exposure/RLS was inspected read-only; existing shared policies were not changed. CSP remains report-only for the new policy pending review.

The release tool verifies current ownership, existing twelve bindings, clean committed source, all source/asset hashes, production form configuration and acceptance inputs. Normal rollback keeps the compatibility v25 at 100%. The deeper pre-work version is recorded above. No billing, DNS, database-policy, destructive cleanup, payments or visual redesign is included.
