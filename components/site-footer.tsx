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
    <footer className="border-t border-white/10 bg-[#0f1612] px-6 py-16 text-[#f5f4f1] md:px-10">
      <div className="mx-auto max-w-[1120px]">
        <a
          href={site.founder.href}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium uppercase tracking-[0.18em] text-[#f5f4f1]/70 hover:text-white"
        >
          Jennifer Kate Matthews on X
        </a>
        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium uppercase tracking-[0.16em]" aria-label="Footer">
          {site.footerNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-white/70">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-16 font-serif text-lg italic text-[#b3bcb6] md:text-2xl">{site.footerNote}</p>
        <button
          type="button"
          onClick={copyEmail}
          className="mt-3 text-left font-sans text-3xl font-medium tracking-[-0.04em] hover:text-white/80 md:text-5xl"
        >
          {copied ? "Copied!" : site.email}
        </button>
        <div className="mt-16 grid gap-8 border-t border-white/10 pt-8 text-xs uppercase tracking-[0.14em] text-[#f5f4f1]/70 md:grid-cols-3">
          <a href={site.founder.href} target="_blank" rel="noreferrer" className="hover:text-white">
            Find your people
          </a>
          <p>{site.copyright}</p>
          <a href={site.poweredBy.href} target="_blank" rel="noreferrer" className="md:text-right hover:text-white">
            Powered by {site.poweredBy.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
