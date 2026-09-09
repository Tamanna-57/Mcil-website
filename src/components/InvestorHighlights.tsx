"use client";

import { useEffect, useRef, useState } from "react";
import {
  COUNT_DURATION,
  highlights,
  highlightsHeading,
  type Highlight,
} from "@/lib/investor-highlights";

export default function InvestorHighlights() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);

  /* Counters run once, when the band first scrolls into view. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    /* Safety net for environments without the observer (jsdom, very old
       browsers): show the band rather than leaving it blank. Deferred a frame
       so the state change lands outside the effect body. */
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setStarted(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="highlights"
      className="bg-white px-6 py-24 sm:px-10 lg:px-[6.5vw] lg:py-32"
    >
      <div className="mx-auto max-w-4xl text-center">
        <h2
          className="hl-reveal font-display text-[clamp(1.6rem,4.6vw,2.9rem)] leading-tight font-light tracking-[0.06em] text-steel-900 uppercase"
          data-visible={started}
        >
          {highlightsHeading.title}
        </h2>
        <p
          className="hl-reveal mt-4 text-base text-steel-900/65"
          data-visible={started}
          style={{ animationDelay: "120ms" }}
        >
          {highlightsHeading.standfirst}
        </p>
      </div>

      <dl className="mx-auto mt-16 grid max-w-4xl gap-x-12 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:gap-y-16">
        {highlights.map((item, i) => (
          <Stat key={item.label} item={item} started={started} index={i} />
        ))}
      </dl>

      <p className="mx-auto mt-16 max-w-4xl text-center text-xs text-steel-900/50">
        Placeholder figures — pending audited results.
      </p>
    </section>
  );
}

function Stat({
  item,
  started,
  index,
}: {
  item: Highlight;
  started: boolean;
  index: number;
}) {
  const decimals = item.decimals ?? 0;
  const shown = useCountUp(item.value, started, index * 140);
  const final = format(item.value, decimals, item);

  return (
    <div
      className="hl-reveal text-center"
      data-visible={started}
      style={{ animationDelay: `${220 + index * 110}ms` }}
    >
      {/* The climbing figure is decorative; screen readers get the settled
          value once, from the sibling below. */}
      <dd
        aria-hidden
        className="font-display text-[clamp(1.9rem,5vw,3rem)] leading-none font-light tracking-[0.03em] text-steel-900 uppercase tabular-nums"
      >
        {format(shown, decimals, item)}
      </dd>
      <dd className="sr-only">{final}</dd>
      <dt className="mt-4 text-sm text-steel-900/65 sm:text-base">
        {item.label}
      </dt>
    </div>
  );
}

function format(
  value: number,
  decimals: number,
  { prefix = "", suffix = "" }: Pick<Highlight, "prefix" | "suffix">,
) {
  return (
    prefix +
    value.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix
  );
}

/**
 * Climbs from zero to `target` once `active` turns true, easing out so the
 * figure settles rather than stopping dead. Returns the target immediately when
 * the viewer has asked for reduced motion.
 */
function useCountUp(target: number, active: boolean, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    /* Reduced motion collapses the climb to a single frame rather than
       skipping the animation path, which keeps the state update inside a
       callback instead of the effect body. */
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const duration = reduced ? 0 : COUNT_DURATION;

    let frame = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const progress =
        duration === 0 ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(
      () => {
        frame = requestAnimationFrame(tick);
      },
      reduced ? 0 : delay,
    );

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [active, target, delay]);

  return value;
}
