"use client";

import { useEffect, useRef, useState } from "react";

export function StickyGallery({
  caption,
  images,
}: {
  caption: string;
  images: { src: string; alt: string }[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      setProgress(total > 0 ? scrolled / total : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={ref} className="relative h-[240vh] bg-paper" aria-label={caption}>
      <div className="sticky top-0 flex h-screen items-end overflow-hidden">
        <p className="absolute left-6 top-28 z-10 max-w-xs font-serif text-xl font-medium leading-tight tracking-[-0.02em] text-white mix-blend-difference md:left-16 md:max-w-sm md:text-[22px]">
          {caption}
        </p>
        <div
          className="flex h-[78vh] items-end gap-3 pl-6 md:gap-4 md:pl-16"
          style={{ transform: `translateX(${-progress * (images.length - 2) * 18}vw)` }}
        >
          {images.map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              className="h-full w-[68vw] shrink-0 object-cover md:w-[24vw]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
