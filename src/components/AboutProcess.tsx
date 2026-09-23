"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { processSteps, type ProcessStep } from "@/lib/about-process";

/**
 * How much page scroll each stage after the first is worth, as a fraction of
 * the pinned panel's own height.
 *
 * It is the one number that sets how long the section holds the page: at a
 * half-screen a stage takes a comfortable flick to reach, and four stages cost
 * about two and a half screens in total. The track's height is derived from it
 * (see `--ap-span` below), so the CSS cannot drift from what is set here.
 */
const STEP_TRAVEL = 0.5;

/** Below this many pixels of slack the section is not pinned — see `.ap-pin`. */
const PINNED_MIN_TRAVEL = 8;

export default function AboutProcess({
  eyebrow = "Process",
  title = "How a coil is made",
  steps = processSteps,
}: {
  eyebrow?: string;
  title?: string;
  steps?: ProcessStep[];
}) {
  const trackRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);

  /*
   * The stages are driven by the page's own scroll, with the panel stuck to
   * the viewport for as long as they last: scrolling over the section changes
   * the stage and nothing on screen moves, and the page carries on only once
   * the last stage has been reached.
   *
   * This used to be done by taking the wheel event and calling
   * `preventDefault()` on it, which only ever half worked — the wheel is one
   * of several ways to scroll, and every event on either side of the section's
   * own range went to the page, so a stage change and a jump down the page
   * came out of the same flick. Sticky positioning gets the same effect out of
   * the browser's own scrolling, so the keyboard, the scrollbar and a touch
   * drag all drive the stages too, and nothing has to fight the page.
   *
   * Pinning starts at `lg` (see globals.css). Narrower than that the section
   * is an ordinary block and the pills below page through the stages, so a
   * phone is never handed a screen that scrolls without moving.
   */

  /** Slack between the track and the pinned panel; 0 when it is not pinned. */
  const travelOf = useCallback(() => {
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin) return 0;
    const travel = track.offsetHeight - pin.offsetHeight;
    return travel > PINNED_MIN_TRAVEL ? travel : 0;
  }, []);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const track = trackRef.current;
      const pin = pinRef.current;
      const travel = travelOf();
      if (!track || !pin || !travel) return;

      /* How far the panel has slid down inside its track: nothing before it
         pins, the whole of the slack once it has carried the panel to the
         bottom. Measured rather than worked back from the scroll position, so
         the sticky offset is stated once, in the stylesheet. */
      const slid =
        pin.getBoundingClientRect().top - track.getBoundingClientRect().top;

      /* One band of the travel per stage. Held just short of 1 so the last
         band belongs to the last stage rather than to one past it. */
      const progress = Math.min(Math.max(slid / travel, 0), 0.999999);
      setStep(Math.floor(progress * steps.length));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [steps.length, travelOf]);

  /* A pill is a position on the page while the section is pinned, so it
     scrolls there and lets the handler above set the stage on the way. */
  const goToStep = useCallback(
    (i: number) => {
      const target = Math.min(Math.max(i, 0), steps.length - 1);
      const track = trackRef.current;
      const pin = pinRef.current;
      const travel = travelOf();
      if (!track || !pin || !travel) {
        setStep(target);
        return;
      }

      const stickyTop = Number.parseFloat(getComputedStyle(pin).top) || 0;
      const trackTop = track.getBoundingClientRect().top + window.scrollY;
      const middleOfBand = travel * ((target + 0.5) / steps.length);
      window.scrollTo({
        top: trackTop - stickyTop + middleOfBand,
        behavior: "smooth",
      });
    },
    [steps.length, travelOf],
  );

  const active = steps[step] ?? steps[0];
  if (!active) return null;

  return (
    <section
      ref={trackRef}
      id="process"
      style={
        {
          "--ap-span": 1 + (steps.length - 1) * STEP_TRAVEL,
        } as React.CSSProperties
      }
      className="ap-track scroll-mt-[var(--header-h)] bg-background"
    >
      <div ref={pinRef} className="ap-pin px-4 sm:px-8 lg:px-[5vw]">
        <div className="ap-inner mx-auto flex w-full max-w-6xl flex-col py-20">
          <header className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
              [ {eyebrow} ]
            </p>
            <h2 className="ap-title type-display mt-3 text-[clamp(1.5rem,4vw,2.6rem)] leading-[1.15] text-steel-900 uppercase">
              {title}
            </h2>
          </header>

          {/* Pill bar, echoing the reference's dashboard nav. */}
          <div className="mt-8 flex shrink-0 justify-center lg:mt-[var(--ap-gap,1.5rem)]">
            <div
              role="tablist"
              aria-label="Production stage"
              className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1.5 ring-1 ring-steel-900/10"
            >
              {steps.map((s, i) => (
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

          {/* The panel takes whatever height the pinned screen has left, so a
              short laptop gets a shorter photograph rather than a section that
              runs off the bottom of its own pin. */}
          <div className="ap-panel mt-6 grid items-center gap-8 rounded-3xl bg-surface p-5 ring-1 ring-steel-900/10 sm:p-7 lg:mt-[var(--ap-gap,1.5rem)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-stretch lg:gap-12 lg:p-[var(--ap-pad,2.25rem)]">
            <Copy step={active} index={step} />
            <Stage steps={steps} current={step} />
          </div>

          {/* How far through the stages we are. */}
          <div className="mx-auto mt-6 h-px w-full max-w-md shrink-0 bg-steel-900/12 lg:mt-[var(--ap-gap,1.5rem)]">
            <div
              className="h-full bg-brand transition-[width] duration-300 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Copy({ step, index }: { step: ProcessStep; index: number }) {
  return (
    /* Keyed so the copy replays its entrance on every step change. */
    <div key={step.id} className="ap-copy order-2 lg:order-1 lg:self-center">
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
function Stage({ steps, current }: { steps: ProcessStep[]; current: number }) {
  return (
    /* The photograph fills whatever height the panel has on a wide screen,
       rather than holding its own ratio and leaving the card half empty. */
    <div className="ap-figure relative order-1 aspect-[16/10] w-full min-w-0 overflow-hidden rounded-2xl bg-steel-900/5 lg:order-2 lg:aspect-auto lg:h-full lg:min-h-0">
      {steps.map((s, i) => {
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
              /* Anchored to the top left: the step number and title are burned
                 into that corner of each photograph, so a centred crop cuts
                 them off — sideways once the frame is wider than the 3:2
                 source, and lengthways once the panel makes it taller. */
              className="object-cover object-left-top"
            />
          </div>
        );
      })}
    </div>
  );
}
