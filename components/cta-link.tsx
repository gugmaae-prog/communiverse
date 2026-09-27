import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CtaLink({
  href,
  children,
  className,
  light = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  light?: boolean;
}) {
  const classes = cn(
    "group inline-flex items-center gap-2 pl-4 font-sans text-base font-medium leading-[22.4px]",
    light ? "text-white" : "text-black",
    className,
  );
  const icon = (
    <span
      className={cn(
        "inline-block h-6 w-6 shrink-0 rounded-full border-2 transition-transform group-hover:scale-110",
        light ? "border-white" : "border-black",
      )}
      aria-hidden
    />
  );
  const inner = (
    <>
      {icon}
      <span>{children}</span>
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
