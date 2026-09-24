"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { edit, editImage } from "@/lib/admin/editable";
import { processSteps, type ProcessStep } from "@/lib/about-process";

/**
 * One flick, one stage: further wheel events are ignored for this long, ms.
 *
 * A trackpad fires wheel events continuously, so without it a single swipe
 * would run through every stage at once.
 */
const STEP_COOLDOWN = 300;

/** A gap longer than this between wheel events is a new gesture, ms. */
const GESTURE_GAP = 250;

/**
 * How long the tail of the flick that reached the last stage is swallowed, ms.
 *
 * The momentum of a trackpad swipe carries on for the best part of a second
 * after the fingers have left it. Handing the wheel straight back at the last
 * stage would spend that momentum on the page, so one gesture would both
 * change the stage and throw the page down — which is exactly what the
 * section is meant not to do. The rest of that flick is swallowed instead,
 * and the next one, made deliberately, scrolls the page.
 */
const RELEASE_HOLD = 700;

/**
 * How much of the card has to be on screen before the wheel over it drives the
 * stages, as a fraction of its height. Enough that the photographs changing
 * are plainly visible; not so much that a flick has to land it exactly.
 */
const MIN_VISIBLE = 0.6;

export default function AboutProcess({
  eyebrow = "Process",
  title = "How a coil is made",
  steps = processSteps,
}: {
  eyebrow?: string;
  title?: string;
  steps?: ProcessStep[];
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState(0);

  const goToStep = useCallback(
    (i: number) => setStep(Math.min(Math.max(i, 0), steps.length - 1)),
    [steps.length],
  );

  /* The wheel handler has to decide whether to take the event before React
     re-renders, so it reads the current stage from a ref rather than closing
     over the state. */
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /*
   * Both ways through the section, chosen by where the pointer is.
   *
   * Scroll with the pointer on the card and the wheel steps through the
   * stages instead of moving the page — the photographs slide across, one
   * stage per flick. Past the last stage (or the first, scrolling up) the
   * wheel is handed back and the page carries on.
   *
   * Scroll with the pointer anywhere else — the heading, the pills, the space
   * either side of the card — and the page scrolls as it always does, so
   * someone who does not want the stages is never held by them.
   *
   * Only for a mouse or trackpad: a touchscreen has no pointer to be "over"
   * the card, so there the pills are all there is.
   */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    /* Where the fixed header stops and the page the visitor can see starts. */
    const headerHeight = () =>
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-h",
        ),
      ) || 0;

    let lastEventAt = 0;
    let lastStepAt = 0;

    const onWheel = (event: WheelEvent) => {
      /* Sideways scrolling and the smallest of nudges are not stage changes. */
      if (Math.abs(event.deltaY) < 4) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const now = event.timeStamp || performance.now();
      const midGesture = now - lastEventAt < GESTURE_GAP;
      lastEventAt = now;

      /* Mostly off the screen still: the card is on its way in or out, and
         the wheel is the page's until it has arrived. */
      const box = el.getBoundingClientRect();
      const visible =
        Math.min(box.bottom, window.innerHeight) -
        Math.max(box.top, headerHeight());
      if (box.height <= 0 || visible / box.height < MIN_VISIBLE) return;

      const next = stepRef.current + (event.deltaY > 0 ? 1 : -1);
      if (next < 0 || next > steps.length - 1) {
        /* Out of stages this way. What is left of the flick that landed the
           last one is swallowed so the page does not lurch on the same
           gesture; after that the wheel is the page's again. */
        if (midGesture && now - lastStepAt < RELEASE_HOLD) {
          event.preventDefault();
        }
        return;
      }

      /* Taken — whether or not it turns into a stage change, so the rest of a
         flick is spent here rather than on the page. */
      event.preventDefault();

      if (now - lastStepAt < STEP_COOLDOWN) return;
      lastStepAt = now;
      setStep(next);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [steps.length]);

  const active = steps[step] ?? steps[0];
  if (!active) return null;

  return (
    <section
      id="process"
      className="ap-section scroll-mt-[var(--header-h)] bg-background px-4 sm:px-8 lg:px-[5vw]"
    >
      <div className="ap-inner mx-auto flex w-full max-w-6xl flex-col py-20">
        <header className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
            [ <span {...edit("about.process.eyebrow")}>{eyebrow}</span> ]
          </p>
          <h2 className="ap-title type-display mt-3 text-[clamp(1.5rem,4vw,2.6rem)] leading-[1.15] text-steel-900 uppercase" {...edit("about.process.title")}>
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
                <span {...edit(`about.process.steps.${i}.tab`)}>{s.tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The panel takes whatever height the section has left, so a short
            laptop gets a shorter photograph rather than a panel running out
            through the bottom. */}
        <div
          ref={panelRef}
          className="ap-panel mt-6 grid items-center gap-8 rounded-3xl bg-surface p-5 ring-1 ring-steel-900/10 sm:p-7 lg:mt-[var(--ap-gap,1.5rem)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:items-stretch lg:gap-12 lg:p-[var(--ap-pad,2.25rem)]"
        >
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

        {/* Only where the wheel does something here: a mouse or trackpad. */}
        <p className="mt-3 hidden shrink-0 text-center text-[11px] tracking-[0.14em] text-steel-800/60 uppercase pointer-fine:block">
          Scroll on the card to see each stage · scroll beside it to move on
        </p>
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
        className="ap-in mt-3 font-display text-2xl leading-tight font-semibold text-steel-900 sm:text-3xl lg:mt-[var(--ap-lead,0.75rem)]"
        style={{ animationDelay: "60ms" }}
        {...edit(`about.process.steps.${index}.title`)}
      >
        {step.title}
      </h3>
      <p
        className="ap-in mt-4 max-w-md text-sm leading-relaxed text-steel-800 sm:text-base lg:mt-[var(--ap-body,1rem)]"
        style={{ animationDelay: "120ms" }}
        {...edit(`about.process.steps.${index}.body`)}
      >
        {step.body}
      </p>

      <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 lg:mt-[var(--ap-facts,1.75rem)]">
        {step.facts.map((fact, f) => (
          <div
            key={fact.label}
            className="ap-in"
            style={{ animationDelay: `${190 + f * 70}ms` }}
          >
            <dt
              className="text-[11px] tracking-[0.12em] text-steel-800/70 uppercase"
              {...edit(`about.process.steps.${index}.facts.${f}.label`)}
            >
              {fact.label}
            </dt>
            <dd
              className="mt-1 font-display text-lg font-semibold text-steel-900"
              {...edit(`about.process.steps.${index}.facts.${f}.value`)}
            >
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
              {...editImage(`about.process.steps.${i}.image`)}
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
