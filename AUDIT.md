# Communiverse Clubs — site audit

Audited 27 September 2026 from the live site `https://www.communiverseclubs.com/`.

Captured with Playwright (Chromium) at 1440×900, 768×1024, and 390×844. Full-page shots, scroll frames, nav hovers, and the mobile menu are under `audit/screenshots/<page>/`.

## Platform

The site is **Framer**.

- Response header `server: Framer/26fa766`
- `framer-site-id: 736d644345e0d57c186c88e7a0afe6c4cdb2b9010a962d9c34cb023d2892a1b2`
- HTML is server-rendered, then hydrated. Breakpoint variants are duplicated in the DOM (`ssr-variant`).
- Assets load from `framerusercontent.com`.
- Last-Modified on the homepage: Tue, 22 Sep 2026 09:15:03 GMT.

There is no chat widget, map, or booking embed. The only third-party product script observed is **Google Analytics 4**, measurement id `G-SB1KJ4EP9T` (gtag / googletagmanager). Framer’s own events script (`events.framer.com/script`) is also present.

## Discovery

`robots.txt` allows all crawlers and points at the sitemap.

`sitemap.xml` lists eight URLs:

| URL | In navigation | Has page body |
| --- | --- | --- |
| https://www.communiverseclubs.com/ | Logo | Yes |
| https://www.communiverseclubs.com/how-it-works | Section label, not the top nav item | Yes |
| https://www.communiverseclubs.com/makers | FOR MAKERS | Yes |
| https://www.communiverseclubs.com/contact | CONTACT, waitlist CTAs | Yes |
| https://www.communiverseclubs.com/about | No | Chrome only |
| https://www.communiverseclubs.com/for-founders | No | Chrome only |
| https://www.communiverseclubs.com/for-brands | No (nav goes to `/#for-brands`) | Chrome only |
| https://www.communiverseclubs.com/for-startups | No | Chrome only |

Probed and **not** published (HTTP 404, title `Page Not Found | Framer`): `/privacy`, `/privacy-policy`, `/terms`, `/terms-of-service`, `/experiences`, `/for-collectors`, `/blog`, `/faq`, `/waitlist`, `/brands`, `/founders`, `/404`, and an arbitrary missing path.

### Every URL found

**Pages**

- https://www.communiverseclubs.com/
- https://www.communiverseclubs.com/contact
- https://www.communiverseclubs.com/how-it-works
- https://www.communiverseclubs.com/makers
- https://www.communiverseclubs.com/about
- https://www.communiverseclubs.com/for-founders
- https://www.communiverseclubs.com/for-brands
- https://www.communiverseclubs.com/for-startups

**On-page anchors**

- https://www.communiverseclubs.com/#how-it-works
- https://www.communiverseclubs.com/#for-brands
- https://www.communiverseclubs.com/contact#contact

**Off-site**

- mailto:hello@communiverseclubs.com (homepage and footer)
- mailto:noreply@gmail.com (the visible contact-page address is `Hello@communiverseclubs.com`; the underlying `mailto` on that page is `noreply@gmail.com`)
- https://www.instagram.com/ and https://instagram.com
- https://www.linkedin.com/
- https://x.com/ and https://x.com/ (hero “X” href includes a trailing space: `https://x.com/ `)
- https://x.com/jenkatemw (“Find Your People” in the footer)
- https://framer.link/jenkatemw (“XDC Network”)

Niche cards and “APPLY TO FOUND A CLUB” point at `/`, not a separate apply URL.

## Site map

```
/                         Home
├── #how-it-works         Steps section (nav “HOW IT WORKS”)
├── #for-brands           Brands section (nav “FOR BRANDS”)
├── #experiences          Experiences section (nav “EXPERIENCES” actually links to /)
├── /how-it-works         Long-form steps page
├── /makers               Maker waitlist page
├── /contact              Waitlist form
├── /about                Footer only
├── /for-founders         Footer only
├── /for-brands           Footer only
└── /for-startups         Footer only
```

## Global design

### Colour

| Token | Hex | Where |
| --- | --- | --- |
| Paper | `#E9ECEF` | Page background (`rgb(233, 236, 239)`) |
| Ink | `#000000` | Headings, body, footer ground |
| Muted | `#686A62` | Eyebrows such as “(About Communiverse)” |
| Sage | `#B3BCB6` | Footer secondary (“Let’s build Together!”) |
| White | `#FFFFFF` | Contact form panel, reversed type |
| Shell | `#181818` | Unpublished routes read as near-black |

