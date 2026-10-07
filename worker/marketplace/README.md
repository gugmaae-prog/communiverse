# Communiverse marketplace layer

The marketplace Worker owns `/communiverse/`, `/artists/`, `/works/`,
`/workshops/`, `/stories/`, `/join/`, their published detail routes, and its
versioned browser script. Every other request goes through the `LEGACY` service
binding to the existing `communiverse` Worker. This preserves Plug, ambassadors,
gallery media, existing pages, and the live `/communiverse/api/waitlist` handler.
The Join form posts to that existing D1-backed, rate-limited API; it does not
claim that an email notification is sent.

`video-art.js` transcribes `communiverse-video-art.xlsx` (`Video art!B7:H19`,
supplied 7 October 2026). The 13 media and poster URLs were checked on the
live site. The sheet identifies subjects and processes, not makers. Do not
attribute them to artist profiles or treat them as saleable inventory.

Artists, works and workshops read only published rows from a future dedicated
Supabase project through its publishable key and RLS. The schema is in
`supabase/migrations/20261007_marketplace_catalog.sql`. **The project was not
created or charged** because the user declined the stated $10/month cost.
No sample artists, prices, sessions or objects are seeded. Until the dedicated
project is configured, those pages intentionally show empty states. To activate
the catalogue later, apply the migration to a dedicated project, verify RLS,
then set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` on this Worker. Do not
use the unrelated `entity` Supabase project or put a secret key in the Worker.

Local checks:

```sh
npm test
npm run build:marketplace
npm run preview:marketplace
```

The local preview never submits Join requests; its API returns 501. The staged
Worker URL is `https://communiverse-marketplace.thekeifferjapeth.workers.dev/communiverse/`.

Production routing uses the existing two zone routes:

| Route | Original script |
| --- | --- |
| `espacios.me/communiverse*` | `communiverse` |
| `www.espacios.me/communiverse*` | `communiverse` |

After staged responsive and delegation checks, those route **script values**
can be changed to `communiverse-marketplace` while retaining the exact patterns
and `request_limit_fail_open` setting. The original Worker remains deployed and
available through the service binding. Rollback is the reverse route update,
followed by checks on the root, Plug, media and waitlist API. Never run the
repository's root `wrangler deploy` over the stacked production Worker.
