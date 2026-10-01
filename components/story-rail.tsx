"use client";

import { useEffect, useRef, useState } from "react";
import { home } from "@/data/home";

export function StoryRail() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const cards = home.stories;

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const onScroll = () => {
      const card = node.querySelector<HTMLElement>("[data-story]");
      const width = (card?.offsetWidth ?? 280) + 16;
      setIndex(Math.min(cards.length - 1, Math.max(0, Math.round(node.scrollLeft / width))));
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [cards.length]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      const node = scroller.current;
      if (!node) return;
      const card = node.querySelector<HTMLElement>("[data-story]");
      const width = (card?.offsetWidth ?? 280) + 16;
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      node.scrollTo({ left: atEnd ? 0 : node.scrollLeft + width, behavior: "smooth" });
    }, 3800);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="pb-8" aria-label="Maker stories">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <article
            key={card.title}
            data-story
            className="relative h-[460px] w-[280px] shrink-0 snap-start overflow-hidden rounded-sm bg-black sm:w-[320px]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.image} alt={card.alt} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
            <p className="absolute left-4 top-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/90">
              {card.category}
            </p>
            <div className="absolute inset-x-4 bottom-4 text-white">
              <h2 className="font-serif text-[28px] font-medium leading-none tracking-tight">{card.title}</h2>
              <p className="mt-3 text-sm text-white/80">
                View story <span aria-hidden>+</span>
              </p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between px-5 text-xs uppercase tracking-[0.16em] text-[#f5f4f1]/70 md:px-10">
        <p>Drag to explore · Click a card</p>
        <div className="flex items-center gap-4">
          <p>
            {String(index + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
          </p>
          <button type="button" className="hover:text-white" onClick={() => setPaused((value) => !value)}>
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
    </section>
  );
}