Also seen in source CSS but not as a surface: `#09F` link blue (default anchor, covered by child text), `#999`, `#E9ECEF1A`.

### Type

| Role | Family | Weight | Size | Tracking | Notes |
| --- | --- | --- | --- | --- | --- |
| Giant wordmark | Poppins | 500 | 179px | −10.8px | “COMMUNIVERSE”, uppercase, line-height ~144px |
| Display heading | Poppins | 600 | 72px (h2), 64px (h3), 160px (how-it-works h1) | about −0.03em | Uppercase, line-height 1 |
| Step title | Poppins | 600 | 40–64px | −0.03em | |
| Serif body | Fraunces | 500 | 22.08px | −0.44px | Line-height 26.5px. Eyebrows use the same size in `#686A62` |
| Hero subtitle | Fraunces | 500 | 40px | −1.6px | “Find Your People”, centered |
| UI / nav | Poppins | 500 | 16px | 0 | Nav links are white with `mix-blend` so they read dark on paper |
| Footer email | Poppins | 600 | 64px | −1.92px | Click copies the address |
| Footer launch | Poppins | 600 | 38px | −0.76px | |
| Small caps statements | Poppins | 500 | ~14–16px | wide | CSS `text-transform: uppercase` on several long paragraphs |

Google Fonts serves Fraunces. Poppins is self-hosted by Framer (including “Poppins Variable” and Fontshare files).

### Spacing and grid

- Desktop nav height **84px**, padding **16px 64px**.
- Page inset **64px** (16px on small screens in the replica’s reading of the mobile frames).
- Hero text column is **454px** wide and starts near **x = 216**.
- Right hero portrait is about **288px** wide (`x ≈ 936–1224`) and runs most of the first viewport.
- Headings sit in a measure of roughly **12–16ch** / ~682px, left aligned.
- CTAs measure about **211×56**, square corners, Poppins 16/500.

### Buttons and hovers

- Primary CTA: outlined rectangle, label in Poppins 16/500. Hover darkens (captured as `hover-*.jpg` on each page).
- Nav items gain an underline on hover. Captured for HOW IT WORKS, FOR MAKERS, FOR BRANDS, EXPERIENCES, CONTACT, the wordmark, and social marks.
- Footer email button swaps its label to “Copied!”.
- Niche cards are links (target `/`). Hover is a slight image scale in the replica; the live cards sit in a horizontal row.
- Mobile: a “( Menu )” control opens a full-viewport dark overlay. Captured as `mobile-menu-open.jpg`.

### Motion

- Homepage “A SPACE FOR THE PASSIONATE, FROM EVERYWHERE” is a **scroll-pinned horizontal gallery**. The document is ~23,885px tall on desktop largely because of that sticky sequence. Full-page screenshots of that region come out blank; the scroll frames (`desktop-scroll-05` through `desktop-scroll-17` and `desktop-scroll-late-*`) show the portraits.
- A text ticker reads `// FOUND YOUR CLUB //` and `// APPLY NOW //`.
- The join band types through fragments (`A`, `AP`, `APP`, … `APPLY NOW`) before the waitlist heading. That is a text-scramble / type-on, not a modal.
- Portrait strip above the footer loops horizontally.
- No accordion, slider dots, or dialog was found.
- Sticky header stays over the page.

## Meta tags

Shared on most routes:

- **title:** Communiverse Clubs
- **description:** A marketplace for collector communities, crafts, arts and experiences. Buy, sell, earn and authenticate collectibles within trusted clubs. A home for the makers, find Your People
- **og:type:** website
- **og:title / twitter:title:** Communiverse Clubs
- **og:description / twitter:description:** same as description
- **og:image / twitter:image:** `https://framerusercontent.com/images/xXdYhZAFRTBsbncmKuApxDc3TO8.png`
- **twitter:card:** summary_large_image
- **canonical:** the page URL

Exception — `/how-it-works`:

- **title:** How It Works | Communiverse
- **description:** See how Communiverse helps communities, makers, and collectors build something they own together.

## Page: Home `/`

Background `#E9ECEF`. Scroll height ≈ 23,885px at 1440px wide.

