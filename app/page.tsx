import Link from "next/link";
import { ApplyType } from "@/components/apply-type";
import { CtaLink } from "@/components/cta-link";
import { HeroCarousel } from "@/components/hero-carousel";
import { Marquee } from "@/components/marquee";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StickyGallery } from "@/components/sticky-gallery";
import { Wordmark } from "@/components/wordmark";
import { home } from "@/data/home";
import { site } from "@/data/site";

function NichesSection({ mobile = false }: { mobile?: boolean }) {
  return (
    <section className={mobile ? "home-niches home-niches-mobile" : "home-niches home-niches-desktop"}>
      <p className="home-eyebrow">{home.niches.eyebrow}</p>
      <CtaLink href={home.niches.cta.href} className="home-niches-cta">
        {home.niches.cta.label}
      </CtaLink>
      <div className="home-niches-grid">
        {home.niches.items.map((item) => (
          <Link key={item.n} href={home.niches.cta.href} className="home-niche-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.alt} />
            <span>
              <small>{item.n}</small> {item.title}
            </span>
          </Link>
        ))}
      </div>
      <Marquee items={[...home.niches.ticker]} className="home-niches-marquee" />
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="home-page">
        <section className="home-hero">
          <h1 className="home-hero-wordmark">
            <Wordmark scale="scale-[0.2607] lg:scale-100" />
          </h1>
          <p className="home-hero-title">{home.hero.title}</p>
          <div className="home-hero-orbit" aria-hidden>
            <span />
            <span />
          </div>
          <HeroCarousel images={home.hero.images} className="home-hero-carousel" />
          <div className="home-hero-copy">
            <p>{home.hero.intro}</p>
            <p>{home.hero.line}</p>
          </div>
          <CtaLink href={home.hero.cta.href} className="home-hero-cta">
            {home.hero.cta.label}
          </CtaLink>
          <div className="home-hero-contact">
            <span aria-hidden>▪</span>
            <p>{home.hero.meta.contactLabel}</p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
          <div className="home-hero-scroll">
            <span aria-hidden>▾</span>
            <p>{home.hero.meta.scrollLabel}</p>
            <a href="#how-it-works">{home.hero.meta.scrollText}</a>
          </div>
          <div className="home-hero-follow">
            <span aria-hidden>▾</span>
            <p>{home.hero.meta.followLabel}</p>
            <div>
              {site.socials.map((social) => (
                <a key={social.short} href={social.href} target="_blank" rel="noreferrer">
                  {social.short}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="home-passion">
          <h2>{home.passion.heading}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="home-passion-image-a" src={home.passion.imageAlt.src} alt={home.passion.imageAlt.alt} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="home-passion-image-b" src={home.passion.image.src} alt={home.passion.image.alt} />
          <div className="home-passion-copy">
            <p className="home-eyebrow">{home.passion.eyebrow}</p>
            <p>{home.passion.body}</p>
            <CtaLink href={home.passion.cta.href}>{home.passion.cta.label}</CtaLink>
          </div>
        </section>

        <section id={home.steps.id} className="home-steps">
          <Link href={home.steps.href} className="home-eyebrow">
            {home.steps.eyebrow}
          </Link>
          <h2>{home.steps.heading}</h2>
          <div className="home-steps-grid">
            {home.steps.items.map((item) => (
              <article key={item.n}>
                <p>{item.n}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-makers">
          <h2>{home.makers.heading}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.makers.image.src} alt={home.makers.image.alt} />
          <div>
            <p className="home-eyebrow">{home.makers.eyebrow}</p>
            <p>{home.makers.body}</p>
            <CtaLink href={home.makers.cta.href}>{home.makers.cta.label}</CtaLink>
          </div>
        </section>

        <section id={home.experiences.id} className="home-experiences">
          <h2>{home.experiences.heading}</h2>
          <p className="home-eyebrow">{home.experiences.eyebrow}</p>
          <p className="home-experiences-copy">{home.experiences.body}</p>
          <CtaLink href={home.experiences.cta.href}>{home.experiences.cta.label}</CtaLink>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.experiences.image.src} alt={home.experiences.image.alt} />
        </section>

        <section className="home-culture">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.culture.image.src} alt={home.culture.image.alt} />
          <h2>{home.culture.heading}</h2>
          <div>
            <p>{home.culture.body}</p>
            <CtaLink href={home.culture.cta.href} light>
              {home.culture.cta.label}
            </CtaLink>
          </div>
        </section>

        <section className="home-founders">
          <h2>{home.founders.heading}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="home-founders-image-a" src={home.founders.image.src} alt={home.founders.image.alt} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="home-founders-image-b" src={home.founders.imageAlt.src} alt={home.founders.imageAlt.alt} />
          <div>
            <p className="home-eyebrow">{home.founders.eyebrow}</p>
            <p>{home.founders.body}</p>
            <CtaLink href={home.founders.cta.href}>{home.founders.cta.label}</CtaLink>
          </div>
        </section>

        <StickyGallery caption={home.gallery.caption} images={home.gallery.images} />

        <NichesSection mobile />

        <section id={home.brands.id} className="home-brands">
          <h2>{home.brands.heading}</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.brands.image.src} alt={home.brands.image.alt} />
          <div>
            <p className="home-eyebrow">{home.brands.eyebrow}</p>
            <p>{home.brands.body}</p>
            <CtaLink href={home.brands.cta.href}>{home.brands.cta.label}</CtaLink>
          </div>
        </section>

        <section className="home-provenance">
          <p className="home-eyebrow">{home.provenance.eyebrow}</p>
          <h2>{home.provenance.heading}</h2>
          <p>{home.provenance.body}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.provenance.image.src} alt={home.provenance.image.alt} />
        </section>

        <NichesSection />

        <section className="home-four-ways">
          <p className="home-eyebrow">{home.fourWays.eyebrow}</p>
          <h2>{home.fourWays.heading}</h2>
          <div>
            {home.fourWays.items.map((item) => (
              <article key={item.n}>
                <p>{item.n}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <ApplyType heading={home.join.heading} href={home.join.href} images={home.join.images} />
      </main>
      <SiteFooter />
    </>
  );
}
