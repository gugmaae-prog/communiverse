import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CtaLink } from "@/components/cta-link";
import { howItWorks } from "@/data/pages";

export const metadata: Metadata = {
  title: { absolute: howItWorks.metaTitle },
  description: howItWorks.metaDescription,
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: howItWorks.metaTitle,
    description: howItWorks.metaDescription,
  },
};

const display =
  "font-sans font-semibold uppercase tracking-[-0.03em] lg:tracking-[-2.16px]";

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-6 pb-24 pt-[112px] lg:px-0 lg:pb-32 lg:pl-[184px] lg:pt-[160px]">
        <p className="font-serif text-base font-medium leading-4 text-muted lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
          {howItWorks.eyebrow}
        </p>
        <h1 className="mt-6 w-[342px] font-sans text-[80px] font-semibold uppercase leading-[80px] tracking-[-4.8px] lg:mt-6 lg:w-[804px] lg:text-[160px] lg:leading-[160px] lg:tracking-[-9.6px]">
          {howItWorks.heading}
        </h1>
        <p className="mt-6 text-balance font-sans text-base font-medium uppercase leading-[19.2px] lg:w-[429px] lg:leading-[22.4px]">
          {howItWorks.intro}
        </p>

        <section className="mt-40 lg:mt-[244px]">
          <h2 className={`${display} w-full text-[32px] leading-[32px] lg:w-[697px] lg:text-[72px] lg:leading-[72px]`}>
            {howItWorks.stepsHeading}
          </h2>
          <div className="mt-16 grid gap-14 lg:mt-[209px] lg:w-[1072px] lg:grid-cols-3 lg:gap-x-[137px]">
            {howItWorks.steps.map((step) => (
              <div key={step.n} className="lg:w-[266px]">
                <p className="font-serif text-[22.08px] font-medium leading-[26.496px] tracking-[-0.4416px]">{step.n}</p>
                <h3 className="mt-5 font-sans text-[64px] font-semibold uppercase leading-[76.8px] tracking-[-1.92px]">
                  {step.title}
                </h3>
                <p className="mt-5 font-sans text-base font-medium leading-[22.4px]">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28 lg:mt-[284px]">
          <h2 className={`${display} text-[32px] leading-none lg:w-[697px] lg:text-[72px] lg:leading-[72px]`}>
            {howItWorks.closeHeading}
          </h2>
          <p className="mt-8 font-sans text-base font-medium uppercase leading-[22.4px] lg:mt-10 lg:w-[429px]">
            {howItWorks.close}
          </p>
          <CtaLink href={howItWorks.cta.href} className="mt-12">
            {howItWorks.cta.label}
          </CtaLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