1. **Nav.** Wordmark left. Links: HOW IT WORKS → `/#how-it-works`, FOR MAKERS → `/makers`, FOR BRANDS → `/#for-brands`, EXPERIENCES → `/`, CONTACT → `/contact`.
2. **Hero.** H1-scale word “COMMUNIVERSE” (a styled paragraph, not an `h1`). Centered Fraunces line “Find Your People”. Serif intro and “We are built for the Culture.” CTA “JOIN THE WAITLIST” → `/contact`. Tall portrait on the right. Bottom row: `(Contact)` + email, `(Scroll Down)` TO EXPLORE MORE, `(Follow)` IG / IN / X.
3. **Passion.** H2 “WHERE PASSION BECOMES POWER.” Eyebrow “(About Communiverse)”. Infrastructure paragraph. CTA → `/contact`. Portrait.
4. **Steps** `#how-it-works`. The whole block links to `/how-it-works`. H2 “THREE STEPS TO A CLUB THAT RUNS ITSELF.” 01 Found, 02 Build, 03 Earn.
5. **Makers.** H3 “MADE BY HAND. SIGNED BY NAME.” “(For Makers)”. Long paragraph. “JOIN AS A MAKER”.
6. **Experiences.** H3 “SOME THINGS YOU CANNOT SHIP.” “(Experiences)”. Workshop paragraph. “JOIN THE WAITLIST”.
7. **Culture.** White type on black. H3 “THE CULTURE HAS ALWAYS BEEN HERE. IT JUST NEVER HAD A HOME.” Uppercase supporting line. CTA. Square photograph.
8. **Founders.** H2 “YOU BUILT THE COMMUNITY. NOW BUILD THE BUSINESS.” “(For Founders)”. CTA → `/contact`. Two portraits.
9. **Gallery.** Caption “A SPACE FOR THE PASSIONATE, FROM EVERYWHERE” over a horizontal run of editorial portraits, driven by scroll.
10. **Brands** `#for-brands`. H3 “STOP SPONSORING AUDIENCES. START PARTNERING WITH COMMUNITIES.” “(For Brands)”. “JOIN THE BRAND WAITLIST” → `/contact`.
11. **Provenance.** “(The Provenance)”. H3 “EVERY PRODUCT HAS A STORY. WE MAKE SURE IT’S NEVER LOST.”
12. **Niches.** “(ANY NICHE WORKS!)”. “APPLY TO FOUND A CLUB” → `/`. Six linked cards: 01 Toy Collectibles, 02 Timeless Accessories, 03 Stamps for your Soul, 04 Iconic Streetwear, 05 Gifts from Earth, 06 Fine Craftsmenship (spelled that way on the live site). Ticker `// FOUND YOUR CLUB // // APPLY NOW //`.
13. **Four ways.** “(Four Ways In)”. H2 “LEARN. MAKE. COLLECT. BELONG.” Four columns.
14. **Join.** Black band. Type-on toward “JOIN THE WAITLIST” → `/contact#contact`. Looping portrait strip.
15. **Footer.** See below.

Copy above is verbatim from the rendered DOM (headings are stored in uppercase or uppercased by CSS; serif paragraphs are sentence case in the HTML).

## Page: Contact `/contact`

One viewport (scroll height 900 at 1440×900).

- Left: portrait (`H11…jpg`, alt “Woman Portrait photography”), inset from the page edge. A second asset `NJ6…png` is also in the DOM.
- Right: white panel. H3 “FIND YOUR PEOPLE” (64px Poppins 600). “Join the Communiverse waitlist. Tell us whether you are a maker, brand, or collector and we will be in touch.”
- **Form** (`method` get, action `/contact`). Visible fields:
  - Your Name* — text, required, name `Your Name`
  - Email* — email, required, name `Email`
  - Subject — text, required, name `Subject`
  - Message* — textarea, required, name `Message`
  - Submit button “SUBMIT”
  - Hidden honeypot inputs (website, company, message, subject, …) are not shown.
- Bottom row: `(Contact)` Hello@communiverseclubs.com, `(Follow)` IG IN X.

## Page: How it works `/how-it-works`

Scroll height ≈ 3,397px. No photographs. Paper background, black footer.

- Eyebrow “(How It Works)”
- H1 “A CLUB THAT RUNS ITSELF.” at **160px**
- Intro paragraph, rendered uppercase
- H2 “THREE STEPS TO A CLUB THAT RUNS ITSELF.”
- 01 FIND / 02 BUILD / 03 EARN (wording differs from the homepage steps)
- H2 “START WITH YOUR PEOPLE.”
- Closing paragraph, rendered uppercase (the live sentence is missing “in” before “Communiverse”)
- “JOIN THE WAITLIST” → `/contact`
- Footer

## Page: Makers `/makers`

Scroll height ≈ 5,267px. Typographic, no images in the DOM.

