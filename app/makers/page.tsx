import type { Metadata } from "next";
import { PillLink } from "@/components/pill-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { makersPage } from "@/data/pages";
import { media } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: "For Makers | Communiverse" },
  description: makersPage.intro,
  alternates: { canonical: "/makers" },
};

export default function MakersPage() {
  return (
    <div className="bg-[#121814] text-[#f5f4f1]">
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
        <h1 className="max-w-4xl font-serif text-4xl font-medium leading-[0.95] tracking-tight md:text-6xl">
          You made the work. You should own what it becomes.
        </h1>
        <p className="mt-6 max-w-md text-lg text-[#f5f4f1]/80">{makersPage.intro.split(".")[0]}.</p>
        <div className="mt-8">
          <PillLink href={makersPage.cta.href}>{makersPage.cta.label}</PillLink>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.provenance}
          alt="A maker engraving a design by hand"
          className="mt-12 h-[480px] w-full object-cover"
        />
        <p className="mt-8 max-w-xl text-base leading-7 text-[#f5f4f1]/80">
          One maker per craft, signed and verified, selling and teaching on their own terms. We are opening in waves. This is how you get in early.
        </p>

        <section className="mt-24">
          <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">What you keep</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {makersPage.keep.items.map((item) => (
              <div key={item.title}>
                <h3 className="text-2xl font-medium">{item.title.charAt(0) + item.title.slice(1).toLowerCase()}</h3>
                <p className="mt-3 text-sm leading-6 text-[#f5f4f1]/75">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 max-w-3xl">
          <p className="font-serif text-sm italic text-[#a39e94]">{makersPage.standard.eyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl font-medium leading-tight tracking-tight md:text-5xl">
            We do not list anyone we have not met.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#f5f4f1]/80">{makersPage.standard.body}</p>
        </section>

        <section className="mt-24 max-w-3xl">
          <p className="font-serif text-sm italic text-[#a39e94]">{makersPage.mark.eyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight md:text-5xl">The maker’s mark</h2>
          <p className="mt-5 text-base leading-7 text-[#f5f4f1]/80">{makersPage.mark.body}</p>
        </section>

        <section className="mt-24">
          <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Four ways to earn</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {makersPage.earn.items.map((item) => (
              <div key={item.title}>
                <h3 className="text-2xl font-medium">{item.title.charAt(0) + item.title.slice(1).toLowerCase()}</h3>
                <p className="mt-3 text-sm leading-6 text-[#f5f4f1]/75">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <h2 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">We are signing makers now.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#f5f4f1]/80">{makersPage.close.body}</p>
          <div className="mt-8">
            <PillLink href={makersPage.close.cta.href}>{makersPage.close.cta.label}</PillLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
