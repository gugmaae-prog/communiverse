import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CtaLink } from "@/components/cta-link";
import { Reveal } from "@/components/reveal";
import { ImageMarquee, Marquee } from "@/components/marquee";
import { StickyGallery } from "@/components/sticky-gallery";
import { ApplyType } from "@/components/apply-type";
import { Wordmark } from "@/components/wordmark";
import { home } from "@/data/home";
import { site } from "@/data/site";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative mx-auto h-[1180px] w-full max-w-[1440px] lg:h-[900px]">
          <h1 className="absolute left-6 top-[72px] h-[37.5px] w-[342px] overflow-hidden lg:left-16 lg:top-[106px] lg:h-[144px] lg:w-[1312px]">
            <Wordmark scale="scale-[0.2615] lg:scale-100" />
          </h1>
          <p className="absolute left-6 top-[118px] w-[342px] text-center font-serif text-[20px] font-medium leading-[22px] tracking-[-0.04em] lg:left-16 lg:top-[258px] lg:w-[1312px] lg:text-[40px] lg:leading-[48px] lg:tracking-[-1.6px]">
            {home.hero.title}
          </p>
          <span className="absolute left-1/2 top-[316px] hidden h-8 w-8 -translate-x-1/2 rounded-full bg-black lg:block" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={home.hero.imageMobile.src}
            alt={home.hero.imageMobile.alt}
            className="absolute left-[58px] top-[224px] z-10 h-[422px] w-[274px] object-cover lg:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={home.hero.image.src}
            alt={home.hero.image.alt}
            className="absolute left-[936px] top-[293px] z-10 hidden h-[450px] w-[288px] object-cover lg:block"
          />
          <div className="absolute left-6 top-[686px] w-[342px] lg:left-[216px] lg:top-[461px] lg:w-[454px]">
            <p className="font-serif text-base font-medium leading-4 tracking-[-0.02em] lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
              {home.hero.intro}
            </p>
            <p className="mt-5 font-serif text-base font-medium leading-4 tracking-[-0.02em] lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
              {home.hero.line}
            </p>
          </div>
          <CtaLink href={home.hero.cta.href} className="absolute left-6 top-[825px] lg:left-[216px] lg:top-[653px]">
            {home.hero.cta.label}
          </CtaLink>
          <div className="absolute left-6 top-[920px] lg:left-16 lg:top-[802px]">
            <p className="font-serif text-xl font-medium leading-7 text-muted">{home.hero.meta.contactLabel}</p>
            <a href={`mailto:${site.email}`} className="mt-2 inline-block font-sans text-base font-medium uppercase leading-[22px] hover:opacity-60">
              {site.email}
            </a>
          </div>
          <div className="absolute left-6 top-[1020px] text-left lg:left-1/2 lg:top-[806px] lg:-translate-x-1/2 lg:text-center">
            <p className="font-serif text-xl font-medium leading-7 text-muted">{home.hero.meta.scrollLabel}</p>
            <a href="#how-it-works" className="mt-1 inline-block font-sans text-base font-medium uppercase leading-[22px] hover:opacity-60 lg:mt-1">
              {home.hero.meta.scrollText}
            </a>
          </div>
          <div className="absolute right-6 top-[920px] text-right lg:right-16 lg:top-[802px]">
            <p className="font-serif text-xl font-medium leading-7 text-muted">{home.hero.meta.followLabel}</p>
            <div className="mt-2 flex justify-end gap-8">
              {site.socials.map((social) => (
                <a key={social.short} href={social.href} target="_blank" rel="noreferrer" className="font-sans text-base font-medium leading-[22px] hover:opacity-60">
                  {social.short}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:px-16">
          <Reveal>
            <h2 className="max-w-[12ch] font-sans text-[clamp(2.6rem,5vw,4.5rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
              {home.passion.heading}
            </h2>
          </Reveal>
          <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={home.passion.image.src} alt={home.passion.image.alt} className="aspect-[3/4] w-full object-cover" />
            <Reveal>
              <p className="font-serif text-[22px] font-medium text-muted">{home.passion.eyebrow}</p>
              <p className="mt-6 max-w-xl font-serif text-[22px] font-medium leading-[1.25] tracking-[-0.02em]">
                {home.passion.body}
              </p>
              <CtaLink href={home.passion.cta.href} className="mt-8">
                {home.passion.cta.label}
              </CtaLink>
            </Reveal>
          </div>
        </section>

        <section id={home.steps.id} className="scroll-mt-24 px-6 py-24 md:px-16">
          <Link href={home.steps.href} className="font-serif text-[22px] font-medium text-muted hover:text-black">
            {home.steps.eyebrow}
          </Link>
          <h2 className="mt-4 max-w-[16ch] font-sans text-[clamp(2.6rem,5vw,4.5rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
            {home.steps.heading}
          </h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {home.steps.items.map((item) => (
              <Reveal key={item.n}>
                <p className="font-sans text-sm font-medium">{item.n}</p>
                <h3 className="mt-3 font-sans text-[clamp(2.4rem,4vw,4rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-sm font-serif text-lg leading-snug">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="grid items-center gap-12 px-6 py-24 md:px-16 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-sans text-[clamp(2.4rem,4vw,4rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
              {home.makers.heading}
            </h2>
            <p className="mt-8 font-serif text-[22px] font-medium text-muted">{home.makers.eyebrow}</p>
            <p className="mt-4 max-w-xl font-serif text-[22px] font-medium leading-[1.25] tracking-[-0.02em]">
              {home.makers.body}
            </p>
            <CtaLink href={home.makers.cta.href} className="mt-8">
              {home.makers.cta.label}
            </CtaLink>
          </Reveal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.makers.image.src} alt={home.makers.image.alt} className="aspect-[3/4] w-full object-cover" />
        </section>

        <section id={home.experiences.id} className="grid items-center gap-12 px-6 py-24 md:px-16 lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.experiences.image.src} alt={home.experiences.image.alt} className="aspect-[4/5] w-full object-cover lg:order-2" />
          <Reveal>
            <h2 className="font-sans text-[clamp(2.4rem,4vw,4rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
              {home.experiences.heading}
            </h2>
            <p className="mt-8 font-serif text-[22px] font-medium text-muted">{home.experiences.eyebrow}</p>
            <p className="mt-4 max-w-xl font-serif text-[22px] font-medium leading-[1.25] tracking-[-0.02em]">
              {home.experiences.body}
            </p>
            <CtaLink href={home.experiences.cta.href} className="mt-8">
              {home.experiences.cta.label}
            </CtaLink>
          </Reveal>
        </section>

        <section className="bg-black text-white">
          <div className="grid items-end gap-10 px-6 py-24 md:px-16 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <h2 className="font-sans text-[clamp(2.4rem,4.2vw,4rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
                {home.culture.heading}
              </h2>
              <p className="mt-8 max-w-xl font-sans text-sm font-medium uppercase leading-relaxed tracking-[0.08em]">
                {home.culture.body}
              </p>
              <CtaLink href={home.culture.cta.href} light className="mt-8">
                {home.culture.cta.label}
              </CtaLink>
            </Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={home.culture.image.src} alt={home.culture.image.alt} className="aspect-square w-full object-cover" />
          </div>
        </section>

        <section className="px-6 py-24 md:px-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={home.founders.image.src} alt={home.founders.image.alt} className="aspect-[3/4] w-full object-cover" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={home.founders.imageAlt.src} alt={home.founders.imageAlt.alt} className="mt-10 aspect-[3/4] w-full object-cover" />
            </div>
            <Reveal>
              <h2 className="font-sans text-[clamp(2.4rem,4vw,4.5rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
                {home.founders.heading}
              </h2>
              <p className="mt-8 font-serif text-[22px] font-medium text-muted">{home.founders.eyebrow}</p>
              <p className="mt-4 max-w-xl font-serif text-[22px] font-medium leading-[1.25] tracking-[-0.02em]">
                {home.founders.body}
              </p>
              <CtaLink href={home.founders.cta.href} className="mt-8">
                {home.founders.cta.label}
              </CtaLink>
            </Reveal>
          </div>
        </section>

        <StickyGallery caption={home.gallery.caption} images={home.gallery.images} />

        <section id={home.brands.id} className="scroll-mt-24 px-6 py-24 md:px-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <h2 className="font-sans text-[clamp(2.4rem,4vw,4rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
                {home.brands.heading}
              </h2>
              <p className="mt-8 font-serif text-[22px] font-medium text-muted">{home.brands.eyebrow}</p>
              <p className="mt-4 max-w-xl font-serif text-[22px] font-medium leading-[1.25] tracking-[-0.02em]">
                {home.brands.body}
              </p>
              <CtaLink href={home.brands.cta.href} className="mt-8">
                {home.brands.cta.label}
              </CtaLink>
            </Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={home.brands.image.src} alt={home.brands.image.alt} className="aspect-[4/3] w-full object-cover" />
          </div>
        </section>

        <section className="grid items-center gap-12 px-6 py-12 md:px-16 lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.provenance.image.src} alt={home.provenance.image.alt} className="aspect-[3/4] w-full object-cover" />
          <Reveal>
            <p className="font-serif text-[22px] font-medium text-muted">{home.provenance.eyebrow}</p>
            <h2 className="mt-4 font-sans text-[clamp(2.4rem,4vw,4rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
              {home.provenance.heading}
            </h2>
            <p className="mt-6 max-w-xl font-serif text-[22px] font-medium leading-[1.25] tracking-[-0.02em]">
              {home.provenance.body}
            </p>
          </Reveal>
        </section>

        <section className="px-6 py-24 md:px-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <p className="font-serif text-[22px] font-medium text-muted">{home.niches.eyebrow}</p>
            <CtaLink href={home.niches.cta.href}>{home.niches.cta.label}</CtaLink>
          </div>
          <div className="mt-10 flex gap-4 overflow-x-auto pb-4">
            {home.niches.items.map((item) => (
              <Link key={item.n} href="/" className="group relative w-[70vw] shrink-0 md:w-[22vw]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.alt}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                  <p className="font-sans text-xs tracking-[0.16em]">{item.n}</p>
                  <p className="mt-1 font-sans text-lg font-medium">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
          <Marquee items={[...home.niches.ticker]} className="mt-8" />
        </section>

        <section className="px-6 py-24 md:px-16">
          <p className="font-serif text-[22px] font-medium text-muted">{home.fourWays.eyebrow}</p>
          <h2 className="mt-4 font-sans text-[clamp(2.6rem,5vw,4.5rem)] font-semibold uppercase leading-none tracking-[-0.03em]">
            {home.fourWays.heading}
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {home.fourWays.items.map((item) => (
              <Reveal key={item.n}>
                <p className="font-sans text-sm">{item.n}</p>
                <h3 className="mt-2 font-sans text-[2.5rem] font-semibold uppercase leading-none tracking-[-0.03em]">
                  {item.title}
                </h3>
                <p className="mt-4 font-serif text-lg leading-snug">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="bg-black py-20 text-white">
          <div className="px-6 md:px-16">
            <ApplyType className="text-[clamp(3rem,8vw,6.5rem)] text-white" />
            <Link
              href={home.join.href}
              className="mt-6 inline-flex items-center gap-3 font-sans text-[clamp(2.2rem,4vw,4.25rem)] font-semibold uppercase leading-none tracking-[-0.03em] hover:text-sage"
            >
              <span className="inline-block h-8 w-8 rounded-full border-2 border-white" aria-hidden />
              {home.join.heading}
            </Link>
          </div>
          <div className="mt-10">
            <ImageMarquee images={home.join.images} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
