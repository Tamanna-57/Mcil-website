"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { team, teamHeading, type TeamMember } from "@/lib/about-team";

/**
 * Which column each portrait takes once the wall is four across.
 *
 * The reference does not pack its photographs: they hang on a plain grid with
 * cells deliberately left empty, so the wall reads as placed rather than as a
 * block. Naming a column and leaving the row to find itself does that — a
 * portrait whose column is at or behind the one before it drops to the next
 * row, and the cells skipped on the way stay empty. The sequence repeats, so a
 * board that gains or loses a seat scatters the same way.
 *
 * The holes it leaves are spread rather than clustered — no row loses two
 * neighbouring cells — because two empty cells side by side stop reading as
 * rhythm and start reading as a gap someone forgot to fill.
 */
const SCATTER = [1, 3, 4, 2, 4, 1, 3] as const;

/* Written out in full because the stylesheet is built by reading these files;
   a class assembled from pieces at runtime would not be there to apply. */
const COL_START = [
  "",
  "md:col-start-1",
  "md:col-start-2",
  "md:col-start-3",
  "md:col-start-4",
] as const;

const DEFAULT_FOOTNOTE =
  "Board of Directors and Key Managerial Personnel as listed in the FY2025-26 annual report.";

/**
 * The team section: a rail, a wall of portraits, and one panel that reads.
 *
 * The section label is set down the left edge rather than over the top, the
 * seven portraits hang in a grid with each name and seat under its own
 * photograph, and the panel on the right carries whichever person the pointer
 * is on — their seat, and what they bring to it.
 *
 * Hover is not the only way in. The portraits are buttons, so the panel also
 * follows the keyboard and answers a tap, which is what carries the section on
 * a phone, where there is no pointer to hover with and the panel sits under the
 * grid instead of beside it.
 */
