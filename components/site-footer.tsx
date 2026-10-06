"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "@/data/site";

export function SiteFooter() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <footer className="relative h-[796px] bg-black text-white lg:h-[780px]">
      <p className="absolute left-6 top-0 font-serif text-[14px] font-medium leading-[17px] text-sage lg:left-16 lg:text-[20px] lg:leading-7">
        (Launch)
      </p>
      <p className="absolute left-[39px] top-[18px] font-sans text-[38px] font-semibold uppercase leading-[49.4px] tracking-[-0.76px] lg:left-16 lg:top-[37px]">
        {site.launch}
      </p>

      <p className="absolute left-6 top-[109px] font-serif text-[14px] font-medium leading-[17px] text-sage lg:left-[917px] lg:top-0 lg:w-[459px] lg:text-right lg:text-[20px] lg:leading-7">
        (Follow)
      </p>
      <ul className="absolute left-0 right-0 top-[143px] space-y-2.5 text-center font-sans text-[20px] font-medium uppercase leading-7 lg:left-auto lg:right-16 lg:top-[37px] lg:w-max lg:space-y-0.5 lg:text-right">
        {site.socials.map((social) => (
          <li key={social.label}>
            <a href={social.href} target="_blank" rel="noreferrer" className="hover:text-sage">
              {social.label}
            </a>
          </li>
        ))}
      </ul>

      <nav
        aria-label="Explore Communiverse"
        className="absolute inset-x-6 top-[530px] flex flex-wrap justify-center gap-x-5 gap-y-2 text-center font-sans text-[13px] font-medium uppercase leading-5 lg:inset-x-16 lg:top-[500px] lg:text-base"
      >
        {site.explore.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-sage">
            {item.label}
          </Link>
        ))}
      </nav>
      <h2 className="absolute inset-x-0 top-[411px] text-center font-sans text-base font-semibold uppercase leading-[19px] tracking-[-0.02em] text-sage lg:top-[325px] lg:text-[28px] lg:leading-[39.2px] lg:tracking-[-0.56px]">
        {site.footerNote}
      </h2>
      <button
        type="button"
        onClick={copyEmail}
        className="absolute inset-x-0 top-[446px] text-center font-sans text-2xl font-semibold leading-[29px] tracking-[-0.03em] lg:top-[365px] lg:text-[64px] lg:leading-[89.6px] lg:tracking-[-1.92px]"
      >
        {copied ? "Copied!" : site.email}
      </button>

      <div className="absolute left-1/2 top-[638px] w-max -translate-x-1/2 text-center lg:top-[654px]">
        <p className="font-serif text-[14px] font-medium leading-[17px] text-sage lg:text-[20px] lg:leading-7">(Copyright)</p>
        <p className="mt-1 font-sans text-[13px] font-medium leading-[18px] lg:mt-2 lg:text-base lg:leading-[22.4px]">
          {site.copyright}
        </p>
      </div>
      <div className="absolute left-6 top-[701px] lg:left-16 lg:top-[654px]">
        <p className="font-serif text-[14px] font-medium leading-[17px] text-sage lg:text-[20px] lg:leading-7">(Drive)</p>
        <a
          href={site.founder.href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block font-sans text-[13px] font-medium leading-[18px] hover:text-sage lg:mt-2 lg:text-base lg:leading-[22.4px]"
        >
          {site.founder.label}
        </a>
      </div>
      <div className="absolute right-6 top-[701px] text-right lg:right-16 lg:top-[654px]">
        <p className="font-serif text-[14px] font-medium leading-[17px] text-sage lg:text-[20px] lg:leading-7">(Powered By)</p>
        <a
          href={site.poweredBy.href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block font-sans text-[13px] font-medium leading-[18px] hover:text-sage lg:mt-2 lg:text-base lg:leading-[22.4px]"
        >
          {site.poweredBy.label}
        </a>
      </div>
    </footer>
  );
}
