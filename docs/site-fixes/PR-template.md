## Recon map

See docs/site-fixes/recon.md for the verified source, hosting, routing, data, forms, authentication and tenant boundaries.

## What changed

## Not done

## Needs human input

- [ ] Legal review, registered address, governing law and effective date
- [ ] Workshop prices, currency, durations and group sizes
- [ ] Hira's portrait
- [ ] Sharing-image design sign-off
- [ ] Confirm Home-only exclusions for the three specified artworks
- [ ] Turnstile production configuration
- [ ] Account write capacity and OAuth provider configuration before cutover
- [ ] Review CSP reports before switching the new policy to enforcement

## How to verify

From worker/public-domain: npm ci, npm run verify:source, npm run build, npm run lint, npm test, npm run preview.