export default function AboutTeam({
  heading = teamHeading,
  members = team,
  footnote = DEFAULT_FOOTNOTE,
}: {
  heading?: { eyebrow: string; title: string; standfirst: string };
  members?: TeamMember[];
  footnote?: string;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  /* Held back until the section arrives, so the wall builds as you reach it
     rather than having already happened by the time you scroll to it. */
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

  /* The panel is never empty: it opens on the first person and stays on the
     last one the pointer left, rather than blanking when it moves away. An id
     that no longer exists — a person deleted in the admin panel while the id
     was held — falls back to the first, so the panel cannot end up on nobody. */
  const [readingId, setReadingId] = useState<string | null>(null);
  const reading = members.find((m) => m.id === readingId) ?? members[0];

  /* Where there is no pointer the panel is under the wall rather than beside
     it, so a tap on the top row would otherwise change something the reader
     cannot see. Only a tap does this: a hover already has the panel in view,
     and moving the page under a pointer that is only passing across the wall
     would be the wrong thing entirely. */
  const panelRef = useRef<HTMLElement | null>(null);

  function follow() {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (!window.matchMedia("(hover: none)").matches) return;
    panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  if (members.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="team"
      className="team-band scroll-mt-[var(--header-h)] px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-2xl">
          {/* The rail down the left is the section's title at desktop width,
              so the heading is carried for structure rather than set: a
              section with no heading at all is a hole in the page's outline,
              and a screen reader has no rail to read. There is no rail on a
              phone, so the label goes back over the top there. */}
          <h2 className="sr-only">{heading.title}</h2>
          <p
            className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase lg:hidden"
            data-visible={visible}
          >
            [ {heading.eyebrow} ]
          </p>
          {/* Deliberately quiet: it is a note on who runs the company, not a
              headline standing in for the one just removed. */}
          <p
            className="hl-reveal mt-4 text-[13px] leading-relaxed text-steel-800/85 sm:mt-0 sm:text-sm"
            data-visible={visible}
            style={{ animationDelay: "160ms" }}
          >
            {heading.standfirst}
          </p>
        </header>

        {/* Rail, wall, panel. The rail is only as wide as the type set down it
            and the panel is held to a readable measure, so the wall takes
            whatever is left. */}
        <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[2.5rem_minmax(0,1fr)_20rem] lg:items-start lg:gap-8 xl:grid-cols-[2.5rem_minmax(0,1fr)_22rem] xl:gap-10">
          <Rail label={heading.eyebrow} visible={visible} />

          {/* Four across from `md`, rather than three held wider: the
              portraits are small files, and a column much past 200px asks
              them for detail they do not have. Below `md` there are too few
              columns for cells to be spared, so the scatter is dropped and
              the portraits simply run. */}
          <ul className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 md:gap-x-7 md:gap-y-10">
            {members.map((member, i) => (
              <li
                key={member.id}
                className={COL_START[SCATTER[i % SCATTER.length]]}
              >
                <Portrait
                  member={member}
                  index={i}
                  visible={visible}
                  reading={member.id === reading.id}
                  onRead={() => setReadingId(member.id)}
                  onTap={follow}
                />
              </li>
            ))}
          </ul>

          <Panel
            ref={panelRef}
            member={reading}
            visible={visible}
            count={members.length}
          />
        </div>

        <p
          className="hl-reveal mt-12 text-xs text-steel-800/70"
          data-visible={visible}
          style={{ animationDelay: "900ms" }}
        >
          {footnote}
        </p>
      </div>
    </section>
  );
}

/**
 * The section label, set down the left edge.
 *
 * `vertical-rl` turns the line on its side reading downward; the half turn puts
 * it back the other way, so it climbs the rail from the bottom — which is the
 * way a spine is read, and the way the eye arrives at the grid beside it. The
 * hairline under it carries the column down to the foot of the wall.
 */
function Rail({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      className="hl-reveal hidden lg:flex lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:h-[18rem] lg:flex-col lg:items-center lg:gap-4"
      data-visible={visible}
      aria-hidden
    >
      <span className="text-[11px] font-semibold tracking-[0.34em] text-accent uppercase [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
      <span className="w-px flex-1 bg-steel-900/15" />
    </div>
  );
}

/**
 * One portrait, with the person's name and seat set under it.
 *
 * It is a button because it does something — it moves the panel — and because
 * a button is reachable without a pointer: the panel follows the keyboard
 * through the wall, and a tap does what a hover does. `pointerenter` rather
 * than `mouseenter` so a stylus behaves like a mouse.
 */
function Portrait({
  member,
  index,
  visible,
  reading,
  onRead,
  onTap,
}: {
  member: TeamMember;
  index: number;
  visible: boolean;
  /** This is the one the panel is showing. */
  reading: boolean;
  onRead: () => void;
  /** Run after a tap, once the panel holds this person. */
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onPointerEnter={onRead}
      onFocus={onRead}
      onClick={() => {
        onRead();
        onTap();
      }}
      aria-pressed={reading}
      className="hl-reveal group block w-full cursor-pointer text-left"
      data-visible={visible}
      style={{ animationDelay: `${240 + index * 70}ms` }}
    >
      <span
        className={`relative block aspect-[3/4] overflow-hidden rounded-lg bg-steel-900 outline-offset-2 transition duration-300 group-focus-visible:outline-2 group-focus-visible:outline-accent ${
          reading ? "" : "opacity-65"
        }`}
      >
        <Image
          src={member.image}
          alt={`Portrait of ${member.name}`}
          fill
          sizes="(min-width: 1024px) 17vw, (min-width: 768px) 23vw, (min-width: 640px) 30vw, 44vw"
          className={`object-cover transition duration-500 ${
            reading ? "scale-[1.03]" : "group-hover:scale-[1.03]"
          }`}
        />
        {/* The one being read is marked on the photograph itself, so the tie
            between a portrait and the panel is visible without the pointer
            having to be the thing that says so. */}
        <span
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-accent transition-transform duration-300 ${
            reading ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </span>

      <span
        className={`mt-3 block font-display text-[13px] leading-snug font-semibold transition-colors ${
          reading ? "text-steel-900" : "text-steel-900/70"
        }`}
      >
        {member.name}
      </span>
      <span
        className={`mt-1 block text-[9.5px] leading-[1.45] font-semibold tracking-[0.13em] uppercase transition-colors ${
          reading ? "text-brand-deep" : "text-steel-800/55"
        }`}
      >
        {member.role}
      </span>
    </button>
  );
}

/**
 * The reading panel.
 *
 * It holds a floor so it does not resize under the pointer as you cross from a
 * long biography to a short one, and it is announced politely: a keyboard
 * reaches the wall by tabbing, and what the panel changed to is the whole point
 * of having moved.
 */
function Panel({
  ref,
  member,
  visible,
  count,
}: {
  ref: React.Ref<HTMLElement>;
  member: TeamMember;
  visible: boolean;
  /** Only used to time the panel's own arrival behind the last portrait. */
  count: number;
}) {
  return (
    <aside
      ref={ref}
      className="team-plate hl-reveal mt-12 flex flex-col rounded-2xl p-7 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:mt-0 lg:min-h-[28rem]"
      data-visible={visible}
      style={{ animationDelay: `${240 + count * 70}ms` }}
      aria-live="polite"
    >
      {/* Keyed on the person, so the panel's contents arrive rather than
          swapping in place when the pointer moves along the wall. */}
      <div key={member.id} className="team-swap flex h-full flex-col">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] text-white/85">
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <circle
              cx="6"
              cy="6"
              r="5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M3.6 6.1l1.7 1.7 3.1-3.4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {member.chip}
        </span>

        <h3 className="mt-6 font-display text-xl leading-snug font-semibold text-white">
          {member.name}
        </h3>
        <p className="mt-1.5 text-[11px] font-semibold tracking-[0.14em] text-brand-pale uppercase">
          {member.role}
        </p>

        {/* The profile as the Board writes it, a paragraph to a break. */}
        <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-white/75">
          {member.bio
            .split(/\n\s*\n/)
            .map((para) => para.trim())
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>

        {/* Set apart at the foot rather than run into the profile: it is the
            one line on the panel that is a fact rather than a description,
            and it is what the section is read for after the name. */}
        {member.qualification ? (
          <div className="mt-auto pt-7">
            <span className="block h-px w-full bg-white/15" aria-hidden />
            <p className="mt-4 text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase">
              Qualification
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-white/80">
              {member.qualification}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
