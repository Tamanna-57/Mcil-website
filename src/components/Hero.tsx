"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HERO_SLIDE_DURATION,
  HERO_WORD_DURATION,
  heroSlides,
} from "@/lib/hero-slides";

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      if (next === current) return current;
      setOutgoing(current);
      return next;
    });
  }, []);

  /* Advance on a timer, but hold while the tab is in the background so a
     viewer coming back does not land mid-crossfade. */
  useEffect(() => {
    if (document.hidden) return;
    const timer = window.setTimeout(
      () => goTo((index + 1) % heroSlides.length),
      HERO_SLIDE_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [index, goTo]);

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) setIndex((i) => i);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* Clear the outgoing word once its roll-out has finished. */
  useEffect(() => {
    if (outgoing === null) return;
    const timer = window.setTimeout(
      () => setOutgoing(null),
      HERO_WORD_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [outgoing]);

  /* Restart the push-in on whichever plate just became active, without
     remounting the <Image> (which would re-trigger a decode and flash). */
  useEffect(() => {
    const plate = plateRefs.current[index];
    if (!plate) return;
    for (const animation of plate.getAnimations()) {
      animation.currentTime = 0;
      animation.play();
    }
  }, [index]);

  const active = heroSlides[index];

  return (
    <section
      className="relative isolate h-[100svh] min-h-[560px] w-full overflow-hidden bg-steel-900"
      aria-roledescription="carousel"
      aria-label="MCIL capabilities"
    >
      {/* Background plates — all mounted, crossfaded by opacity. */}
      {heroSlides.map((slide, i) => (
        <div
          key={slide.image}
          className="absolute inset-0 transition-opacity ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: "var(--hero-fade-duration)",
          }}
          aria-hidden={i !== index}
        >
          <div
            ref={(el) => {
              plateRefs.current[i] = el;
            }}
            className="hero-plate absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.position }}
            />
          </div>
        </div>
      ))}

      {/* Legibility scrim: heavier at the bottom-left where the wordmark sits. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/45 to-black/15"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/45"
        aria-hidden
      />

      {/* Wordmark */}
      <div className="relative z-10 flex h-full items-center">
        <div className="hero-rise w-full px-6 sm:px-10 lg:px-[6.5vw]">
          <h1 className="hero-headline font-display leading-[1.05] text-white uppercase">
            {/* The wordmark never breaks; only the sector word may drop to
                its own line on narrow viewports. */}
            <span className="hero-wordmark">
              <span className="font-light">Metal</span>{" "}
              <span className="hero-highlight relative inline-block font-light">
                <span className="relative z-10">Coatings India</span>
              </span>
              <span className="mx-[0.3em] font-light text-white/85 max-lg:hidden">
                |
              </span>
            </span>
            <span className="relative inline-block align-baseline">
              {outgoing !== null && (
                <span
                  key={`out-${outgoing}`}
                  className="hero-word hero-word-out absolute top-0 left-0 font-extrabold whitespace-nowrap"
                  aria-hidden
                >
                  {heroSlides[outgoing].sector}
                </span>
              )}
              <span
                key={`in-${index}`}
                className="hero-word hero-word-in font-extrabold whitespace-nowrap"
              >
                {active.sector}
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Cold rolled and HRPO steel strips engineered for auto components,
            white goods, electrical equipment and power transmission.
          </p>

          {/* Slide indicators — thin rules that fill over the slide duration. */}
          <div
            className="mt-10 flex items-center gap-3"
            role="tablist"
            aria-label="Choose a capability"
          >
            {heroSlides.map((slide, i) => (
              <button
                key={slide.image}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={slide.sector}
                onClick={() => goTo(i)}
                className="group h-6 w-12 cursor-pointer sm:w-16"
              >
                <span className="relative block h-px w-full bg-white/30 transition-colors group-hover:bg-white/60">
                  {i === index && (
                    <span
                      key={`fill-${index}`}
                      className="hero-indicator absolute inset-y-0 left-0 block bg-white"
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Announce the active slide without duplicating the visual text. */}
      <p className="sr-only" aria-live="polite">
        {active.sector}
      </p>

      <a
        href="#about"
        className="hero-scroll-cue absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 text-white/70 transition-colors hover:text-white md:block"
        aria-label="Scroll to content"
      >
        <svg
          width="22"
          height="34"
          viewBox="0 0 22 34"
          fill="none"
          aria-hidden
          className="stroke-current"
        >
          <rect x="1" y="1" width="20" height="32" rx="10" strokeWidth="1.4" />
          <path d="M11 9v6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </a>
    </section>
  );
}
