import type { Metadata } from "next";
import { CtaLink } from "@/components/cta-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export type AudienceContent = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  heading: string;
  intro: string;
  pointsHeading?: string;
  points?: readonly { n: string; title: string; body: string }[];
  close?: string;
  cta: { label: string; href: string };
};

const display = "font-sans font-semibold uppercase tracking-[-0.03em] lg:tracking-[-2.16px]";

export function audienceMetadata(page: AudienceContent, canonical: string): Metadata {
  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export function AudiencePage({ page }: { page: AudienceContent }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-6 pb-24 pt-[112px] lg:px-0 lg:pb-32 lg:pl-[184px] lg:pt-[160px]">
        <p className="font-serif text-base font-medium leading-4 text-muted lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
          {page.eyebrow}
        </p>
        <h1
          className={`${display} mt-6 max-w-[342px] text-[40px] leading-[44px] lg:max-w-[804px] lg:text-[72px] lg:leading-[76px]`}
        >
          {page.heading}
        </h1>
        <p className="mt-8 max-w-[429px] font-sans text-base font-medium leading-[22.4px]">{page.intro}</p>

        {page.points && page.points.length > 0 ? (
          <section className="mt-24 lg:mt-40">
            {page.pointsHeading ? (
              <h2 className={`${display} max-w-[697px] text-[32px] leading-8 lg:text-[56px] lg:leading-[60px]`}>
                {page.pointsHeading}
              </h2>
            ) : null}
            <div className="mt-12 grid gap-12 lg:mt-20 lg:w-[1072px] lg:grid-cols-3 lg:gap-x-[80px]">
              {page.points.map((item) => (
                <article key={item.n} className="lg:max-w-[280px]">
                  <p className="font-serif text-[22.08px] font-medium leading-[26.496px] tracking-[-0.4416px]">{item.n}</p>
                  <h3 className="mt-4 font-sans text-[32px] font-semibold uppercase leading-9 tracking-[-0.03em] lg:text-[40px] lg:leading-[48px]">
                    {item.title}
                  </h3>
                  <p className="mt-4 font-sans text-base font-medium leading-[22.4px]">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {page.close ? (
          <p className="mt-20 max-w-[429px] font-sans text-base font-medium leading-[22.4px] lg:mt-28">{page.close}</p>
        ) : null}
        <CtaLink href={page.cta.href} className="mt-12">
          {page.cta.label}
        </CtaLink>
      </main>
      <SiteFooter />
    </>
  );
}
