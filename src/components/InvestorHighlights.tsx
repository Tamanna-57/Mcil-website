"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  COUNT_DURATION,
  highlights,
  highlightsHeading,
  type Bar,
  type Highlight,
} from "@/lib/investor-highlights";

/** Hero photographs reused as thumbnails on the wide card. */
const THUMBS = [
  {
    src: "/images/hero-2.jpg",
    alt: "Cold rolled coils in the finished goods bay",
  },
  { src: "/images/hero-3.jpg", alt: "Bundled stock staged for despatch" },
  { src: "/images/hero-1.jpg", alt: "Operators finishing steel sections" },
];

export default function InvestorHighlights() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [started, setStarted] = useState(false);

  /* Counters run once, when the bento first scrolls into view. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    /* Safety net for environments without the observer (jsdom, very old
       browsers): show the cards rather than leaving them blank. Deferred a
       frame so the state change lands outside the effect body. */
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [tall, ...rest] = highlights;

  return (
    <section
      ref={sectionRef}
      id="highlights"
      className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="text-center">
          <p
            className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase"
            data-visible={started}
          >
            [ {highlightsHeading.eyebrow} ]
          </p>
          <h2
            className="hl-reveal type-display mt-4 text-[clamp(1.6rem,4.6vw,3.1rem)] leading-[1.15] text-steel-900 uppercase"
            data-visible={started}
            style={{ animationDelay: "80ms" }}
          >
            {highlightsHeading.title}
          </h2>
          <p
            className="hl-reveal mx-auto mt-4 max-w-xl text-sm text-steel-800 sm:text-base"
            data-visible={started}
            style={{ animationDelay: "160ms" }}
          >
            {highlightsHeading.standfirst}
          </p>
        </header>

        {/* Bento: the first card runs full height down the left, the last
            spans the two right columns along the bottom. */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:grid-rows-2">
          <Card
            item={tall}
            started={started}
            index={0}
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
          />
          {rest.map((item, i) => (
            <Card
              key={item.id}
              item={item}
              started={started}
              index={i + 1}
              className={item.visual === "thumbs" ? "lg:col-span-2" : undefined}
            />
          ))}
        </div>

        <p
          className="hl-reveal mt-8 text-center text-xs text-steel-800/70"
          data-visible={started}
          style={{ animationDelay: "820ms" }}
        >
          FY2025-26 figures as reported. Prior years from the published annual
          profit and loss.
        </p>
      </div>
    </section>
  );
}

function Card({
  item,
  started,
  index,
  className = "",
}: {
  item: Highlight;
  started: boolean;
  index: number;
  className?: string;
}) {
  const decimals = item.decimals ?? 0;
  const shown = useCountUp(item.value, started, index * 140);

  return (
    <article
      className={`hl-reveal flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-steel-900/8 sm:p-7 ${className}`}
      data-visible={started}
      style={{ animationDelay: `${240 + index * 110}ms` }}
    >
      <Figure item={item} shown={shown} decimals={decimals} />

      <h3 className="mt-3 font-display text-xl font-semibold text-steel-900 sm:text-2xl">
        {item.title}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-steel-800">
        {item.body}
      </p>

      <div className={item.visual === "thumbs" ? "mt-6" : "mt-auto pt-8"}>
        {item.visual === "mix" && (
          <MixList
            bars={item.bars ?? []}
            title={item.panelTitle ?? ""}
            started={started}
          />
        )}
        {item.visual === "gauge" && item.gauge && (
          <Gauge
            fill={item.gauge.fill}
            caption={item.gauge.caption}
            started={started}
          />
        )}
        {item.visual === "bars" && (
          <BarList bars={item.bars ?? []} started={started} />
        )}
        {item.visual === "thumbs" && item.cta && <ThumbRow cta={item.cta} />}
      </div>
    </article>
  );
}

