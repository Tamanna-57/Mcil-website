"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDraft, useEditingEditor } from "@/lib/admin/draft";
import { edit, editImage, editItem } from "@/lib/admin/editable";
import { team, teamHeading, type TeamMember } from "@/lib/about-team";

/**
 * Which column each portrait takes once the wall is laid out in columns.
 *
 * The reference does not pack its photographs: they hang on a plain grid with
 * cells deliberately left empty, so the wall reads as placed rather than as a
 * block. Naming a column and leaving the row to find itself does that — a
 * portrait whose column is at or behind the one before it drops to the next
 * row, and the cells skipped on the way stay empty. The sequence repeats, so a
 * board that gains or loses a seat scatters the same way.
 *
 * The holes it leaves are spread rather than clustered, because two empty
 * cells side by side start reading as a gap someone forgot to fill — though
 * on the widest walls, where there are more columns than there are people,
 * some of that is unavoidable and the reference has it too.
 *
 * There are three, because the wall is not always the same number of columns
 * wide: four at `md`, and from `lg` the panel beside it still leaves room for
 * five, then six. Below `md` there are too few columns for cells to be spared
 * at all.
 */
/* From `lg` the wall is two rows deep — four across, then three — so the
   section, wall and panel together, fits on one screen. */
const SCATTER_6 = [1, 2, 4, 6, 2, 3, 5] as const;
const SCATTER_5 = [1, 2, 4, 5, 2, 3, 5] as const;
const SCATTER_4 = [1, 3, 4, 2, 4, 1, 3] as const;

/* Written out in full because the stylesheet is built by reading these files;
   a class assembled from pieces at runtime would not be there to apply. Each
   breakpoint restates its own, since a column named at `md` would otherwise
   carry up into `lg`, where the wall is a column wider. */
const COL_START_MD = [
  "",
  "md:col-start-1",
  "md:col-start-2",
  "md:col-start-3",
  "md:col-start-4",
] as const;
const COL_START_LG = [
  "",
  "lg:col-start-1",
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
] as const;
const COL_START_XL = [
  "",
  "xl:col-start-1",
  "xl:col-start-2",
  "xl:col-start-3",
  "xl:col-start-4",
  "xl:col-start-5",
  "xl:col-start-6",
] as const;

