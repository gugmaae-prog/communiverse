import type { Metadata } from "next";
import { PillLink } from "@/components/pill-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { howItWorks } from "@/data/pages";

export const metadata: Metadata = {
  title: { absolute: howItWorks.metaTitle },
  description: howItWorks.metaDescription,
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <div className="bg-[#121814] text-[#f5f4f1]">
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
        <p className="font-serif text-sm italic text-[#a39e94]">{howItWorks.eyebrow}</p>
        <p className="mt-8 text-xs uppercase tracking-[0.18em] text-[#f5f4f1]/55">01 / The structure</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">
          {howItWorks.heading}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{howItWorks.intro}</p>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#f5f4f1]/60">Find · Build · Earn</p>
        <div className="mt-8">
          <PillLink href={howItWorks.cta.href}>{howItWorks.cta.label}</PillLink>
        </div>

        <section className="mt-24">
          <p className="font-serif text-sm italic text-[#a39e94]">(How it works)</p>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#f5f4f1]/55">02 / Three steps</p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            {howItWorks.stepsHeading}
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {howItWorks.steps.map((step) => (
              <div key={step.n}>
                <p className="font-serif text-sm italic text-[#a39e94]">{step.n}</p>
                <h3 className="mt-3 text-3xl font-medium uppercase tracking-[-0.04em]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#f5f4f1]/75">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">{howItWorks.closeHeading}</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{howItWorks.close}</p>
          <div className="mt-8">
            <PillLink href={howItWorks.cta.href}>{howItWorks.cta.label}</PillLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
