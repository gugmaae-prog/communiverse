import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { contactPage } from "@/data/pages";
import { media, site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: "Contact | Communiverse" },
  description: contactPage.intro,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Communiverse",
    description: contactPage.intro,
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="relative mx-auto min-h-[1200px] w-full max-w-[1440px] lg:min-h-[960px]">
        <div className="absolute left-0 top-0 h-[480px] w-full bg-black lg:left-16 lg:top-[90px] lg:h-[810px] lg:w-[624px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media.contactMark} alt="" className="absolute inset-0 h-full w-full object-fill opacity-40 blur-[1px]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.contact}
            alt="Woman portrait photography"
            className="absolute left-[98px] top-[120px] h-[241px] w-[195px] object-fill lg:left-[138px] lg:top-[182px] lg:h-[448px] lg:w-[344px]"
          />
          <h1 className="absolute left-6 top-[392px] w-[342px] text-center font-sans text-2xl font-semibold uppercase leading-none tracking-[-0.03em] text-white lg:left-[240px] lg:top-[592px] lg:w-[320px] lg:text-right lg:text-[64px] lg:leading-[76.8px] lg:tracking-[-1.92px]">
            {contactPage.heading}
          </h1>
        </div>

        <p className="absolute left-6 top-[560px] w-[342px] text-center font-serif text-base font-medium leading-4 tracking-[-0.02em] lg:left-[752px] lg:top-[210px] lg:w-[624px] lg:text-left lg:text-[22.08px] lg:leading-[26.496px] lg:tracking-[-0.4416px]">
          {contactPage.intro}
        </p>

        <section className="absolute left-6 top-[656px] z-10 min-h-[420px] w-[342px] bg-white p-6 lg:left-[752px] lg:top-[287px] lg:min-h-[520px] lg:w-[624px]">
          <WaitlistForm />
        </section>

        <div className="absolute left-6 top-[1064px] lg:left-[752px] lg:top-[806px]">
          <p className="font-serif text-base font-medium leading-5 text-muted lg:text-xl lg:leading-7">(Contact)</p>
          <a href={`mailto:${site.email}`} className="mt-2 inline-block font-sans text-sm font-medium leading-5 hover:opacity-60 lg:text-base lg:leading-[22px]">
            {contactPage.emailDisplay}
          </a>
        </div>
        <div className="absolute right-6 top-[1064px] text-right lg:right-16 lg:top-[806px]">
          <p className="font-serif text-base font-medium leading-5 text-muted lg:text-xl lg:leading-7">(Follow)</p>
          <div className="mt-2 flex justify-end gap-8">
            {site.socials.map((social) => (
              <a key={social.short} href={social.href} target="_blank" rel="noreferrer" className="font-sans text-sm font-medium leading-5 hover:opacity-60 lg:text-base lg:leading-[22px]">
                {social.short}
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
