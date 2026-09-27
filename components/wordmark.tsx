import { cn } from "@/lib/utils";

/** Framer renders COMMUNIVERSE at 179.391px and scales the box. */
export function Wordmark({
  scale,
  className,
}: {
  scale: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block origin-top-left whitespace-nowrap font-sans text-[179.391px] font-medium uppercase leading-[143.513px] tracking-[-10.7634px]",
        scale,
        className,
      )}
    >
      Communiverse
    </span>
  );
}
