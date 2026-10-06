import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PillLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const classes = cn(
    "inline-flex items-center gap-3 rounded-full border border-[#f5f4f1]/35 px-5 py-3 text-[13px] font-medium uppercase tracking-[0.16em] text-[#f5f4f1] transition-colors hover:bg-[#f5f4f1] hover:text-[#121814]",
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <span aria-hidden>↗</span>
    </>
  );

  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {inner}
    </a>
  );
}
