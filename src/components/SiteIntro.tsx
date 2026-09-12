"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** Total run before the page is handed over, in step with the CSS timeline. */
const RUN_MS = 3350;

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
 * opens from its centre underneath, and the curtain lifts into the page.
 *
 * Mounted by the landing page rather than the layout, so it belongs to that
 * page and plays on every load of it.
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
    window.setTimeout(() => setDone(true), 700);
  }, []);

  useEffect(() => {
    if (skip || done || leaving) return;

    /* Claimed as it starts, so a later client-side navigation back to the
       landing page does not replay it. */
    hasPlayedThisLoad = true;

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
      <div
        className="intro-lockup"
        style={
          {
            "--logo-w": LOGO.w,
            "--logo-h": LOGO.bottom - LOGO.top,
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
