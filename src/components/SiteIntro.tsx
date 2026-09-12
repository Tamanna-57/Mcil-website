"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * The timeline, in step with the CSS. The letters fly in, the tagline opens
 * under them, and then the whole lockup travels to the header and parks on the
 * mark that lives there — so the logo is not dismissed, it is put away.
 */
const TAG_END = 2870; /* 1720ms delay + 1150ms, after 1700ms of arcs */
const DOCK_AT = TAG_END + 140; /* one beat of stillness first */
const DOCK_MS = 980; /* .intro-lockup's transition */
const GROUND_MS = 620; /* intro-ground-out */
const DISSOLVE_MS = 940; /* the cut-short exit, unchanged */

/*
 * Once per page load, and only on the landing page — the component is mounted
 * there, not in the layout, so the other routes never see it at all.
 *
 * A module-level flag rather than storage: a reload re-evaluates the module and
 * the sequence plays again, which is what a reload should do, while clicking
 * Home from another page does not replay it mid-session. It is only ever read
 * on the client — on the server this module is shared between requests, so the
 * server always renders the curtain and the client reconciles it away.
 */
let hasPlayedThisLoad = false;

/*
 * Where each piece of the logo sits inside mcil-logo.png, in the file's own
 * pixels — measured off its alpha channel, not eyeballed. The stage scales all
 * five by one unit (--u), so the pieces land in exactly the arrangement the
 * artwork has and the assembled lockup IS the logo, not a rebuild of it.
 *
 * Re-measure these if the logo file is ever replaced.
 */
const LOGO = { w: 2022, top: 178, bottom: 660 } as const;

type Piece = {
  id: string;
  /** Corner it flies in from — the angle its arc starts at. */
  corner: "tl" | "tr" | "bl" | "br";
  x: number;
  y: number;
  w: number;
  h: number;
};

const LETTERS: Piece[] = [
  { id: "m", corner: "tl", x: 408, y: 178, w: 442, h: 328 },
  { id: "c", corner: "tr", x: 852, y: 178, w: 343, h: 328 },
  { id: "i", corner: "bl", x: 1225, y: 178, w: 152, h: 328 },
  { id: "l", corner: "br", x: 1427, y: 178, w: 298, h: 328 },
];

const TAGLINE: Piece = {
  id: "tag",
  corner: "tl",
  x: 120,
  y: 542,
  w: 1779,
  h: 119,
};

/*
 * The four letters as one box, in the same artwork pixels — the union of the
 * LETTERS above, and exactly the crop the header mark takes (see .site-logo).
 * The dock maps this box onto that mark, not the whole lockup: the tagline is
 * not in the header, so it is not what has to line up.
 *
 * `y` is relative to LOGO.top, like the pieces' own --y.
 */
const LETTER_BOX = { x: 408, y: 0, w: 1317, h: 328 } as const;

/* Whether to skip the sequence entirely. Read through useSyncExternalStore
   rather than an effect: the server has no session to read, so it renders the
   curtain, and React reconciles the client's answer during hydration — before
   paint, so a returning visitor never sees a frame of it. */
const neverChanges = () => () => {};

