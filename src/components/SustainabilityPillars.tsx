"use client";

import { useEffect, useRef, useState } from "react";
import { pillars as defaultPillars, type Pillar } from "@/lib/sustainability";

/**
 * The three pillars: Environment, People & Safety, Governance.
 *
 * Cards take the same three plate tones the product bands and the news cards
 * use — navy ink, the amber accent, pale blue — so the page is painted from
 * the site's own set. Each card is a claim in its title and the detail under
 * it, rather than an icon and a slogan.
 */
const TONES: Record<
  Pillar["tone"],
  { card: string; label: string; title: string; body: string; mark: string }
> = {
  ink: {
    card: "news-ink",
    label: "text-accent",
    title: "text-white",
    body: "text-white/75",
    mark: "bg-accent",
  },
  amber: {
    card: "news-amber",
    label: "text-steel-900/70",
    title: "text-steel-900",
    body: "text-steel-900/80",
    mark: "bg-steel-900/45",
  },
  pale: {
    card: "news-pale",
    label: "text-[var(--brand-ink)]",
    title: "text-steel-900",
    body: "text-steel-800",
    mark: "bg-[var(--brand-ink)]/50",
  },
};

export default function SustainabilityPillars({
  pillars = defaultPillars,
}: {
  pillars?: Pillar[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  /* Held back until the section arrives, like the other card grids. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background px-6 pb-20 sm:px-10 lg:px-[6.5vw] lg:pb-28"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-3">
        {pillars.map((pillar, i) => {
          const tone = TONES[pillar.tone];
          return (
            <article
              key={pillar.id}
              id={pillar.id}
              className={`hl-reveal flex scroll-mt-32 flex-col rounded-2xl p-7 sm:p-8 ${tone.card}`}
              data-visible={visible}
              style={{ animationDelay: `${140 + i * 110}ms` }}
            >
              <p
                className={`text-[10px] font-semibold tracking-[0.24em] uppercase ${tone.label}`}
              >
                {pillar.label}
              </p>

              <h3
                className={`mt-4 font-display text-xl leading-snug font-light ${tone.title}`}
              >
                {pillar.title}
              </h3>

              <p className={`mt-4 text-sm leading-relaxed ${tone.body}`}>
                {pillar.body}
              </p>

              <ul
                className={`mt-6 space-y-3 text-sm leading-relaxed ${tone.body}`}
              >
                {pillar.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span
                      className={`mt-2 h-px w-4 shrink-0 ${tone.mark}`}
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
