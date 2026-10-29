# F: Form validation and abuse protection

Recon map: the owned public registration wrapper uses the retained KV receipt store, RegistrationDelivery Durable Object namespace and verified welcome@communiverse.espacios.me sender. The retained account backend keeps its authentication and authorization checks and existing D1 throttles. Original modules remain immutable.

Server-side Turnstile verifies hostname and action and rejects absent, failed or replayed tokens. Missing keys fail closed in production. Only explicitly marked development on the preview/local hostname may operate without keys, with a warning. The browser resets expired and consumed tokens and exposes the check on enquiry, RSVP, report, club and email account forms. Filled honeypots are silently acknowledged before persistence or sending and are off-screen, outside keyboard order and hidden from accessibility APIs.

Five submissions per IP per ten minutes use transactional sliding windows in separately named abuse objects in the existing namespace. HMAC object names avoid storing raw IPs. Limiter objects cannot enqueue notifications, notification objects cannot become limiters, and their alarm paths are separate. Existing notification receipts, request IDs, per-recipient retry behavior and account throttles are preserved. Identical submission retries reuse their receipt; changed data with the same reference is rejected.

Reports validate the fixed five reasons and optional 1,000-character details, retain verified-account and target validation and moderation behavior, and store structured content in the existing reason TEXT field. No database schema change is required. Workshop facts are nullable and omitted until supplied; the conversation link leads to the form.

Verification: build/lint and 23 tests pass. Tests cover production failure without keys, wrong hostname/action, single-use outcomes, development restrictions, honeypot drops with no KV write, required fields, 20 concurrent requests admitting exactly five, duplicate receipts and conflicting reference payloads. All six artist and 48 artwork routes remain covered.

Not done: live submissions and notification delivery are not exercised with real people or live email. Account cutover remains disabled. These are candidate changes, not production acceptance.

Needs human input/configuration: production Turnstile widget/site key and secret, server-only CV_ABUSE_KEY_SECRET, retained server-only CV_NOTIFICATION_RECIPIENTS, workshop facts, and end-to-end provider/write acceptance. Empty examples are in .env.example; no secret values are committed. The release gate must refuse promotion if required form configuration is absent.
