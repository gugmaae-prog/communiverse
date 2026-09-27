"use client";

import { useEffect, useState } from "react";

const frames = ["A", "AP", "APP", "APPL", "APPLY", "APPLY N", "APPLY NO", "APPLY NOW"];

export function ApplyType({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setIndex(frames.length - 1);
      return;
    }
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % frames.length);
    }, 160);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className={`font-sans font-semibold uppercase leading-none tracking-[-0.04em] ${className}`} aria-hidden>
      {frames[index]}
    </p>
  );
}
