"use client";

import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const ink = tone === "light" ? "text-black lg:text-white" : "text-black";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="absolute inset-x-0 top-0 h-[49px] bg-paper lg:hidden" />
      <div className={cn("relative mx-auto h-12 w-full max-w-[1440px] lg:h-[84px]", ink)}>
        <Link
          href="/"
          aria-label="Communiverse"
          className="pointer-events-auto absolute left-6 top-[15px] block h-[15.3px] w-[140px] overflow-hidden lg:left-16 lg:top-[29px] lg:h-[26.3px] lg:w-[240px]"
        >
          <Wordmark scale="scale-[0.1067] lg:scale-[0.183]" />
        </Link>
        <nav
          className="pointer-events-auto absolute left-[540px] top-5 hidden items-center gap-6 lg:flex"
          aria-label="Primary"
        >
          {site.nav.map((item) => (
            <Link key={item.label} href={item.href} className="group relative font-sans text-base font-medium leading-[22px]">
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="pointer-events-auto absolute right-6 top-3 font-serif text-base font-medium leading-[21px] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          ( {open ? "Close" : "Menu"} )
        </button>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "pointer-events-auto fixed inset-0 z-40 flex flex-col bg-[#171716] px-6 pt-28 text-white transition-transform duration-500 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-6" aria-label="Mobile">
          {site.nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-sans text-3xl font-medium uppercase tracking-[-0.03em]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
