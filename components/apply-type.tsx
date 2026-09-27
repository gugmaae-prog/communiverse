"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { publicUrl } from "@/lib/public-url";

const frames = ["A", "AP", "APP", "APPL", "APPLY", "APPLY N", "APPLY NO"];

export function ApplyType({
  heading,
  href,
  images,
}: {
  heading: string;
  href: string;
  images: { src: string; alt: string }[];
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let sectionTop = 0;
    let range = 1;
    let raf = 0;

    const measure = () => {
      sectionTop = section.offsetTop - window.innerHeight;
      range = Math.max(window.innerHeight, 1);
    };
    const write = () => {
      raf = 0;
      const progress = Math.min(Math.max((window.scrollY - sectionTop) / range, 0), 1);
      section.style.setProperty("--apply-progress", String(media.matches ? 1 : progress));
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(write);
    };
    const configure = () => {
      measure();
      onScroll();
    };

    configure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", configure);
    window.visualViewport?.addEventListener("resize", configure);
    media.addEventListener("change", configure);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", configure);
      window.visualViewport?.removeEventListener("resize", configure);
      media.removeEventListener("change", configure);
    };
  }, []);

  const earlyImages = [images[2], images[0], images[1], images[2]];
  const finalImages = [images[8], images[6], images[7], images[8]];

  return (
    <section ref={ref} className="apply-scene">
      <div className="apply-stage">
        <div className="apply-image-grid apply-image-grid-early" aria-hidden="true">
          {earlyImages.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${image.src}-${index}`} src={image.src} alt="" />
          ))}
        </div>
        <div className="apply-image-grid apply-image-grid-final" aria-hidden="true">
          {finalImages.map((image, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`${image.src}-${index}`} src={image.src} alt="" />
          ))}
        </div>
        <div className="apply-shade" aria-hidden="true" />
        <div className="apply-fragments" aria-hidden="true">
          {frames.map((frame) => (
            <span key={frame}>{frame}</span>
          ))}
        </div>
        <div className="apply-final">
          <p>APPLY NOW</p>
          <Link href={href} className="apply-link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicUrl("/media/FlrcoDiRgKnutLY8XFLHsozkAE.png")} alt="" aria-hidden />
            <span>{heading}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
