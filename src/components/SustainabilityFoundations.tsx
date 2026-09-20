"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  foundations as defaultFoundations,
  foundationsHeading,
  type Foundation,
} from "@/lib/sustainability";

/**
 * Our Sustainability Foundations, after the reference's card row.
 *
 * A card is a tall photograph with its title set on the bottom of it and a
 * plus button in the corner. Opening one turns it into a panel: the
 * photograph shrinks to the top of the card and the paragraph and its link
 * take the space underneath.
 *
 * A card opens on hover, which is how the reference does it, and on click —
 * hover alone would leave the paragraphs unreachable on a touchscreen, where
 * the plus button is the only way in. Keyboard focus opens it too, for the
 * same reason.
 *
 * The row scrolls rather than wrapping: five cards do not divide into a grid
 * without a short last row, and scrolling is what the reference does with its
 * arrow. The arrows page it by one card; on a touchscreen the row is simply
 * swiped and they are hidden.
 */
export default function SustainabilityFoundations({
  heading = foundationsHeading,
  cards = defaultFoundations,
}: {
  heading?: typeof foundationsHeading;
  cards?: Foundation[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLUListElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
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
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Which arrows are live depends on where the rail is sitting. */
  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    setAtStart(rail.scrollLeft <= 2);
    setAtEnd(rail.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const page = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    /* One card plus the gap between them. */
    const step = (rail.firstElementChild as HTMLElement | null)?.clientWidth;
    rail.scrollBy({
      left: direction * ((step ?? 320) + 16),
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      id="foundations"
      className="news-band scroll-mt-28 px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p
              className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase"
              data-visible={visible}
            >
              [ {heading.eyebrow} ]
            </p>
            <h2
              className="hl-reveal type-display mt-4 text-[clamp(1.6rem,4.2vw,2.8rem)] leading-[1.15] text-steel-900 uppercase"
              data-visible={visible}
              style={{ animationDelay: "80ms" }}
            >
              {heading.title}
            </h2>
          </div>

          {/* Arrows are pointer affordances; the rail is swiped on touch. */}
          <div className="hidden shrink-0 gap-2 sm:flex">
            <RailButton
              direction="prev"
              disabled={atStart}
              onClick={() => page(-1)}
            />
            <RailButton
              direction="next"
              disabled={atEnd}
              onClick={() => page(1)}
            />
          </div>
        </div>

        <ul
          ref={railRef}
          onScroll={measure}
          className="news-rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:mt-14"
        >
          {cards.map((card, i) => (
            <li
              key={card.id}
              id={card.id}
              className="w-[74vw] shrink-0 snap-start sm:w-[19rem] lg:w-[21rem]"
            >
              <Card
                card={card}
                open={open === card.id}
                onOpen={() => setOpen(card.id)}
                onClose={() => setOpen((c) => (c === card.id ? null : c))}
                index={i}
                visible={visible}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Card({
  card,
  open,
  onOpen,
  onClose,
  index,
  visible,
}: {
  card: Foundation;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  index: number;
  visible: boolean;
}) {
  return (
    <article
      className={`hl-reveal group relative flex h-[26rem] flex-col overflow-hidden rounded-2xl transition-colors duration-500 ${
        open ? "news-ink" : "bg-steel-900"
      }`}
      data-visible={visible}
      style={{ animationDelay: `${160 + index * 90}ms` }}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocusCapture={onOpen}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          onClose();
      }}
    >
      {/* The photograph fills the card until it opens, then gives up the
          bottom half to the copy. */}
      <div
        className={`relative shrink-0 overflow-hidden transition-[height] duration-500 ease-out ${
          open ? "m-3 h-40 rounded-xl" : "h-full"
        }`}
      >
        <Image
          src={card.image}
          alt={card.alt}
          fill
          sizes="(min-width: 1024px) 21rem, (min-width: 640px) 19rem, 74vw"
          className="object-cover"
        />
        {!open ? (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>

      {/* Closed: the title sits on the photograph. Open: it heads the copy. */}
      <div
        className={`flex min-h-0 flex-1 flex-col px-5 pb-5 ${
          open ? "" : "absolute inset-x-0 bottom-0"
        }`}
      >
        <h3
          className={`font-display leading-snug font-light text-white ${
            open ? "text-lg" : "pr-12 text-lg"
          }`}
        >
          {card.title}
        </h3>

        {open ? (
          <>
            <p className="mt-3 text-[13px] leading-relaxed text-white/75">
              {card.body}
            </p>
            <Link
              href={card.href}
              className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-[10px] font-semibold tracking-[0.2em] text-accent uppercase hover:underline"
            >
              {card.linkLabel}
              <svg
                width="14"
                height="8"
                viewBox="0 0 14 8"
                fill="none"
                aria-hidden
              >
                <path
                  d="M0 4h12M9 1l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </>
        ) : null}
      </div>

      {/* The plus is the way in on a touchscreen, where there is no hover. */}
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? `Close ${card.title}` : `Open ${card.title}`}
        onClick={() => (open ? onClose() : onOpen())}
        className={`absolute right-4 bottom-5 grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full bg-accent text-steel-900 transition-transform duration-500 ${
          open ? "rotate-45" : ""
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path
            d="M6 1v10M1 6h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </article>
  );
}

function RailButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        direction === "next" ? "Next foundations" : "Previous foundations"
      }
      className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-steel-900/15 text-steel-900 transition-opacity hover:bg-white disabled:cursor-default disabled:opacity-30"
    >
      <svg
        width="16"
        height="10"
        viewBox="0 0 16 10"
        fill="none"
        aria-hidden
        className={direction === "prev" ? "rotate-180" : ""}
      >
        <path
          d="M0 5h14M10 1l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
