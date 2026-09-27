"use client";

import { useEffect, useState } from "react";

type HeroImage = { src: string; alt: string };

export function HeroCarousel({
  images,
  className = "",
}: {
  images: readonly HeroImage[];
  className?: string;
}) {
  const [frame, setFrame] = useState({ current: 0, previous: 0, cycle: 0 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let current = 0;

    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const previous = current;
          current = (current + 1) % images.length;
          setFrame((value) => ({ current, previous, cycle: value.cycle + 1 }));
          schedule();
        },
        current === 0 ? 1500 : 3000,
      );
    };

    const start = () => {
      window.clearTimeout(timer);
      current = 0;
      setFrame((value) => ({ current: 0, previous: 0, cycle: value.cycle + 1 }));
      if (!media.matches && images.length > 1) schedule();
    };

    start();
    media.addEventListener("change", start);
    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", start);
    };
  }, [images.length]);

  const previous = images[frame.previous];
  const current = images[frame.current];

  return (
    <div className={`hero-carousel ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={previous.src} alt="" aria-hidden className="hero-carousel-image" />
      {frame.current === frame.previous ? null : (
        <div key={`${frame.current}-${frame.cycle}`} className="hero-carousel-wipe">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.src} alt={current.alt} className="hero-carousel-image" />
        </div>
      )}
    </div>
  );
}
