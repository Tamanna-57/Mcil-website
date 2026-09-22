"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  team,
  teamHeading,
  type TeamMember,
  type Tone,
} from "@/lib/about-team";

/**
 * Colourways for the reading panel. Each is a flat tint from the site palette
 * with the text colours that sit legibly on it; the panel takes whichever
 * belongs to the person being read, so moving along the row moves through the
 * palette rather than holding one plate for all seven.
 */
const TONES: Record<
  Tone,
  {
    card: string;
    name: string;
    role: string;
    bio: string;
    chip: string;
    /** The hairline above the qualification, and the label set on it. */
    rule: string;
    label: string;
  }
> = {
  deep: {
    card: "bg-steel-900",
    name: "text-white",
    role: "text-brand-pale",
    bio: "text-white/75",
    chip: "bg-white/12 text-white/85",
    rule: "bg-white/15",
    label: "text-white/50",
  },
  blue: {
    card: "bg-brand-light",
    name: "text-steel-900",
    role: "text-brand-deep",
    bio: "text-steel-800",
    chip: "bg-white/60 text-steel-800",
    rule: "bg-steel-900/12",
    label: "text-steel-800/60",
  },
  pale: {
    card: "bg-brand-pale",
    name: "text-steel-900",
    role: "text-brand-deep",
    bio: "text-steel-800",
    chip: "bg-white/70 text-steel-800",
    rule: "bg-steel-900/12",
    label: "text-steel-800/60",
  },
  sand: {
    /* A wash of the accent rather than the accent itself, which is too low in
       contrast to carry text. */
    card: "team-card-sand",
    name: "text-steel-900",
    role: "text-steel-800",
    bio: "text-steel-800",
    chip: "bg-white/70 text-steel-800",
    rule: "bg-steel-900/12",
    label: "text-steel-800/60",
  },
  plain: {
    /* The only tone that is not a tint, so it leans on its edge to read as a
       plate at all: the section behind it is barely darker than the panel. */
    card: "bg-surface ring-1 ring-steel-900/15",
    name: "text-steel-900",
    role: "text-brand-deep",
    bio: "text-steel-800",
    chip: "bg-background text-steel-800",
    rule: "bg-steel-900/12",
    label: "text-steel-800/60",
  },
};

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
      className="scroll-mt-[var(--header-h)] bg-background px-6 pb-20 sm:px-10 lg:px-[6.5vw] lg:pb-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-2xl">
          {/* The label belongs on the rail at desktop width; there is no rail
              on a phone, so it goes back over the top. */}
          <p
            className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase lg:hidden"
            data-visible={visible}
          >
            [ {heading.eyebrow} ]
          </p>
          <h2
            className="hl-reveal type-display mt-4 text-[clamp(1.6rem,4.2vw,2.8rem)] leading-[1.15] text-steel-900 uppercase lg:mt-0"
            data-visible={visible}
            style={{ animationDelay: "80ms" }}
          >
            {heading.title}
          </h2>
          {/* Deliberately a step down from the section standfirsts elsewhere:
              it is a note on who runs the company, not a second headline. */}
          <p
            className="hl-reveal mt-4 text-[13px] leading-relaxed text-steel-800/85 sm:text-sm"
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
              them for detail they do not have. */}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4">
            {members.map((member, i) => (
              <li key={member.id}>
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
  const tone = TONES[member.tone] ?? TONES.plain;

  return (
    <aside
      ref={ref}
      className={`hl-reveal mt-10 flex flex-col rounded-2xl p-7 transition-colors duration-500 lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:mt-0 lg:min-h-[26rem] ${tone.card}`}
      data-visible={visible}
      style={{ animationDelay: `${240 + count * 70}ms` }}
      aria-live="polite"
    >
      {/* Keyed on the person, so the panel's contents arrive rather than
          swapping in place when the pointer moves along the wall. */}
      <div key={member.id} className="team-swap flex h-full flex-col">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.06em] ${tone.chip}`}
        >
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

        <h3
          className={`mt-6 font-display text-xl leading-snug font-semibold ${tone.name}`}
        >
          {member.name}
        </h3>
        <p
          className={`mt-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase ${tone.role}`}
        >
          {member.role}
        </p>

        {/* The profile as the Board writes it, a paragraph to a break. */}
        <div className={`mt-5 space-y-3.5 text-sm leading-relaxed ${tone.bio}`}>
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
            <span className={`block h-px w-full ${tone.rule}`} aria-hidden />
            <p
              className={`mt-4 text-[10px] font-semibold tracking-[0.18em] uppercase ${tone.label}`}
            >
              Qualification
            </p>
            <p className={`mt-1.5 text-[13px] leading-snug ${tone.bio}`}>
              {member.qualification}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
