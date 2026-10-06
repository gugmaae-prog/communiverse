import { PillLink } from "@/components/pill-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoryRail } from "@/components/story-rail";
import { home } from "@/data/home";

function SectionIntro({
  eyebrow,
  heading,
  body,
  href,
  cta,
  note,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  href?: string;
  cta?: string;
  note?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-serif text-sm italic text-[#a39e94]">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">{heading}</h2>
      <p className="mt-6 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{body}</p>
      {note ? <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#f5f4f1]/60">{note}</p> : null}
      {href && cta ? (
        <div className="mt-8">
          <PillLink href={href}>{cta}</PillLink>
        </div>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-[#121814] text-[#f5f4f1]">
      <SiteHeader />
      <main>
        <section className="px-5 pb-10 pt-28 md:px-10 md:pt-36">
          <p className="font-serif text-lg italic text-[#f5f4f1]/80 md:text-2xl">{home.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-5xl font-medium leading-[0.95] tracking-[-0.03em] text-[#f5f4f1] md:text-7xl">
            {home.hero.title}
          </h1>
          <p className="mt-5 max-w-md text-base text-[#f5f4f1]/75 md:text-lg">{home.hero.intro}</p>
        </section>

        <StoryRail />

        <section className="mx-auto grid max-w-[1120px] gap-10 px-5 py-24 md:grid-cols-[1.1fr_0.9fr] md:px-10">
          <div className="max-w-3xl">
            <p className="font-serif text-sm italic text-[#a39e94]">{home.passion.eyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">{home.passion.heading}</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{home.passion.body}</p>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#f5f4f1]/80">
              Communiverse is where people who share an interest gather: makers and the people who collect what they make, including crafts, art, and collectibles such as cards, records, and other novelty objects. Clubs connect people of the same interest.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.passion.image.src} alt={home.passion.image.alt} className="h-[420px] w-full object-cover" />
        </section>

        <section id="how-it-works" className="mx-auto max-w-[1120px] px-5 py-20 md:px-10">
          <SectionIntro
            eyebrow="How it works"
            heading={home.steps.heading}
            body={home.steps.lede}
            href={home.steps.cta.href}
            cta={home.steps.cta.label}
          />
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {home.steps.items.map((item) => (
              <div key={item.n}>
                <p className="font-serif text-sm italic text-[#a39e94]">{item.n}</p>
                <h3 className="mt-3 font-sans text-3xl font-medium uppercase tracking-[-0.04em]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#f5f4f1]/75">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.makers.image.src} alt={home.makers.image.alt} className="h-[460px] w-full object-cover" />
          <SectionIntro
            eyebrow={home.makers.eyebrow}
            heading={home.makers.heading}
            body={home.makers.body}
            href={home.makers.cta.href}
            cta={home.makers.cta.label}
            note="One maker per craft. Signed and verified."
          />
        </section>

        <section id="experiences" className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-10">
          <SectionIntro
            eyebrow={home.experiences.eyebrow}
            heading={home.experiences.heading}
            body={home.experiences.body}
            href={home.experiences.cta.href}
            cta={home.experiences.cta.label}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.experiences.image.src} alt={home.experiences.image.alt} className="h-[460px] w-full object-cover" />
        </section>

        <section className="bg-[#0f1612] px-5 py-24 md:px-10">
          <div className="mx-auto max-w-[1120px]">
            <h2 className="max-w-3xl font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">
              {home.culture.heading}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{home.culture.body}</p>
            <div className="mt-8">
              <PillLink href={home.culture.cta.href}>{home.culture.cta.label}</PillLink>
            </div>
          </div>
        </section>

        <section id="for-brands" className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-24 md:grid-cols-2 md:px-10">
          <SectionIntro
            eyebrow={home.brands.eyebrow}
            heading={home.brands.heading}
            body={home.brands.body}
            href={home.brands.cta.href}
            cta={home.brands.cta.label}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.brands.image.src} alt={home.brands.image.alt} className="h-[420px] w-full object-cover" />
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-16 md:px-10">
          <p className="font-serif text-sm italic text-[#a39e94]">{home.provenance.eyebrow}</p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">
            {home.provenance.heading}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{home.provenance.body}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#f5f4f1]/60">The origin, the creator, the journey.</p>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-16 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">A place for the specific.</h2>
            <PillLink href={home.niches.cta.href}>{home.niches.cta.label}</PillLink>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {home.niches.items.map((item, index) => (
              <article key={item.n} className="relative h-64 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.alt} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <h3 className="text-lg font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{home.niches.blurbs[index]}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] px-5 py-20 md:px-10">
          <h2 className="font-serif text-4xl font-medium tracking-tight md:text-6xl">{home.fourWays.heading}</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {home.fourWays.items.map((item) => (
              <div key={item.n}>
                <p className="font-serif text-sm italic text-[#a39e94]">{item.n}</p>
                <h3 className="mt-2 text-2xl font-medium">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#f5f4f1]/75">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-5 py-24 text-center md:px-10">
          <p className="font-serif text-lg italic text-[#a39e94]">Communiverse opens in waves.</p>
          <h2 className="mt-4 font-serif text-5xl font-medium tracking-tight md:text-7xl">Find your people.</h2>
          <div className="mt-8">
            <PillLink href={home.join.href}>Join the waitlist</PillLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
