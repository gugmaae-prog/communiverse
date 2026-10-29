# A: Legal and privacy

Privacy and Terms are draft pages in the existing shell. Legal review is required, with explicit registered-address, effective-date, governing-law and retention placeholders. The actual application providers are Cloudflare infrastructure/email and Supabase OAuth, with Google/LinkedIn when chosen by the visitor. No analytics were added.

## Storage inventory

- Host-only account/member/workspace session cookies: authentication, up to 90 days, subject to server expiry.
- Recovery, OAuth and profile-link state cookies: short-lived authentication state. The account recovery fragment is removed from browser history on entry.
- `cv-onboarding-role`: session storage for a chosen onboarding role.
- `cv-circle-return`: local storage, validated with a 30-minute expiry, used to return after sign-in.
- `cv-circle-draft`: local storage for an unsent club form, removed after successful submission; no independent expiry is configured.
- Cosmos assistant session/planning storage and a fresh-start marker: necessary assistant navigation/conversation state. Final retention wording requires confirmation.
- Cloudflare security/challenge storage may be set by the platform.

The inventoried application code did not identify analytics/marketing trackers, so this work adds no consent banner. Recheck rendered third-party requests before release. Non-essential trackers must be blocked pending consent if introduced later.

Legal drafting references: UAE legislation https://www.uaelegislation.gov.ae/en/legislations/1972/download, GDPR https://eur-lex.europa.eu/eli/reg/2016/679/oj, Colombia Law 1581 https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981. These references do not establish legal approval of the drafts.

Needs human input: legal review; registered address, effective date, governing law/forum; final lawful bases, international transfer safeguards, account/log/backup retention and request-response procedures.
