"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type Feature = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function FeaturesCarousel({ features }: { features: Feature[] }) {
  const [index, setIndex] = useState(0);
  const count = features.length;

  function goPrev() {
    setIndex((current) => (current - 1 + count) % count);
  }

  function goNext() {
    setIndex((current) => (current + 1) % count);
  }

  const orderedFeatures = features.map((_, position) => features[(index + position) % count]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={goPrev}
        aria-label="Cartes précédentes"
        className="absolute left-0 top-1/2 z-10 -translate-x-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-surface-border/10 bg-surface-raised text-ink-primary shadow-lg transition hover:bg-accent-500 hover:text-surface"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        type="button"
        onClick={goNext}
        aria-label="Cartes suivantes"
        className="absolute right-0 top-1/2 z-10 translate-x-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-surface-border/10 bg-surface-raised text-ink-primary shadow-lg transition hover:bg-accent-500 hover:text-surface"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="overflow-hidden px-2 sm:px-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {orderedFeatures.slice(0, 3).map(({ icon, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl border border-surface-border/10 bg-surface-raised p-6 transition hover:border-accent-500/30"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent-500/0 blur-2xl transition group-hover:bg-accent-500/10" />
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10 text-accent-400">
                {icon}
              </span>
              <h3 className="relative mt-4 text-base font-semibold text-ink-primary">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-secondary">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {features.map((feature, i) => (
          <button
            key={feature.title}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aller à la carte ${feature.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-accent-500" : "w-1.5 bg-surface-border/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
