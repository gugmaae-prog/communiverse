# Current Communiverse public Worker

This standalone package reconciles the verified public v25 release. It is separate from the repository's legacy Next.js application and cannot deploy through the root Wrangler configuration.

Run from this directory:

    npm ci
    npm run verify:source
    npm run build
    npm run lint
    npm test
    npm run preview

The preview serves recorded public records and does not prove account writes or authentication. It uses local-only storage and stub service bindings. Production deployment requires a guarded version upload retaining existing assets, bindings and runtime settings, followed by zero-traffic verification and explicit promotion. Never upload this directory as an unrestricted static directory.

Server-only notification recipients have intentionally been removed from this public source copy. Set `CV_NOTIFICATION_RECIPIENTS` to the existing private recipient list before releasing; empty configuration must not be treated as successful email delivery. Environment values, credentials, database exports and private submissions must not be committed.

See `../../docs/site-fixes/recon.md` from the repository root for the full source and service map. Original third-party copy and historical runtime modules retain their recorded bytes; their import is not a new editorial rewrite.
