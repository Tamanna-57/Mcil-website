"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  processSteps,
  SCROLL_PER_STEP,
  type ProcessStep,
} from "@/lib/about-process";

export default function AboutProcess() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  /* The panel is pinned while the tall track scrolls past it; how far through
     that track we are decides which step is showing. */
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = trackRef.current;
      if (!el) return;

      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) return;

      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        travel,
      );
      const p = scrolled / travel;
      setProgress(p);
      setStep((current) => {
        const next = Math.min(
          processSteps.length - 1,
          Math.floor(p * processSteps.length),
        );
        return next === current ? current : next;
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Clicking a tab scrolls to the slice of track that owns that step. */
  const goToStep = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const target = el.offsetTop + (travel * (i + 0.5)) / processSteps.length;
    window.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  const active = processSteps[step];

  return (
    <section id="process" className="bg-background">
      <div
        ref={trackRef}
        style={{ height: `${processSteps.length * SCROLL_PER_STEP}vh` }}
      >
        <div className="ap-pin sticky top-0 flex h-[100svh] items-center px-4 sm:px-8 lg:px-[5vw]">
          <div className="mx-auto w-full max-w-6xl">
            <header className="text-center">
              <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
                [ Process ]
              </p>
              <h2 className="ap-title type-display mt-3 text-[clamp(1.5rem,4vw,2.6rem)] leading-[1.15] text-steel-900 uppercase">
                How a coil is made
              </h2>
            </header>

            {/* Pill bar, echoing the reference's dashboard nav. */}
            <div className="mt-8 flex justify-center">
              <div
                role="tablist"
                aria-label="Production stage"
                className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1.5 ring-1 ring-steel-900/10"
              >
                {processSteps.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={i === step}
                    onClick={() => goToStep(i)}
                    className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:px-5 sm:text-sm ${
                      i === step
                        ? "bg-steel-900 text-white"
                        : "text-steel-800 hover:text-steel-900"
                    }`}
                  >
                    <span className="mr-2 opacity-60 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-panel mt-6 grid items-center gap-8 rounded-3xl bg-surface p-5 ring-1 ring-steel-900/10 sm:p-7 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-12 lg:p-9">
              <Copy step={active} index={step} />
              <Stage current={step} />
            </div>

            {/* Continuous rail, so the pinned panel still reads as scrolling. */}
            <div className="mx-auto mt-6 h-px w-full max-w-md bg-steel-900/12">
              <div
                className="h-full bg-brand transition-[width] duration-150 ease-linear"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Copy({ step, index }: { step: ProcessStep; index: number }) {
  return (
    /* Keyed so the copy replays its entrance on every step change. */
    <div key={step.id} className="order-2 lg:order-1">
      <p className="ap-in text-[11px] font-semibold tracking-[0.2em] text-brand-deep uppercase">
        Stage {String(index + 1).padStart(2, "0")}
      </p>
      <h3
        className="ap-in mt-3 font-display text-2xl leading-tight font-semibold text-steel-900 sm:text-3xl"
        style={{ animationDelay: "60ms" }}
      >
        {step.title}
      </h3>
      <p
        className="ap-in mt-4 max-w-md text-sm leading-relaxed text-steel-800 sm:text-base"
        style={{ animationDelay: "120ms" }}
      >
        {step.body}
      </p>

      <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
        {step.facts.map((fact, i) => (
          <div
            key={fact.label}
            className="ap-in"
            style={{ animationDelay: `${190 + i * 70}ms` }}
          >
            <dt className="text-[11px] tracking-[0.12em] text-steel-800/70 uppercase">
              {fact.label}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold text-steel-900">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Stacked photographs. The active one sits at rest; steps still to come wait
 * off to the right and steps already passed sit off to the left, so advancing
 * reads as one continuous right-to-left travel.
 */
function Stage({ current }: { current: number }) {
  return (
    <div className="ap-figure relative order-1 aspect-[16/10] overflow-hidden rounded-2xl bg-steel-900/5 lg:order-2">
      {processSteps.map((s, i) => {
        const offset = i - current;
        return (
          <div
            key={s.id}
            className="ap-plate absolute inset-0"
            aria-hidden={offset !== 0}
            style={{
              opacity: offset === 0 ? 1 : 0,
              transform: `translateX(${offset * 14}%) scale(${offset === 0 ? 1 : 1.04})`,
              /* Keep neighbours paintable so the travel is visible, and drop
                 anything further out of the compositor entirely. */
              visibility: Math.abs(offset) > 1 ? "hidden" : "visible",
              zIndex: offset === 0 ? 2 : 1,
            }}
          >
            <Image
              src={s.image}
              alt={s.alt}
              fill
              sizes="(min-width: 1024px) 58vw, 92vw"
              priority={i === 0}
              /* Anchored to the top: the step number and title are burned into
                 the top-left of each photograph, so a centred crop cuts them
                 off as soon as the frame is wider than the 3:2 source. */
              className="object-cover object-top"
            />
          </div>
        );
      })}
    </div>
  );
}
