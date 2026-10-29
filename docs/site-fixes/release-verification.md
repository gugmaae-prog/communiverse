# Release verification and guarded promotion

The source reconciliation and A-K workstreams are stacked PRs. This follow-up records final integration verification and the safe candidate upload/staging tools. Original retained modules and assets remain hash-checked.

Integration repairs: filtered club API responses now carry an actual unfiltered overallTotal, so a populated catalogue's filtered-empty state cannot be confused with an overall-empty catalogue. Unknown gallery API identifiers return HTTP 404. Missing sharing assets return 404 instead of assuming an assets binding exists.

The release script verifies the expected current production version, a clean committed source tree, all original/added hashes, all twelve existing bindings and production form configuration before upload. Secret values are passed only to Cloudflare's secret bindings and are never written to the public repository or evidence. Asset upload preserves all 321 original assets and adds 55 sharing images. The script supports staging the candidate at 0% while v25 stays at 100% and records the rollback assignment.

Promotion acceptance is separate: successful public crawl, Circles checks, real production form delivery, default sharing-image approval and a rollback record are required. Account cutover must remain false. The release gate refuses promotion when those inputs are absent. D1/provider acceptance remains independently required for accounts.

A free managed Turnstile widget was created for Communiverse and its retained account host. Its secret is held in Cloudflare; publication evidence contains no value. Existing sender and private notification recipients remain server-owned. No email DNS, billing, production database policy or destructive cleanup is included.

Final evidence and release state are added after the candidate checks. Local screenshots are explicitly candidate views; overall-empty screenshots are labeled QA fixtures because live events and clubs remain populated. Axe is used as the plan's permitted accessibility audit; Lighthouse numeric scores are not claimed.
