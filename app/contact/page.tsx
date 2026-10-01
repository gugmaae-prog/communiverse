import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { contactPage } from "@/data/pages";
import { media, site } from "@/data/site";

export const metadata: Metadata = {
  title: { absolute: "Join the waitlist | Communiverse" },
  description: contactPage.intro,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-[#121814] text-[#f5f4f1]">
      <SiteHeader />
      <main id="contact" className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-24 pt-28 md:grid-cols-2 md:px-10 md:pt-36">
        <section>
          <p className="font-serif text-sm italic text-[#a39e94]">(Your way in)</p>
          <h1 className="mt-6 font-serif text-5xl font-medium tracking-tight md:text-6xl">{contactPage.heading}</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#f5f4f1]/80">{contactPage.intro}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.contact}
            alt="Two hands reaching toward each other against a cloudy sky"
            className="mt-10 h-72 w-full object-cover"
          />
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[#f5f4f1]/70">Learn. Make. Collect. Belong.</p>
        </section>
        <section className="bg-[#1a211c] p-6 md:p-10">
          <p className="font-serif text-sm italic text-[#a39e94]">(Join the waitlist)</p>
          <div className="mt-8">
            <WaitlistForm />
          </div>
          <a href={`mailto:${site.email}`} className="mt-8 inline-block text-sm text-[#f5f4f1]/70 hover:text-white">
            {site.email}
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
