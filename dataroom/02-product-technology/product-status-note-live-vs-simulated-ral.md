# Product Status Note - live vs simulated (RAL)

> Source: `02 Product & Technology/Product Status Note - live vs simulated (RAL).docx` (v3 pre-seed data room, Drive folder 16sZJ0DxrSbUenVXP5MgJyVnAhBhJnZoC). Text conversion of the original DOCX; layout and images not preserved.

# Communiverse: Product Status Note (what's live vs simulated)

Version 1 · 15 Oct 2026 · Owner: Keiffer Japeth, with Abel Thomas and Louis Mitchell to confirm. Status from public checks on 15 Oct 2026 and the internal audit of 9 Oct 2026. Figures: Key Figures.

Bottom line. Communiverse has a live waitlist site, an interactive product demo and a live artist directory with a booking flow. There are no transactions, no confirmed bookable slots and no signed artisans [KF-20, KF-21, KF-24]. RAL, the Regional Agentic Layer, is a scripted simulation inside the demo. It does not run operations today [KF-38].

| Surface | URL | Status | What's real | What's simulated or not built |
|---|---|---|---|---|
| Marketing site and waitlist | communiverseclubs.com | Live (Framer) | Waitlist capture (count GAP [KF-25]) | Copy is out of date ("Club That Runs Itself", "signed and verified, one per craft") and conflicts with the deck [KF-20]; fix pending |
| Product demo | communiversedemo.xyz | Live | Buyer journeys (Learn / Make / Collect / Belong), artisan onboarding (6 steps), ambassador flow | All data is sample data. 16 demo artisans [KF-22]. Colombia and Italy are disabled |
| RAL (inside the demo) | communiversedemo.xyz | Live demo | The operating-model design: supply, demand, delivery and back-office agents; human decision points (s7) | Scripted: "a simulated clock runs a working day", "10 scripted Moments", "illustrative 12% take". Agent counts are inconsistent (24 / 27 / 26) [KF-39]. The Economics tab (AED 72,600 a month per country) is illustrative and not aligned with use of funds [KF-42] |
| Plug: artist directory and booking | espacios.me/communiverse | Live (hosted on Keiffer's Cloudflare account) | Artist profiles, booking flow; AI search and drafts (Groq API) [KF-41] | 113 hosts listed, including deceased and unconsented artists from public gallery listings, with 0 confirmed slots [KF-21]. Circles (community) are empty. Clean-up is due before Monday |
| Payments / checkout | — | Not built | — | Marketplace checkout is on the roadmap (s9 / s15) [KF-43] |
| Mobile app | — | Concept only | — | — |

## AI position (for IDI AI-Readiness / Data & Model Position)

In production: third-party LLM calls for search and drafting on Plug [KF-41]. There are no proprietary models.

Designed, not built: RAL agents. The deck's "Trained on our own booking-to-delivery data" (s7) can't be true yet, because there are no bookings. Correct wording: "Designed to learn from our booking-to-delivery data once live."

Human decisions by design: artisan selection, storytelling, pricing, payouts, refunds and safety (s7).

Data captured today: the waitlist and onboarding records in the prototype database. A data inventory and consent records are GAP.

## Ownership and hosting (for Legal & Regulatory)

The Plug site runs on espacios.me in Keiffer's Cloudflare account. The deck credits Abel Thomas with the platform and demo (s13). The asset register (domains, Cloudflare, repos, Canva) and IP assignments to Common Folk Group, Inc. are GAP (see Missing Items).

## Not yet available

Prototype video, UX walkthrough videos, architecture diagram, RAL build-status sign-off (Louis).

Pre-seed framing and v2 update (added 15 Oct 2026, 3:15 PM Dubai)

Built today (evidence: public checks 15 Oct): waitlist site, product demo with sample data, RAL as a scripted simulation, Plug directory and booking flow [KF-21, KF-22, KF-38, KF-41]. Building: RAL agents, payments and checkout, mobile app, verification protocol, data inventory [KF-38, KF-43]. Team change from deck v2: Abel Thomas is not on the team (he did not join), so the credit to Abel above (s13, v1) is historical; who built and owns the platform and demo code is UNVERIFIED until the asset register and IP assignments are filed [KF-65]. Sign-off is now needed from Louis Mitchell only. Figures cite the v1 Key Figures link; IDs are unchanged in Key Figures CURRENT (1g6tSJ8c…), which governs.