function Figure({
  item,
  shown,
  decimals,
}: {
  item: Highlight;
  shown: number;
  decimals: number;
}) {
  const body = shown.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const final =
    (item.prefix ?? "") +
    item.value.toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    (item.suffix ?? "");

  return (
    <p>
      {/* The climbing figure is decorative; screen readers get the settled
          value once, from the sibling below. */}
      <span
        aria-hidden
        className="type-figure text-[clamp(2.2rem,4.4vw,3.1rem)] leading-none text-steel-900 tabular-nums"
      >
        {item.prefix}
        {body}
        {item.suffix ? (
          <span className={item.suffixSmall ? "text-[0.5em] align-super" : ""}>
            {item.suffix}
          </span>
        ) : null}
      </span>
      <span className="sr-only">{final}</span>
    </p>
  );
}

/** Titled panel that fills the tall card's spare height. */
function MixList({
  bars,
  title,
  started,
}: {
  bars: Bar[];
  title: string;
  started: boolean;
}) {
  return (
    <div className="rounded-xl bg-background p-5">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-steel-800/70 uppercase">
        {title}
      </p>
      <ul className="mt-5 space-y-4">
        {bars.map((bar, i) => (
          <li key={bar.label}>
            <div className="flex items-baseline justify-between text-xs text-steel-800">
              <span>{bar.label}</span>
              <span className="tabular-nums">
                {bar.display ?? `${bar.percent}%`}
              </span>
            </div>
            <span className="mt-2 block h-1.5 rounded-full bg-brand-pale">
              <span
                className="hl-track block h-full rounded-full bg-brand"
                style={{
                  width: started ? `${bar.percent}%` : "0%",
                  transitionDelay: `${420 + i * 90}ms`,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Semicircular arc, swept by dash-offset so it draws rather than appears. */
function Gauge({
  fill,
  caption,
  started,
}: {
  fill: number;
  caption: string;
  started: boolean;
}) {
  /* Arc length of the semicircle below: pi x r, r = 52. */
  const LENGTH = 163.4;
  return (
    <div>
      <svg viewBox="0 0 120 64" className="w-full max-w-[9.5rem]" aria-hidden>
        <path
          d="M8 60 A52 52 0 0 1 112 60"
          fill="none"
          stroke="var(--brand-pale)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          className="hl-arc"
          d="M8 60 A52 52 0 0 1 112 60"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={LENGTH}
          strokeDashoffset={started ? LENGTH * (1 - fill) : LENGTH}
        />
      </svg>
      <p className="mt-2 text-xs font-semibold text-steel-800">{caption}</p>
    </div>
  );
}

/** End-market split — label and value on one row, track beneath. */
function BarList({ bars, started }: { bars: Bar[]; started: boolean }) {
  return (
    <ul className="space-y-3.5">
      {bars.map((bar, i) => (
        <li key={bar.label}>
          <div className="flex items-baseline justify-between text-xs text-steel-800">
            <span>{bar.label}</span>
            <span className="tabular-nums">
              {bar.display ?? `${bar.percent}%`}
            </span>
          </div>
          <span className="mt-1.5 block h-1.5 rounded-full bg-brand-pale">
            <span
              className="hl-track block h-full rounded-full bg-brand"
              style={{
                width: started ? `${bar.percent}%` : "0%",
                transitionDelay: `${480 + i * 90}ms`,
              }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

function ThumbRow({ cta }: { cta: { label: string; href: string } }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <a
        href={cta.href}
        className="inline-flex items-center gap-2.5 rounded-full bg-steel-900 px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-brand-deep"
      >
        {cta.label}
        <svg
          width="15"
          height="10"
          viewBox="0 0 15 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M0 5h13M9 1l4 4-4 4" strokeLinecap="round" />
        </svg>
      </a>

      <div className="flex -space-x-3">
        {THUMBS.map((thumb) => (
          <span
            key={thumb.src}
            className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-surface"
          >
            <Image
              src={thumb.src}
              alt={thumb.alt}
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
        ))}
      </div>
    </div>
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
