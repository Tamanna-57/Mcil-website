"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/* Once per tab. Someone who lands on /about from a link and then clicks
   through to /contact should not sit through it twice. */
const SEEN_KEY = "mcil-intro-seen";

/** Total run before the page is handed over, in step with the CSS timeline. */
const RUN_MS = 3500;

/* Whether to skip the sequence entirely. Read through useSyncExternalStore
   rather than an effect: the server has no session to read, so it renders the
   curtain, and React reconciles the client's answer during hydration — before
   paint, so a returning visitor never sees a frame of it. */
const neverChanges = () => () => {};

function shouldSkip() {
  try {
    if (sessionStorage.getItem(SEEN_KEY) !== null) return true;
  } catch {
    /* Private mode: nothing is remembered, so let it play. */
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const neverSkipOnServer = () => false;

/**
 * The opening: four strips arrive from the four sides, close into a coil, the
 * coil turns, and the MCIL logo resolves underneath before the site comes
 * through.
 */
export default function SiteIntro() {
  const skip = useSyncExternalStore(
    neverChanges,
    shouldSkip,
    neverSkipOnServer,
  );
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    setLeaving(true);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* Nothing to do — it simply plays again next time. */
    }
    window.setTimeout(() => setDone(true), 700);
  }, []);

  useEffect(() => {
    if (skip || done || leaving) return;

    /* The curtain covers the page, so the page must not scroll under it. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(finish, RUN_MS);
    /* Anyone who has seen it can cut it short. */
    const cut = () => finish();
    window.addEventListener("keydown", cut);
    window.addEventListener("pointerdown", cut);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", cut);
      window.removeEventListener("pointerdown", cut);
      document.body.style.overflow = previous;
    };
  }, [skip, done, leaving, finish]);

  if (skip || done) return null;

  return (
    <div className="intro" data-leaving={leaving} role="presentation">
      <div className="intro-stage">
        <svg
          className="intro-mark"
          viewBox="0 0 128 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          aria-hidden
        >
          {/* One coil in four wraps, each entering from the side it forms.
              The wraps stop short of each other: the four gaps are what make
              the turn legible — a closed ring is radially symmetric and would
              look still however fast it span. */}
          <path
            className="intro-arc intro-arc--n"
            d="M64.6 16.2A44 44 0 0 1 103.8 55.4"
          />
          <path
            className="intro-arc intro-arc--e"
            d="M103.8 64.6A44 44 0 0 1 64.6 103.8"
          />
          <path
            className="intro-arc intro-arc--s"
            d="M55.4 103.8A44 44 0 0 1 16.2 64.6"
          />
          <path
            className="intro-arc intro-arc--w"
            d="M16.2 55.4A44 44 0 0 1 55.4 16.2"
          />
          {/* A second wrap inside the first — one ring reads as a target,
              two read as strip wound on itself. Its gaps sit off the outer
              ones so the two turn against each other. */}
          <circle
            className="intro-wrap"
            cx="60"
            cy="60"
            r="29"
            strokeWidth="8"
          />
          {/* The eye of the coil, and the strip end feeding out of it. */}
          <circle
            className="intro-eye"
            cx="60"
            cy="60"
            r="11"
            strokeWidth="7"
          />
          <path className="intro-tail" d="M104 60h14" />
        </svg>

        <Image
          className="intro-logo"
          src="/images/mcil-logo.png"
          alt="Metal Coatings (India) Ltd"
          width={2022}
          height={778}
          priority
        />
      </div>
    </div>
  );
}
