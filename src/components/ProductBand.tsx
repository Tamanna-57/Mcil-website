"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Product, ProductPlate } from "@/lib/products";

/**
 * One product band, in the two layouts of the reference.
 *
 * Geometry is taken off the reference at percentages of the block, so the
 * composition holds at every width: on the wordmark layout the photograph sits
 * low and centre-right, overlapping the giant name behind it; on the gallery
 * layout four plates of different heights hang from one top line, the third
 * lapping over the second.
 *
 * Below `lg` the absolute positioning is dropped — the plates stack, since at
 * phone width the reference's overlaps collapse into an unreadable pile.
 *
 * A plate carrying a second photograph wipes between the two as the cursor
 * crosses the band; see `useCursorWipe`.
 */
/**
 * Holds an element blank until it is genuinely on screen, once.
 *
 * `rootMargin` pulls the trigger line up off the bottom of the viewport, so an
 * element that happens to be poking into view on first paint still waits to be
 * scrolled onto properly — which is the whole point of the plates: they are
 * not there, and then they arrive.
 */
function useReveal<T extends HTMLElement>(threshold: number, lift = "-12%") {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: `0px 0px ${lift} 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, lift]);

  return [ref, visible] as const;
}

/** Where the wipe sits before the cursor has said otherwise: dead centre. */
const WIPE_REST = 50;

/** How much of the gap to the cursor is closed each frame. Low enough that
    the divider trails the pointer rather than snapping to it. */
const WIPE_EASE = 0.14;

/**
 * Drives a plate's wipe off the cursor.
 *
 * The divider takes the pointer's x — measured across the plate and clamped to
 * it, so the wipe still runs to its ends when the cursor passes above or below
 * the plate rather than through it — and the second photograph is clipped to
 * everything left of that divider. Each frame closes part of the gap to the
 * cursor instead of jumping, which is what makes the photograph read as
 * sliding across rather than following the mouse.
 *
 * Positions are written straight to the nodes. A wipe that ran through state
 * would re-render the band on every pointer event, which at this size is a
 * dropped frame on the plates either side of it.
 *
 * `active` stays false where the wipe has nothing to drive it — a touch
 * screen, or a reader who has asked for less motion — and the plate is left
 * showing its own photograph, undivided.
 */
function useCursorWipe(enabled: boolean) {
  const revealRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const chevronRef = useRef<SVGSVGElement | null>(null);
  const [active, setActive] = useState(false);

  /* Whether there is a cursor to follow at all is settled first, and on its
     own frame: the plate renders undivided on the server, where nothing can
     be known about the pointer, and takes the divider on from there. */
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !window.matchMedia) return;

    const cursor = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!cursor.matches || still.matches) return;

    const frame = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  useEffect(() => {
    if (!active) return;

    let target = WIPE_REST;
    let at = WIPE_REST;
    let frame = 0;

    const paint = () => {
      at += (target - at) * WIPE_EASE;
      if (Math.abs(target - at) < 0.05) at = target;

      if (revealRef.current) {
        revealRef.current.style.clipPath = `inset(0 ${100 - at}% 0 0)`;
      }
      if (lineRef.current) lineRef.current.style.left = `${at}%`;
      /* The chevron points at whichever side still has the most to give. */
      if (chevronRef.current) {
        chevronRef.current.style.transform =
          at > 50 ? "scaleX(-1)" : "scaleX(1)";
      }

      frame = at === target ? 0 : requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      const box = revealRef.current?.parentElement;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      if (!rect.width) return;

      const across = ((event.clientX - rect.left) / rect.width) * 100;
      target = Math.min(100, Math.max(0, across));
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [active]);

  return { active, revealRef, lineRef, chevronRef };
}

export default function ProductBand({
  product,
  divider,
}: {
  product: Product;
  /** The hairline above the band. Carried by every band after the first. */
  divider?: boolean;
}) {
  /* The heading and paragraph ride the band; each plate waits for itself. */
  const [sectionRef, visible] = useReveal<HTMLElement>(0.12, "0px");

  return (
    <section
      ref={sectionRef}
      id={product.id}
      className="scroll-mt-[var(--header-h)] bg-background px-6 py-16 sm:px-10 lg:px-[6.5vw] lg:py-20"
    >
      <div className="mx-auto w-full max-w-6xl">
        {divider && (
          <div
            className="pb-rise mb-10 h-px w-full bg-steel-900/15 lg:mb-14"
            data-visible={visible}
            aria-hidden
          />
        )}

        {/* Name and paragraph both hang off the container's own left edge,
            over the first half of the grid, so every band on the page reads
            from the same margin the page head is set to. */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h2
              className="pb-rise text-[clamp(1.5rem,4.6vw,2.5rem)] leading-[1.05] font-extrabold tracking-[-0.01em] text-steel-900 uppercase"
              data-visible={visible}
            >
              {product.name}
            </h2>
            <p
              className="pb-rise mt-6 max-w-[34rem] text-[clamp(1.05rem,2.1vw,1.45rem)] leading-[1.35] text-steel-800"
              data-visible={visible}
              style={{ animationDelay: "110ms" }}
            >
              <Body text={product.body} />
            </p>
          </div>
          <div className="hidden lg:block" aria-hidden />
        </div>

        <div className="mt-12 lg:mt-16">
          {product.layout === "wordmark" ? (
            <WordmarkBlock product={product} visible={visible} />
          ) : (
            <GalleryRow product={product} />
          )}
        </div>
      </div>
    </section>
  );
}

/** Underlines the braced span, the way the reference underlines its subject. */
function Body({ text }: { text: string }) {
  const parts = text.split(/\{([^}]*)\}/);
  return (
    <>
      {parts.map((part, i) =>
        /* Odd indices are what sat inside the braces. */
        i % 2 === 1 ? (
          <span
            key={i}
            className="underline decoration-steel-900/45 decoration-2 underline-offset-[5px]"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * The giant name across a deep plate, with one photograph inset low and
 * centre-right so it laps over the name's tail. Reference proportions:
 * block 2.6:1, photograph at 25% from the top, 25% from the left, half the
 * block wide, three-quarters of it tall.
 */
function WordmarkBlock({
  product,
  visible,
}: {
  product: Product;
  visible: boolean;
}) {
  return (
    <div
      className="pb-rise relative overflow-hidden rounded-2xl bg-steel-900 px-6 pt-8 pb-6 lg:aspect-[2.6/1] lg:p-0"
      data-visible={visible}
      style={{ animationDelay: "200ms" }}
    >
      {/*
        Set on the left and sized to reach about the middle of the block, as
        the reference sets its own: the photograph is meant to cut across the
        back of it, which only reads if the word ends behind the photograph
        rather than running out past it.

        Tight tracking and a slight horizontal squeeze bring Montserrat's
        extrabold closer to the condensed face the reference uses; the squeeze
        is anchored left so the word grows in from its own edge.
      */}
      <span
        className="pb-wordmark block origin-left scale-x-[0.94] text-[clamp(2.2rem,6.4vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.055em] whitespace-nowrap text-accent lg:absolute lg:top-[11%] lg:left-[4.1%]"
        aria-hidden
      >
        {product.wordmark}
      </span>

      <div className="mt-6 lg:absolute lg:top-[25%] lg:left-[25.4%] lg:mt-0 lg:h-[74%] lg:w-[49.2%]">
        <Plate
          plate={product.plate}
          pop
          /* Its own ratio in flow on a phone; filling the box it is given
             once the block goes absolute at lg. */
          className="aspect-[16/9] w-full lg:aspect-auto lg:h-full"
          sizes="(min-width: 1024px) 45vw, 90vw"
        />
      </div>
    </div>
  );
}

/**
 * Three plates hung from one top line at the reference's widths and heights.
 * Percentages are of the row, whose own ratio comes from the reference
 * (1203 x 345).
 *
 * Nothing laps over anything: the centre plate is the one that wipes, and a
 * plate showing through beside it would put a third photograph in a block
 * that is meant to hold two.
 */
const GALLERY_GEOMETRY = [
  { left: "0%", width: "23%", height: "61.7%" },
  { left: "25.9%", width: "40%", height: "100%" },
  { left: "68.4%", width: "31.6%", height: "95.7%" },
] as const;

function GalleryRow({ product }: { product: Product }) {
  const plates = product.plates ?? [];

  return (
    <>
      {/* Stacked on small screens: the reference's overlaps are unreadable
          once the row is narrower than about three plates wide. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
        {plates.map((plate, i) => (
          <Plate
            key={plate.alt}
            plate={plate}
            className={i === 2 ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]"}
            sizes={i === 2 ? "92vw" : "45vw"}
            delay={200 + i * 90}
          />
        ))}
      </div>

      <div className="relative hidden aspect-[1203/345] w-full lg:block">
        {plates.map((plate, i) => {
          const box = GALLERY_GEOMETRY[i];
          if (!box) return null;
          return (
            <div
              key={plate.alt}
              className="absolute top-0"
              style={{ left: box.left, width: box.width, height: box.height }}
            >
              <Plate
                plate={plate}
                className="h-full"
                sizes="35vw"
                delay={200 + i * 110}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

const TONES = {
  navy: "bg-steel-900",
  accent: "bg-accent",
  pale: "bg-brand-pale",
} as const;

/**
 * A single plate. With a `src` it holds the photograph; without one it holds a
 * frame naming the shot that belongs in the slot.
 */
function Plate({
  plate,
  className = "",
  sizes,
  pop = false,
  delay = 260,
}: {
  plate?: ProductPlate;
  /** Carries the plate's sizing — a ratio in flow, or h-full in a fixed box. */
  className?: string;
  sizes: string;
  /** The reference's inset photograph arrives with a little overshoot. */
  pop?: boolean;
  delay?: number;
}) {
  /* A third of the plate has to be past the trigger line before it lands, so
     it is still blank when the band's heading is read. */
  const [ref, visible] = useReveal<HTMLDivElement>(0.34);

  /* Nothing listens for the cursor until the plate has actually arrived. */
  const compare = plate?.compare && plate.src ? plate.compare : undefined;
  const { active, revealRef, lineRef, chevronRef } = useCursorWipe(
    Boolean(compare) && visible,
  );

  if (!plate) return null;

  return (
    <div
      ref={ref}
      className={`${pop ? "pb-pop" : "pb-rise"} relative overflow-hidden rounded-xl ${TONES[plate.tone]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      data-visible={visible}
    >
      {plate.src ? (
        <Image
          src={plate.src}
          alt={plate.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <Placeholder plate={plate} />
      )}

      {compare && (
        <>
          {/*
            Clipped to nothing until the wipe says otherwise, so a plate that
            never gets a cursor — a phone, or reduced motion — renders as the
            single photograph above rather than as half of each. From there
            the hook writes the clip itself.
          */}
          <div
            ref={revealRef}
            className="absolute inset-0"
            style={{
              clipPath: active
                ? `inset(0 ${100 - WIPE_REST}% 0 0)`
                : "inset(0 100% 0 0)",
            }}
            /* Kept off the accessible tree while there is no wipe to bring it
               into view, so a reader is never given a photograph that nobody
               on that device can be shown. */
            aria-hidden={!active}
          >
            <Image
              src={compare.src}
              alt={compare.alt}
              fill
              sizes={sizes}
              className="object-cover"
            />
          </div>

          {active && (
            <div
              ref={lineRef}
              className="pointer-events-none absolute inset-y-0 z-10 w-[2px] -translate-x-1/2 bg-accent"
              style={{ left: `${WIPE_REST}%` }}
              aria-hidden
            >
              <span className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <svg
                  ref={chevronRef}
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-white [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.45))]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * What goes in the slot, said plainly, inside a hairline frame.
 */
function Placeholder({ plate }: { plate: ProductPlate }) {
  const onDark = plate.tone === "navy" || plate.tone === "accent";

  return (
    <div
      className={`absolute inset-2 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center sm:inset-3 ${
        onDark ? "border-white/35" : "border-steel-900/25"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-6 w-6 shrink-0 sm:h-7 sm:w-7 ${onDark ? "text-white/70" : "text-steel-900/45"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.4" />
        <path d="m4 16.5 4.5-4 3.5 3 3-2.5 5 4" />
      </svg>
      <p
        className={`text-[10px] leading-snug tracking-[0.03em] sm:text-[11px] ${
          onDark ? "text-white/75" : "text-steel-800/80"
        }`}
      >
        {plate.alt}
      </p>
    </div>
  );
}
