import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { contactPage } from "@/data/pages";
import { media, site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="relative mx-auto min-h-screen w-full max-w-[1440px] pt-[620px] lg:h-[900px] lg:min-h-0 lg:pt-0">
        <div className="absolute left-0 top-0 h-[480px] w-full bg-black lg:left-16 lg:top-[90px] lg:h-[810px] lg:w-[624px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.contactMark} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-40 blur-[1px]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.contact}
            alt="Woman portrait photography"
            className="absolute left-[98px] top-[124px] h-[240px] w-[195px] object-cover lg:left-[139px] lg:top-[208px] lg:h-[446px] lg:w-[343px]"
          />
          <h1 className="absolute left-10 top-[392px] w-[310px] font-sans text-2xl font-semibold uppercase leading-none tracking-[-0.03em] text-white lg:left-16 lg:top-[592px] lg:w-[496px] lg:text-[64px] lg:leading-[76.8px] lg:tracking-[-1.92px]">
            {contactPage.heading}
          </h1>
        </div>

        <p className="absolute left-6 top-[560px] w-[342px] font-serif text-base font-medium leading-6 tracking-[-0.02em] lg:left-[752px] lg:top-[210px] lg:w-[624px] lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
          {contactPage.intro}
        </p>

        <section className="relative z-10 mx-6 bg-white px-6 py-6 lg:absolute lg:left-[752px] lg:top-[287px] lg:mx-0 lg:h-[495px] lg:w-[624px] lg:px-6 lg:py-6">
          <WaitlistForm />
        </section>

        <div className="absolute left-6 top-[1180px] lg:left-[752px] lg:top-[806px]">
          <p className="font-serif text-xl font-medium leading-7 text-muted">(Contact)</p>
          <a href={`mailto:${site.email}`} className="mt-2 inline-block font-sans text-base font-medium leading-[22px] hover:opacity-60">
            {contactPage.emailDisplay}
          </a>
        </div>
        <div className="absolute right-6 top-[1180px] text-right lg:right-16 lg:top-[806px]">
          <p className="font-serif text-xl font-medium leading-7 text-muted">(Follow)</p>
          <div className="mt-2 flex justify-end gap-8">
            {site.socials.map((social) => (
              <a key={social.short} href={social.href} target="_blank" rel="noreferrer" className="font-sans text-base font-medium leading-[22px] hover:opacity-60">
                {social.short}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
