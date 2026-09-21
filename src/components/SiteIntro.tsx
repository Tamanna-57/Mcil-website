"use client";

import {
  useCallback,
  useEffect,
  useId,
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
 * The mark's own pixels. The stage scales everything by one unit (--u), so a
 * coordinate written here is the coordinate the artwork has, and what forms on
 * screen IS the logo rather than a rebuild of it.
 *
 * Re-measure if public/images/mcil-mark.png is ever replaced.
 */
const MARK = { w: 390, h: 320 } as const;

type Ring = {
  id: string;
  /** The edge its stroke rides in from. */
  side: "top" | "left" | "right";
  /** The ring's centre and the radius the sweep is drawn at, in mark pixels. */
  cx: number;
  cy: number;
  r: number;
  /** Wide enough to cover the whole band of the ring it uncovers. */
  width: number;
  /**
   * Degrees the sweep's start is turned to, from three o'clock clockwise: the
   * point on the ring where its stroke arrives, so the arc carries on from
   * exactly where the line stopped.
   */
  from: number;
};

/*
 * The three rings, measured off the artwork's own alpha.
 *
 * Each centre and radius was read from where the opaque pixels actually run
 * (rows and columns sampled across the file, then solved for the circle that
 * fits them), not eyeballed: the sweep has to sit on the band it is
 * uncovering, or it wipes past the stroke instead of drawing it.
 *
 * `width` is generous on purpose. A mask only ever reveals, so a stroke wider
 * than the band costs nothing — it uncovers transparent artwork either side —
 * while one a little too narrow leaves a hairline of the ring behind.
 */
const RINGS: Ring[] = [
  { id: "top", side: "top", cx: 193, cy: 116, r: 98, width: 52, from: -90 },
  { id: "left", side: "left", cx: 96, cy: 218, r: 80, width: 48, from: 180 },
  { id: "right", side: "right", cx: 294, cy: 218, r: 79, width: 48, from: 0 },
];

/**
 * Where each stroke rides in along, and where it stops.
 *
 * Each is a long bar, as long again as the mark's own radius, so what crosses
 * the screen reads as a line travelling rather than a dash appearing. Each one
 * stops with its leading end *on the band of its ring* — not at the ring's
 * centre, which would bury it inside the shape — so the sweep that takes over
 * carries on from the end of the line rather than somewhere near it.
 */
const RUNNERS = [
  /* Down the vertical rail onto the crown of the big ring. */
  { id: "top", axis: "v", x: 176, y: -120, w: 34, h: 140 },
  /* In along the horizontal rail onto the outer edge of each lower ring. */
  { id: "left", axis: "h", x: -110, y: 201, w: 140, h: 34 },
  { id: "right", axis: "h", x: 356, y: 201, w: 140, h: 34 },
  /* And up onto the wedge, the one piece that is not a ring. */
  { id: "wedge", axis: "v", x: 179, y: 236, w: 34, h: 124 },
] as const;

/**
 * The hairlines the strokes ride in on.
 *
 * They run the width and height of the screen rather than of the mark: what
 * they are for is the moment before anything has arrived, where the eye is
 * given the paths first and the lines then travel down them. Each is placed on
 * a landing point — the two rings share a centre line at y=218, the top ring
 * and the wedge share one at x≈193 — so a line and the stroke that rides it
 * are the same line.
 */
const RAILS = [
  { id: "h-rings", axis: "h", at: 218 },
  { id: "h-top", axis: "h", at: 116 },
  { id: "v-mark", axis: "v", at: 193 },
] as const;

/** One turn of a circle of radius r, for the dash the sweep is drawn with. */
const circumference = (r: number) => 2 * Math.PI * r;

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

/**
 * The mark, uncovered by a stroke travelling round each ring.
 *
 * The artwork is the artwork — one `<image>`, the same file the header uses.
 * What moves is a mask over it: three circles, each stroked wide enough to
 * cover its ring's band, each drawn on with `stroke-dashoffset`. Where the
 * stroke has been, the logo shows; where it has not, there is nothing yet. So
 * the line does not become the logo by turning into it, it uncovers it, and
 * what is left at the end is the file itself rather than an approximation of
 * it drawn in arcs.
 *
 * The wedge between the rings has no arc of its own — it is a triangle, not a
 * turn — so it takes a rectangle of mask that opens once its own stroke has
 * arrived under it.
 */
function LogoDraw({ maskId }: { maskId: string }) {
  return (
    <svg
      className="intro-draw"
      viewBox={`0 0 ${MARK.w} ${MARK.h}`}
      aria-hidden
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={MARK.w}
          height={MARK.h}
        >
          {RINGS.map((ring) => (
            <circle
              key={ring.id}
              className="intro-arc"
              data-ring={ring.id}
              cx={ring.cx}
              cy={ring.cy}
              r={ring.r}
              strokeWidth={ring.width}
              /* The turn is an attribute rather than a CSS transform: the
                 sweep animates stroke-dashoffset, and a transform in the
                 cascade here would be one more thing to keep out of its way. */
              transform={`rotate(${ring.from} ${ring.cx} ${ring.cy})`}
              style={
                { "--dash": circumference(ring.r).toFixed(1) } as React.CSSProperties
              }
            />
          ))}
          <rect
            className="intro-wedge-mask"
            x="164"
            y="232"
            width="66"
            height="92"
          />
        </mask>
      </defs>

      <image
        href="/images/mcil-mark.png"
        width={MARK.w}
        height={MARK.h}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

/**
 * The opening: the mark's four shapes come in from the four sides, each along
 * its own edge, and close into the monogram. METAL COATINGS (INDIA) LTD then
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
  /* The mask is referenced by id, and an id has to be the same string on the
     server as on the client or the reference dangles through hydration. */
  const maskId = useId();
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

    /*
     * The lockup box IS the mark — the name under it is positioned out of
     * flow, so it neither pads this box nor has to be subtracted from it. With
     * transform-origin at the box's own top-left (see .intro-lockup), scaling
     * holds that corner still and the translation is simply the gap between
     * where it is and where it is going.
     */
    lockup.style.setProperty("--dock-s", String(to.height / from.height));
    lockup.style.setProperty("--dock-x", `${to.left - from.left}px`);
    lockup.style.setProperty("--dock-y", `${to.top - from.top}px`);
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
            "--logo-w": MARK.w,
            "--logo-h": MARK.h,
          } as React.CSSProperties
        }
      >
        {/* The rails and the strokes that ride them are outside the turn:
            they travel straight, as they do in the reference, and it is the
            mark they have just met in the middle that revolves. Inside the
            turn there is only the artwork and the sweeps uncovering it. */}
        {RAILS.map((rail) => (
          <span
            key={rail.id}
            className="intro-rail"
            data-axis={rail.axis}
            data-rail={rail.id}
            style={{ "--at": rail.at } as React.CSSProperties}
            aria-hidden
          />
        ))}

        {RUNNERS.map((runner) => (
          <span
            key={runner.id}
            className="intro-runner"
            data-runner={runner.id}
            data-axis={runner.axis}
            style={
              {
                "--x": runner.x,
                "--y": runner.y,
                "--w": runner.w,
                "--h": runner.h,
              } as React.CSSProperties
            }
            aria-hidden
          />
        ))}

        {/* One turn of the whole mark, starting the moment the strokes land
            and ending square — which is both what the reference does and what
            lets the dock measure the lockup afterwards without allowing for a
            tilt. */}
        <span className="intro-mark" aria-hidden>
          <LogoDraw maskId={maskId} />
        </span>
        {/* Real type, as in the header — the name is not part of the mark's
            artwork, so it is set rather than cropped. */}
        <span className="intro-tagline" aria-hidden>
          Metal Coatings (India) Ltd
        </span>
      </div>

      <span className="sr-only">Metal Coatings (India) Ltd</span>
    </div>
  );
}
