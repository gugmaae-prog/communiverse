"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const menu = [
  { n: "01", label: "How it works", href: "/#how-it-works" },
  { n: "02", label: "Makers", href: "/makers" },
  { n: "03", label: "Brands", href: "/#for-brands" },
  { n: "04", label: "Experiences", href: "/#experiences" },
  { n: "05", label: "Contact", href: "/contact#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[rgba(15,22,18,0.94)] text-[#f5f4f1] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-10">
        <Link href="/" className="font-sans text-lg font-medium tracking-[-0.04em]" aria-label="Communiverse">
          Communiverse
        </Link>
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {site.nav.map((item) =>
            item.label === "Contact" ? (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white hover:text-[#121814]"
              >
                Contact <span aria-hidden>+</span>
              </Link>
            ) : (
              <Link key={item.label} href={item.href} className="text-sm text-[#f5f4f1]/85 hover:text-white">
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <button
          type="button"
          className="font-serif text-base italic lg:hidden"
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
          "fixed inset-0 z-40 flex flex-col bg-[#121814] px-6 pt-28 text-[#f5f4f1] lg:hidden",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <nav className="flex flex-col gap-6" aria-label="Mobile">
          {menu.map((item) => (
            <Link
              key={item.n}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-sans text-3xl font-medium uppercase tracking-[-0.03em]"
            >
              <span className="mr-3 font-serif text-base italic text-[#a39e94]">{item.n}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
