"use client";

import { useEffect, useRef, useState } from "react";
import { home } from "@/data/home";

export function StoryRail() {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const cards = home.stories;
  const active = open == null ? null : cards[open];

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
    if (open == null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (paused || open != null) return;
    const timer = window.setInterval(() => {
      const node = scroller.current;
      if (!node) return;
      const card = node.querySelector<HTMLElement>("[data-story]");
      const width = (card?.offsetWidth ?? 280) + 16;
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      node.scrollTo({ left: atEnd ? 0 : node.scrollLeft + width, behavior: "smooth" });
    }, 3800);
    return () => window.clearInterval(timer);
  }, [paused, open]);

  return (
    <section className="pb-8" aria-label="Maker stories">
      <div
        ref={scroller}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card, cardIndex) => (
          <article
            key={card.title}
            data-story
            className="relative h-[460px] w-[280px] shrink-0 snap-start overflow-hidden rounded-sm bg-black sm:w-[320px]"
          >
            <button
              type="button"
              className="absolute inset-0 text-left"
              aria-haspopup="dialog"
              aria-controls="cv-media-viewer"
              aria-label={`Open ${card.title} — ${card.category}`}
              onClick={() => {
                setPaused(true);
                setOpen(cardIndex);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />
              <p className="absolute left-4 top-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/90">
                {card.category}
              </p>
              <div className="absolute inset-x-4 bottom-4 text-white">
                <h2 className="max-w-[16rem] font-serif text-[28px] font-medium leading-none tracking-tight">{card.title}</h2>
                <span className="mt-4 flex items-center justify-between text-sm text-white/80">
                  <span>View story</span>
                  <span aria-hidden className="text-lg">
                    +
                  </span>
                </span>
              </div>
            </button>
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
      {active ? (
        <div
          id="cv-media-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setOpen(null)}
        >
          <div
            className="grid w-full max-w-3xl overflow-hidden bg-[#121814] text-[#f5f4f1] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.image} alt={active.alt} className="h-64 w-full object-cover sm:h-full" />
            <div className="p-6 md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#f5f4f1]/70">{active.category}</p>
              <h2 className="mt-3 font-serif text-4xl font-medium leading-none tracking-tight">{active.title}</h2>
              <p className="mt-5 text-base leading-7 text-[#f5f4f1]/85">
                {"story" in active && active.story
                  ? active.story
                  : "A piece from the Communiverse rail. Open the clubs to see who made it and who keeps it."}
              </p>
              <button
                type="button"
                className="mt-8 text-sm uppercase tracking-[0.16em] text-[#f5f4f1]/70 hover:text-white"
                onClick={() => setOpen(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
