import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CtaLink } from "@/components/cta-link";
import { makersPage } from "@/data/pages";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/makers" },
};

const display = "font-sans font-semibold uppercase lg:tracking-[-2.16px]";

export default function MakersPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1440px] px-6 pb-24 pt-[112px] lg:px-0 lg:pb-32 lg:pl-[184px] lg:pt-[160px]">
        <p className="font-serif text-base font-medium leading-4 text-muted lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
          {makersPage.eyebrow}
        </p>
        <h1 className={`${display} mt-12 w-[342px] text-[32px] leading-8 tracking-[-0.03em] lg:w-[858px] lg:text-[72px] lg:leading-[72px]`}>
          {makersPage.heading}
        </h1>
        <p className="mt-12 text-balance font-sans text-base font-medium uppercase leading-[19.2px] lg:w-[429px] lg:leading-[22.4px]">
          {makersPage.intro}
        </p>
        <CtaLink href={makersPage.cta.href} className="mt-12">
          {makersPage.cta.label}
        </CtaLink>

        <section className="mt-44 lg:mt-[258px]">
          <h2 className={`${display} text-[32px] leading-8 lg:w-[697px] lg:text-[72px] lg:leading-[72px]`}>
            {makersPage.keep.heading}
          </h2>
          <div className="mt-16 grid gap-14 lg:mt-[209px] lg:w-[1072px] lg:grid-cols-3 lg:gap-x-[129px]">
            {makersPage.keep.items.map((item) => (
              <div key={item.n} className="lg:w-[271px]">
                <p className="font-serif text-[22.08px] font-medium leading-[26.496px] tracking-[-0.4416px]">{item.n}</p>
                <h3 className="mt-5 font-sans text-[40px] font-semibold uppercase leading-[48px] tracking-[-1.2px] lg:text-[64px] lg:leading-[76.8px] lg:tracking-[-1.92px]">
                  {item.title}
                </h3>
                <p className="mt-5 font-sans text-base font-medium leading-[22.4px]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28 lg:mt-60">
          <p className="font-serif text-base font-medium text-muted lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
            {makersPage.standard.eyebrow}
          </p>
          <h2 className={`${display} mt-12 text-[32px] leading-8 lg:w-[804px] lg:text-[72px] lg:leading-[72px]`}>
            {makersPage.standard.heading}
          </h2>
          <p className="mt-10 font-sans text-base font-medium uppercase leading-[22.4px] lg:w-[429px]">
            {makersPage.standard.body}
          </p>
        </section>

        <section className="mt-28 lg:mt-60">
          <p className="font-serif text-base font-medium text-muted lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
            {makersPage.mark.eyebrow}
          </p>
          <h2 className={`${display} mt-12 text-[32px] leading-8 lg:w-[697px] lg:text-[72px] lg:leading-[72px]`}>
            {makersPage.mark.heading}
          </h2>
          <p className="mt-10 font-sans text-base font-medium uppercase leading-[22.4px] lg:w-[429px]">
            {makersPage.mark.body}
          </p>
        </section>

        <section className="mt-28 lg:mt-60">
          <h2 className={`${display} text-[32px] leading-8 lg:w-[697px] lg:text-[72px] lg:leading-[72px]`}>
            {makersPage.earn.heading}
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:mt-[209px] lg:w-[1072px] lg:grid-cols-4 lg:gap-x-[81px]">
            {makersPage.earn.items.map((item) => (
              <div key={item.n} className="lg:w-[207px]">
                <p className="font-serif text-[22.08px] font-medium leading-[26.496px] tracking-[-0.4416px]">{item.n}</p>
                <h3 className="mt-5 font-sans text-[40px] font-semibold uppercase leading-10 tracking-[-1.2px]">
                  {item.title}
                </h3>
                <p className="mt-5 font-sans text-base font-medium leading-[22.4px]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-28 lg:mt-60">
          <h2 className={`${display} text-[32px] leading-8 lg:w-[697px] lg:text-[72px] lg:leading-[72px]`}>
            {makersPage.close.heading}
          </h2>
          <p className="mt-10 font-sans text-base font-medium uppercase leading-[22.4px] lg:w-[429px]">
            {makersPage.close.body}
          </p>
          <CtaLink href={makersPage.close.cta.href} className="mt-12">
            {makersPage.close.cta.label}
          </CtaLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