/** Every column this portrait starts in, one per width the wall changes at. */
function scatter(i: number) {
  const four = SCATTER_4[i % SCATTER_4.length];
  const five = SCATTER_5[i % SCATTER_5.length];
  const six = SCATTER_6[i % SCATTER_6.length];
  return `${COL_START_MD[four]} ${COL_START_LG[five]} ${COL_START_XL[six]}`;
}

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
  members: publishedMembers = team,
  footnote = DEFAULT_FOOTNOTE,
}: {
  /* `standfirst` is still on the content type — every section's heading
     carries the same trio — but this section no longer sets it: the rail
     names the section and the wall speaks for itself. */
  heading?: { eyebrow: string; title: string };
  members?: TeamMember[];
  footnote?: string;
}) {
  const members = useDraft("about.team.members", publishedMembers);
  /* While editing, the panel moves on a click rather than a hover, so it does
     not change under someone reaching for the text in it. */
  const editing = Boolean(useEditingEditor());
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
  const wallRef = useRef<HTMLUListElement | null>(null);

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
      className="team-band scroll-mt-[var(--header-h)] px-6 py-16 sm:px-10 lg:flex lg:min-h-[calc(100svh-var(--header-h))] lg:flex-col lg:justify-center lg:px-[3vw] lg:py-5"
    >
      {/* The wall runs the width of the window rather than sitting in the
          page's usual centred measure. The reference hangs a long row of small
          plates edge to edge, and that is what gives it its air: held to a
          centred column the same plates have to grow to fill it, and a few
          large photographs in the middle of the screen is the opposite
          composition. The cap is only there so an ultra-wide monitor does not
          stretch the row past reading distance. */}
      <div className="mx-auto w-full max-w-[104rem]">
        <header>
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
            [ <span {...edit("about.team.heading.eyebrow")}>{heading.eyebrow}</span> ]
          </p>
        </header>

        {/* Rail, wall, panel. The rail is only as wide as the type set down it
            and the panel is held to a readable measure, so the wall takes
            whatever is left.

            The top margin clears the eyebrow, which is only set below `lg`;
            from `lg` the rail is the heading and there is nothing above the
            grid to clear, so the section's own padding is the whole of it. */}
        <div className="mt-10 lg:mt-0 lg:grid lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start lg:gap-8 xl:gap-10">
          <Rail label={heading.eyebrow} visible={visible} />

          {/* Five across from `lg` and six from `xl`, with each plate held
              under a ceiling well below the cell it sits in. The photographs
              are small files and a column much past 150px asks them for
              detail they do not have; more to the point, the spare width is
              worth more as the air between the plates than as bigger plates.
              Below `md` there are too few columns for cells to be spared, so
              the scatter is dropped and the portraits simply run. */}
          <ul
            ref={wallRef}
            className="team-wall grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 md:gap-y-6 lg:grid-cols-5 lg:gap-y-5 xl:grid-cols-6"
          >
            {members.map((member, i) => (
              <li
                key={member.id}
                className={scatter(i)}
                {...editItem("about.team.members", i)}
              >
                <Portrait
                  member={member}
                  index={i}
                  visible={visible}
                  reading={member.id === reading.id}
                  onRead={() => setReadingId(member.id)}
                  onTap={follow}
                  hoverReads={!editing}
                />
              </li>
            ))}
          </ul>

          <WallCursor wall={wallRef} />

          <Panel
            ref={panelRef}
            member={reading}
            index={members.indexOf(reading)}
            visible={visible}
            count={members.length}
          />
        </div>

        <p
          className="hl-reveal mt-10 text-xs text-steel-800/70 lg:mt-3"
          data-visible={visible}
          style={{ animationDelay: "900ms" }}
          {...edit("about.team.footnote")}
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
      className="hl-reveal hidden lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:flex lg:h-[26rem] lg:flex-col lg:items-center lg:gap-7"
      data-visible={visible}
      aria-hidden
    >
      <span className="type-display rotate-180 text-[clamp(2.1rem,3.4vw,3.1rem)] whitespace-nowrap text-steel-900 uppercase [writing-mode:vertical-rl]"
        {...edit("about.team.heading.eyebrow")}
      >
        {label}
      </span>
      <span className="w-px flex-1 bg-steel-900/20" />
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
  hoverReads = true,
}: {
  member: TeamMember;
  index: number;
  visible: boolean;
  /** This is the one the panel is showing. */
  reading: boolean;
  onRead: () => void;
  /** Run after a tap, once the panel holds this person. */
  onTap: () => void;
  /** Pointing at the portrait opens it in the panel (not while editing). */
  hoverReads?: boolean;
}) {
  return (
    <button
      type="button"
      onPointerEnter={hoverReads ? onRead : undefined}
      onFocus={hoverReads ? onRead : undefined}
      onClick={() => {
        onRead();
        onTap();
      }}
      aria-pressed={reading}
      /* The ceiling sits on the whole cell rather than on the photograph
         alone, so what is left over stays as the gap between plates. */
      className="team-portrait hl-reveal group block w-full max-w-[10rem] cursor-pointer text-left"
      data-visible={visible}
      style={{ animationDelay: `${240 + index * 70}ms` }}
    >
      {/* One black rectangle per person: the photograph, and the name and
          seat set on the same black underneath it. Square-cornered and on the
          band's greige, as the reference hangs them. */}
      <span className="team-plate block overflow-hidden outline-offset-2 group-focus-visible:outline-2 group-focus-visible:outline-accent">
        <span className="relative block aspect-[3/4] overflow-hidden">
          {/* The plate itself never dims — all seven stay the same black
              rectangle on the band, which is the whole of the effect — so the
              one being read is marked by its photograph coming up out of the
              black rather than by the rectangle changing colour. Fading the
              plate instead would grey it against the greige and there would
              be no black rectangles left to look at. */}
          <Image
            src={member.image}
            alt={`Portrait of ${member.name}`}
            fill
            sizes="(min-width: 640px) 8.5rem, 44vw"
            {...editImage(`about.team.members.${index}.image`)}
            className={`object-cover transition duration-500 ${
              reading
                ? "scale-[1.03] opacity-100"
                : "opacity-70 group-hover:scale-[1.03] group-hover:opacity-100"
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

        {/* Set in white, on the plate's own black rather than on the band. */}
        <span className="block px-2.5 pt-2.5 pb-3">
          <span
            className={`block font-display text-[11px] leading-tight font-semibold transition-colors ${
              reading ? "text-white" : "text-white/70"
            }`}
            {...edit(`about.team.members.${index}.name`)}
          >
            {member.name}
          </span>
          <span
            className={`mt-1 block text-[8px] leading-[1.5] font-semibold tracking-[0.1em] uppercase transition-colors ${
              reading ? "text-white/60" : "text-white/40"
            }`}
            {...edit(`about.team.members.${index}.role`)}
          >
            {member.role}
          </span>
        </span>
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
  index,
  visible,
  count,
}: {
  ref: React.Ref<HTMLElement>;
  member: TeamMember;
  index: number;
  visible: boolean;
  /** Only used to time the panel's own arrival behind the last portrait. */
  count: number;
}) {
  const editing = Boolean(useEditingEditor());
  return (
    <aside
      ref={ref}
      {...editItem("about.team.members", index)}
      className="team-plate team-panel hl-reveal mt-12 flex flex-col overflow-hidden p-7 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:mt-0"
      data-visible={visible}
      style={{ animationDelay: `${240 + count * 70}ms` }}
      aria-live="polite"
    >
      {/* Keyed on the person, so the panel's contents arrive rather than
          swapping in place when the pointer moves along the wall. */}
      <div key={member.id} className="team-swap flex h-full flex-col">
        <h3 className="font-display text-xl leading-snug font-semibold text-white" {...edit(`about.team.members.${index}.name`)}>
          {member.name}
        </h3>
        <p className="mt-1.5 text-[11px] font-semibold tracking-[0.14em] text-brand-pale uppercase" {...edit(`about.team.members.${index}.role`)}>
          {member.role}
        </p>

        {/* The profile as the Board writes it, a paragraph to a break. */}
        {/* Keyed on the text, so an edit re-draws the paragraphs from
            scratch rather than React reconciling ones the browser has already
            merged or split while they were being typed into. */}
        <div
          key={member.bio}
          className="team-bio mt-4 space-y-3 text-[13px] leading-relaxed text-white/75"
          {...edit(`about.team.members.${index}.bio`, { multiline: true })}
        >
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
        {member.qualification || editing ? (
          <div className="mt-auto pt-5">
            <span className="block h-px w-full bg-white/15" aria-hidden />
            <p className="mt-4 text-[10px] font-semibold tracking-[0.18em] text-white/50 uppercase">
              Qualification
            </p>
            <p
              className="mt-1.5 text-[13px] leading-snug text-white/80"
              {...edit(`about.team.members.${index}.qualification`)}
            >
              {member.qualification}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

/**
 * The small square that trails the pointer across the wall, as the reference
 * has it: a dot while it crosses the gaps, opening into a "Profile" tag over a
 * portrait. Over a portrait it stands in for the pointer itself — the hand is
 * hidden there, and the dot sits where the pointer is. It follows with a
 * little lag — eased towards the pointer each frame rather than pinned to it
 * — which is what makes it read as smooth.
 *
 * Only where there is a pointer to follow, and not for reduced motion. It is
 * decoration: the portraits are buttons and say what they do on their own.
 */
function WallCursor({
  wall,
}: {
  wall: React.RefObject<HTMLUListElement | null>;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const area = wall.current;
    const el = ref.current;
    if (!area || !el) return;
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    /* Where the pointer is, and where the tag has got to. */
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let placed = false;

    const tick = () => {
      x += (tx - x) * 0.3;
      y += (ty - y) * 0.3;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame =
        Math.abs(tx - x) + Math.abs(ty - y) > 0.3
          ? requestAnimationFrame(tick)
          : 0;
    };

    const onMove = (event: PointerEvent) => {
      /* The dot's centre on the pointer: the square is 22px tall and its dot
         sits 9.5px in from the left. */
      tx = event.clientX - 9.5;
      ty = event.clientY - 11;
      if (!placed) {
        x = tx;
        y = ty;
        placed = true;
      }
      const onPortrait = Boolean(
        (event.target as HTMLElement).closest?.(".team-portrait"),
      );
      el.dataset.state = onPortrait ? "profile" : "dot";
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      el.dataset.state = "hidden";
      placed = false;
    };

    /* Only once the dot is there to replace it is the pointer hidden. */
    area.classList.add("team-wall--dot");
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    /* It is fixed to the window, so a scroll under a still pointer would
       leave it behind; hide it until the pointer moves again. */
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      area.classList.remove("team-wall--dot");
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [wall]);

  return (
    <span ref={ref} className="team-cursor" data-state="hidden" aria-hidden>
      <span className="team-cursor__dot" />
      <span className="team-cursor__label">Profile</span>
    </span>
  );
}
