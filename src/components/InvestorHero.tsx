"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  IR_SLIDE_DURATION,
  investorSlides,
  type HeroMetric,
  type InvestorSlide,
} from "@/lib/investor-hero";

export default function InvestorHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);

  const go = useCallback((delta: number) => {
    setIndex(
      (i) => (i + delta + investorSlides.length) % investorSlides.length,
    );
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => go(1), IR_SLIDE_DURATION);
    return () => window.clearTimeout(timer);
  }, [index, paused, go]);

  /* Restart the push-in on the newly active plate without remounting the
     <Image>, same approach as the homepage hero. */
  useEffect(() => {
    const plate = plateRefs.current[index];
    if (!plate) return;
    for (const animation of plate.getAnimations()) {
      animation.currentTime = 0;
      animation.play();
    }
  }, [index]);

  const slide = investorSlides[index];

  return (
    <section
      className="ir-hero relative isolate flex min-h-[100svh] w-full flex-col overflow-hidden bg-steel-900"
      aria-roledescription="carousel"
      aria-label="Investor highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {investorSlides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: "var(--ir-fade-duration)",
          }}
          aria-hidden={i !== index}
        >
          <div
            ref={(el) => {
              plateRefs.current[i] = el;
            }}
            className="ir-plate absolute inset-0"
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: s.position }}
            />
          </div>
        </div>
      ))}

      {/* Scrim: darkest at the left where the headline sits, with a floor wash
          so the banner and controls keep their footing. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/45"
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 items-center px-6 pt-28 pb-44 sm:px-10 lg:px-[6.5vw] lg:pb-60">
        <div
          key={slide.id}
          className="grid w-full gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-center"
        >
          <Copy slide={slide} />
          {slide.groups ? <Metrics slide={slide} /> : null}
        </div>
      </div>

      {slide.banner ? <Banner key={`b-${slide.id}`} slide={slide} /> : null}

      <Controls
        index={index}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onSelect={setIndex}
        paused={paused}
      />

      <p className="sr-only" aria-live="polite">
        {slide.eyebrow}. {slide.headline.join(" ")}
      </p>
    </section>
  );
}

function Copy({ slide }: { slide: InvestorSlide }) {
  return (
    <div className="max-w-xl">
      <p
        className="ir-in text-[11px] font-semibold tracking-[0.22em] text-[var(--ir-soft)] uppercase sm:text-xs"
        style={{ animationDelay: "80ms" }}
      >
        {slide.eyebrow}
      </p>

      <h1 className="ir-headline mt-5 font-display font-light text-white uppercase">
        {slide.headline.map((line, i) => (
          <span
            key={line}
            className="ir-in block"
            style={{ animationDelay: `${200 + i * 110}ms` }}
          >
            {line}
          </span>
        ))}
      </h1>

      {slide.standfirst ? (
        <p
          className="ir-in mt-6 max-w-md text-sm leading-relaxed text-white/75 sm:text-base"
          style={{ animationDelay: "440ms" }}
        >
          {slide.standfirst}
        </p>
      ) : null}

      <div className="ir-in mt-9" style={{ animationDelay: "540ms" }}>
        <a
          href={slide.cta.href}
          className="ir-cta group inline-flex items-center gap-3 px-7 py-3.5 text-[13px] font-semibold tracking-[0.1em] text-white uppercase"
        >
          {slide.cta.label}
          <svg
            width="16"
            height="10"
            viewBox="0 0 16 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M0 5h14M10 1l4 4-4 4" strokeLinecap="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Metrics({ slide }: { slide: InvestorSlide }) {
  return (
    <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:gap-x-14">
      {slide.groups!.map((group, gi) => (
        <div
          key={group.heading}
          className={
            gi > 0
              ? "sm:border-l sm:border-white/25 sm:pl-12 lg:pl-14"
              : undefined
          }
        >
          <h2
            className="ir-in text-xl leading-tight font-semibold text-white sm:text-2xl"
            style={{ animationDelay: `${300 + gi * 90}ms` }}
          >
            {group.heading}
          </h2>

          <dl className="mt-6 space-y-6">
            {group.metrics.map((metric, mi) => (
              <Metric
                key={metric.label}
                metric={metric}
                delay={400 + gi * 90 + mi * 110}
              />
            ))}
          </dl>

          {group.footnote ? (
            <p
              className="ir-in mt-7 max-w-[26ch] text-xs leading-relaxed text-white/70"
              style={{ animationDelay: `${760 + gi * 90}ms` }}
            >
              {group.footnote}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Metric({ metric, delay }: { metric: HeroMetric; delay: number }) {
  return (
    <div>
      <dt
        className="ir-chip ir-in relative inline-block text-sm font-bold tracking-[0.06em] text-white uppercase sm:text-base"
        style={{ animationDelay: `${delay}ms` }}
      >
        <span className="relative z-10">{metric.label}</span>
      </dt>
      <dd
        className="ir-in mt-1.5 flex items-baseline gap-2.5"
        style={{ animationDelay: `${delay + 70}ms` }}
      >
        {metric.prefix ? (
          <span className="text-lg font-light text-white/85 sm:text-xl">
            {metric.prefix}
          </span>
        ) : null}
        <span className="text-3xl leading-none font-bold text-white sm:text-[2.1rem]">
          {metric.trend ? (
            <span aria-hidden className="mr-0.5">
              {metric.trend === "up" ? "↑" : "↓"}
            </span>
          ) : null}
          {metric.value}
        </span>
      </dd>
      {metric.note ? (
        <p
          className="ir-in mt-1 text-xs text-white/70"
          style={{ animationDelay: `${delay + 140}ms` }}
        >
          {metric.note}
        </p>
      ) : null}
    </div>
  );
}

function Banner({ slide }: { slide: InvestorSlide }) {
  const { stats, footnote } = slide.banner!;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 flex justify-end px-6 sm:bottom-24 sm:px-10 lg:px-[6.5vw]">
      <div className="w-full lg:w-[52%]">
        <div className="ir-banner flex items-stretch gap-6 px-6 py-5 sm:gap-10 sm:px-8">
          <HatchMark />
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col justify-center ${
                i > 0 ? "border-l border-white/30 pl-6 sm:pl-10" : ""
              }`}
            >
              <span className="text-[11px] font-semibold tracking-[0.14em] text-white/85 uppercase">
                {stat.label}
              </span>
              <span className="text-2xl leading-none font-bold text-white sm:text-3xl">
                {stat.trend ? (
                  <span aria-hidden className="mr-0.5">
                    {stat.trend === "up" ? "↑" : "↓"}
                  </span>
                ) : null}
                {stat.value}
              </span>
            </div>
          ))}
        </div>
        {footnote ? (
          <p
            className="ir-in mt-2 text-right text-[11px] text-white/65"
            style={{ animationDelay: "900ms" }}
          >
            {footnote}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** The ruled block that opens the banner, echoing the reference's hatch mark. */
function HatchMark() {
  return (
    <svg
      width="34"
      height="30"
      viewBox="0 0 34 30"
      fill="none"
      aria-hidden
      className="hidden self-center text-white/70 sm:block"
    >
      {[0, 6, 12, 18, 24].map((x) => (
        <path
          key={x}
          d={`M${x + 8} 4 L${x} 26`}
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

function Controls({
  index,
  onPrev,
  onNext,
  onSelect,
  paused,
}: {
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
  paused: boolean;
}) {
  return (
    <div className="absolute inset-x-0 bottom-8 z-20 flex items-center justify-between gap-6 px-6 sm:px-10 lg:px-[6.5vw]">
      <div
        className="flex items-center gap-3"
        role="tablist"
        aria-label="Choose a slide"
      >
        {investorSlides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={s.headline.join(" ")}
            onClick={() => onSelect(i)}
            className="group h-6 w-10 cursor-pointer sm:w-14"
          >
            <span className="relative block h-px w-full bg-white/30 transition-colors group-hover:bg-white/60">
              {i === index && (
                <span
                  key={`fill-${index}-${paused}`}
                  className="ir-progress absolute inset-y-0 left-0 block bg-white"
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous slide"
          className="ir-arrow ir-arrow-ghost"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Next slide"
          className="ir-arrow ir-arrow-solid"
        >
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="9"
      height="14"
      viewBox="0 0 9 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path
        d={dir === "left" ? "M7.5 1 1.5 7l6 6" : "M1.5 1l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