function shouldSkip() {
  if (hasPlayedThisLoad) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const neverSkipOnServer = () => false;

/** A piece of the logo, windowed out of the one artwork file. */
function LogoPiece({ piece, className }: { piece: Piece; className: string }) {
  return (
    <span
      className={className}
      style={
        {
          "--x": piece.x,
          "--y": piece.y - LOGO.top,
          "--w": piece.w,
          "--h": piece.h,
          "--bx": piece.x,
          "--by": piece.y,
        } as React.CSSProperties
      }
      data-corner={piece.corner}
    />
  );
}

/**
 * The opening: M, C, I and L start in the four corners, each swings in along
 * its own arc — all four turning the same way, so the four arcs read as one
 * circle — and they close into the wordmark. METAL COATINGS (INDIA) LTD then
 * opens from its centre underneath.
 *
 * Then the lockup travels to the top-left and parks exactly on the header's
 * own mark, the tagline dropping away on the way since the header does not
 * carry it. The ground fades out from under a logo that is already sitting
 * where it lives, so the hand-over is a substitution the eye cannot catch
 * rather than a dissolve.
 *
 * Mounted by the landing page rather than the layout, so it belongs to that
 * page and plays on every load of it.
 */
export default function SiteIntro() {
  const storeSkip = useSyncExternalStore(
    neverChanges,
    shouldSkip,
    neverSkipOnServer,
  );
  const [done, setDone] = useState(false);
  /*
   *   run      — flying in, then the tagline
   *   dock     — travelling to the header mark
   *   handover — parked on it; the ground fades out from underneath
   *   dissolve — the old exit, for a run that was cut short before it docked
   */
  const [phase, setPhase] = useState<"run" | "dock" | "handover" | "dissolve">(
    "run",
  );
  const lockupRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  /* Once this instance is on its way out it keeps rendering until the exit is
     over, whatever the store now says. */
  const leaving = phase !== "run";
  const skip = storeSkip && !leaving;

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  /* Claimed as the run ends rather than as it starts: the store snapshot is
     re-read on every render, so flipping it mid-run would make the next render
     skip — which silently cut the exit before it drew a single frame. */
  const claim = () => {
    hasPlayedThisLoad = true;
  };

  /**
   * Measure the journey and hand it to CSS.
   *
   * The target is the header's own mark, read off the live DOM rather than
   * recomputed from the bar's padding — that padding is viewport-dependent, and
   * a second copy of the sum would be a second thing to keep right. Returns
   * false when there is no mark to aim at, which is the cue to fall back to the
   * dissolve rather than fly the logo somewhere arbitrary.
   */
  const measureDock = useCallback(() => {
    const lockup = lockupRef.current;
    const mark = document.querySelector<HTMLElement>(".site-logo");
    if (!lockup || !mark) return false;

    const from = lockup.getBoundingClientRect();
    const to = mark.getBoundingClientRect();
    if (!from.height || !to.height) return false;

    /* One artwork pixel, on screen, as the lockup is currently drawn. */
    const unit = from.height / (LOGO.bottom - LOGO.top);

    /* Where the four letters sit inside that box right now. */
    const lettersLeft = from.left + LETTER_BOX.x * unit;
    const lettersTop = from.top + LETTER_BOX.y * unit;

    /*
     * The lockup's transform-origin is set to the letters' own top-left corner
     * (see .intro-lockup), so scaling holds that corner still and the
     * translation is simply the gap between where it is and where it is going.
     */
    lockup.style.setProperty(
      "--dock-s",
      String(to.height / (LETTER_BOX.h * unit)),
    );
    lockup.style.setProperty("--dock-x", `${to.left - lettersLeft}px`);
    lockup.style.setProperty("--dock-y", `${to.top - lettersTop}px`);
    return true;
  }, []);

  /*
   * The whole run is scheduled once, on a ref rather than in this effect's
   * closure. Each phase change re-renders, and if the effect depended on the
   * phase its cleanup would cancel the timers still to fire — which left the
   * curtain parked on the header forever, having never handed over.
   */
  useEffect(() => {
    if (skip || done || started.current) return;
    started.current = true;

    /* The curtain covers the page, so the page must not scroll under it. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const release = () => {
      document.body.style.overflow = previous;
    };

    const handover = () => {
      claim();
      setPhase("handover");
      /* Held until the ground has gone; unmounting mid-fade would leave the
         curtain's colour snapping off the page. */
      later(() => {
        release();
        setDone(true);
      }, GROUND_MS);
    };

    const dissolve = () => {
      claim();
      setPhase("dissolve");
      later(() => {
        release();
        setDone(true);
      }, DISSOLVE_MS);
    };

    later(() => {
      if (!measureDock()) {
        dissolve();
        return;
      }
      setPhase("dock");
      later(handover, DOCK_MS);
    }, DOCK_AT);

    /*
     * Anyone who has seen it can cut it short. Before the dock there is nothing
     * lined up with the header yet, so that exit has to be the dissolve; once
     * the logo is on its way, jumping to the hand-over lands it.
     */
    const cut = () => {
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
      if (measureDock()) handover();
      else dissolve();
    };
    window.addEventListener("keydown", cut);
    window.addEventListener("pointerdown", cut);

    return () => {
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
      window.removeEventListener("keydown", cut);
      window.removeEventListener("pointerdown", cut);
      release();
    };
  }, [skip, done, measureDock, later]);

  if (skip || done) return null;

  return (
    <div className="intro" data-phase={phase} role="presentation">
      {/* The ground is its own layer so it can fade out on its own — the logo
          has to stay at full strength through the hand-over, and opacity on
          the curtain would take the logo with it. */}
      <div className="intro-ground" aria-hidden />

      <div
        ref={lockupRef}
        className="intro-lockup"
        style={
          {
            "--logo-w": LOGO.w,
            "--logo-h": LOGO.bottom - LOGO.top,
            "--letters-x": LETTER_BOX.x,
          } as React.CSSProperties
        }
      >
        {LETTERS.map((letter) => (
          <LogoPiece key={letter.id} piece={letter} className="intro-letter" />
        ))}
        <LogoPiece piece={TAGLINE} className="intro-tagline" />
      </div>

      <span className="sr-only">Metal Coatings (India) Ltd</span>
    </div>
  );
}
