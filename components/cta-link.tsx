import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { publicUrl } from "@/lib/public-url";

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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={publicUrl(light ? "/media/FlrcoDiRgKnutLY8XFLHsozkAE.png" : "/media/iWgN0bK1Gy8ikvnb2jS91LrzNQ.png")}
      alt=""
      className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110"
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