- “(For Makers)”
- H2 “YOU MADE THE WORK. YOU SHOULD OWN WHAT IT BECOMES.”
- Intro, rendered uppercase. “JOIN THE MAKER WAITLIST” → `/contact`
- H2 “WHAT YOU KEEP” — 01 YOUR NAME, 02 YOUR WORK, 03 YOUR PEOPLE
- “(The Standard)” / “WE DO NOT LIST ANYONE WE HAVE NOT MET.”
- “(Provenance)” / “THE MAKER’S MARK”
- H2 “FOUR WAYS TO EARN” — TEACH, MAKE, SELL, BELONG
- “WE ARE SIGNING MAKERS NOW.” plus the same waitlist CTA
- Footer

## Shell pages

`/about`, `/for-founders`, `/for-brands`, `/for-startups` share one layout: near-black canvas, the global nav, and the global footer. There is no heading or section body. A small “(Marketplace Loading)” label sits at the top of the footer. Scroll height equals the viewport (900 / 1024 / 844). These four routes are in the sitemap and return HTTP 200.

## Footer (shared)

Black band.

- “(Marketplace Loading)”
- H4 “Q4 2026 LAUNCH”
- “(Follow)” Instagram → instagram.com, Linkedin → linkedin.com, X/Twitter → x.com
- H5 “Let’s build Together!” in sage
- Email button `hello@communiverseclubs.com` (copies; shows “Copied!”)
- “(Drive)” Find Your People → https://x.com/jenkatemw
- “(Copyright)” 2026 © COMMUNIVERSE. All Rights Reserved
- “(Powered By)” XDC Network → https://framer.link/jenkatemw

## Media

48 image files were downloaded from `framerusercontent.com` into `public/media/` (resized to a 1600px long edge for the replica; originals on Framer are up to ~9000px). The wordmark favicon is a white “C” on black (`6mcf62…png`). The Open Graph card is `xXdYhZAFRTBsbncmKuApxDc3TO8.png`.

## Screenshots

Each content page has:

- `desktop-full.jpg`, `tablet-full.jpg`, `mobile-full.jpg`
- `desktop-scroll-*.jpg`, `tablet-scroll-*.jpg`, `mobile-scroll-*.jpg`
- `hover-*.jpg` for nav and CTA hovers
- `mobile-menu-open.jpg`

Homepage also has `desktop-scroll-late-*.jpg` for the pinned gallery and the sections after it. `audit/screenshots/not-found/` is the Framer 404.

## Remaining visual differences

Mean channel error against the original first viewport (lower is closer), after matching Framer’s Fontshare Poppins, Fraunces italic, and measured frames:

| Page | Desktop | Mobile |
| --- | ---: | ---: |
| Home | 3.2 | 9.0 |
| Contact | 7.9 | 8.3 |
| How it works | 0.5 | 5.9 |
| Makers | 0.5 | 8.9 |
| About, for-founders, for-brands, for-startups | 3.0 | 5.9 |

What still differs:

- Home desktop is the nesting-dolls portrait in the measured 288×450 frame. The live hero stacks three photos and crossfades; a later capture can show the crochet frame instead. Mobile follows the mobile original, which shows the crochet portrait in that slot.
- The wordmark is the same 179.391px Poppins setting. It lands about 10px narrower than Framer’s text-fit box, so a few letters sit slightly tighter.
- Contact’s left panel is the black field with the abstract image at 40% opacity and a 1px blur, portrait inset on top. The wash and the white “FIND YOUR PEOPLE” over the photo are still a few pixels off.
- Below the home hero, sections share copy and photographs. They are not pinned to every Framer absolute coordinate, and the gallery scroll distance is shorter.
- The join band types `A` → `APPLY NOW`. The niche row also keeps the `// FOUND YOUR CLUB //` ticker.
- Photographs are capped at 3200px on the long side. Google Analytics is not loaded. The 404 is branded; the live 404 is Framer’s default page. The waitlist form validates locally and does not submit.

## Interactive behaviour, summary

| Behaviour | Present |
| --- | --- |
| Sticky / blend-mode nav | Yes |
| Mobile full-screen menu | Yes |
| Scroll-pinned horizontal gallery | Yes, home |
| Marquee ticker and portrait strip | Yes, home |
| Type-on “APPLY” | Yes, home |
| Accordions, modals, carousels with controls | No |
| Maps, chat, booking widgets | No |
| Analytics | GA4 `G-SB1KJ4EP9T` |
| Forms | Contact waitlist only |
