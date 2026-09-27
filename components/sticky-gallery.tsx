"use client";

import { useEffect, useRef } from "react";

type GalleryImageData = { src: string; alt: string };

function GalleryPicture({
  image,
  className = "",
  decorative = false,
}: {
  image: GalleryImageData;
  className?: string;
  decorative?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.src} alt={decorative ? "" : image.alt} className={className} aria-hidden={decorative || undefined} />
  );
}

export function StickyGallery({
  caption,
  images,
}: {
  caption: string;
  images: GalleryImageData[];
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
      sectionTop = section.offsetTop;
      range = Math.max(section.offsetHeight - window.innerHeight, 1);
    };

    const write = () => {
      raf = 0;
      const progress = Math.min(Math.max((window.scrollY - sectionTop) / range, 0), 1);
      section.style.setProperty("--gallery-progress", String(progress));
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(write);
    };

    const configure = () => {
      measure();
      window.cancelAnimationFrame(raf);
      raf = 0;
      section.style.setProperty("--gallery-progress", media.matches ? "1" : "0");
      if (!media.matches) onScroll();
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

  return (
    <section ref={ref} className="gallery-scroll" aria-label={caption}>
      <div className="gallery-desktop" aria-hidden="true">
        <div className="gallery-half gallery-left">
          <GalleryPicture image={images[0]} className="gallery-cover" decorative />
          <div className="gallery-caption">{caption}</div>
          <div className="gallery-left-console">
            <GalleryPicture image={images[1]} className="gallery-cover" decorative />
          </div>
        </div>
        <div className="gallery-half gallery-right">
          <GalleryPicture image={images[2]} className="gallery-cover" decorative />
          <GalleryPicture image={images[3]} className="gallery-prop gallery-typewriter" decorative />
          <GalleryPicture image={images[4]} className="gallery-prop gallery-record" decorative />
          <GalleryPicture image={images[5]} className="gallery-prop gallery-fish" decorative />
          <div className="gallery-stationery">
            <GalleryPicture image={images[6]} className="gallery-cover" decorative />
          </div>
          {images.slice(7).map((image, index) => (
            <GalleryPicture
              key={image.src}
              image={image}
              decorative
              className={`gallery-float gallery-float-${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="gallery-mobile">
        <GalleryPicture image={images[0]} className="gallery-mobile-hero" />
        <p className="gallery-mobile-caption">{caption}</p>
        <GalleryPicture image={images[2]} className="gallery-mobile-palette" />
        <div className="gallery-mobile-icons">
          {images.slice(3, 6).map((image) => (
            <GalleryPicture key={image.src} image={image} />
          ))}
        </div>
        <GalleryPicture image={images[6]} className="gallery-mobile-stationery" />
        <div className="gallery-mobile-collage">
          {images.slice(7).map((image) => (
            <GalleryPicture key={image.src} image={image} />
          ))}
        </div>
      </div>
    </section>
  );
}
