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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="highlights"
      className="flex min-h-[100svh] flex-col justify-center bg-white px-6 py-20 sm:px-10 lg:px-[6.5vw]"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <h2
            className="hl-reveal type-display text-[clamp(1.7rem,5.4vw,3.9rem)] leading-[1.15] text-steel-900 uppercase"
            data-visible={started}
          >
            {highlightsHeading.title}
          </h2>
          <p
            className="hl-reveal mt-5 text-sm tracking-[0.04em] text-steel-900/60 sm:text-base"
            data-visible={started}
            style={{ animationDelay: "120ms" }}
          >
            {highlightsHeading.standfirst}
          </p>
        </header>

        {/* Hairline quadrants. The rules give the whitespace structure so the
            band reads as composed rather than sparse. */}
        <dl className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:mt-16">
          {highlights.map((item, i) => (
            <Stat key={item.label} item={item} started={started} index={i} />
          ))}
        </dl>

        <p
          className="hl-reveal mt-12 text-center text-xs tracking-[0.03em] text-steel-900/45"
          data-visible={started}
          style={{ animationDelay: "900ms" }}
        >
          Placeholder figures — pending audited results.
        </p>
      </div>
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

  /* Rules run between the quadrants only, never around the outside. */
  const rules = [
    "border-steel-900/10",
    index % 2 === 0 ? "sm:border-r" : "",
    index < highlights.length - 2 ? "sm:border-b" : "",
    index > 0 ? "border-t sm:border-t-0" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`hl-reveal px-6 py-10 text-center sm:py-12 ${rules}`}
      data-visible={started}
      style={{ animationDelay: `${220 + index * 110}ms` }}
    >
      {/* The climbing figure is decorative; screen readers get the settled
          value once, from the sibling below. */}
      <dd
        aria-hidden
        className="type-figure text-[clamp(2.1rem,5.6vw,4rem)] leading-none text-steel-900 uppercase tabular-nums"
      >
        {format(shown, decimals, item)}
      </dd>
      <dd className="sr-only">{final}</dd>
      <dt className="mt-5 text-sm tracking-[0.06em] text-steel-900/60 sm:text-base">
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
 * figure settles rather than stopping dead.
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
