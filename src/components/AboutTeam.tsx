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
 * Card colourways. Each is a flat tint from the site palette with the text
 * colours that sit legibly on it — the reference's coloured quadrants, in
 * MCIL's own blues rather than its brights.
 */
const TONES: Record<
  Tone,
  {
    card: string;
    name: string;
    role: string;
    bio: string;
    chip: string;
    ring: string;
  }
> = {
  deep: {
    card: "bg-steel-900",
    name: "text-white",
    role: "text-brand-pale",
    bio: "text-white/75",
    chip: "bg-white/12 text-white/85",
    ring: "ring-white/20",
  },
  blue: {
    card: "bg-brand-light",
    name: "text-steel-900",
    role: "text-brand-deep",
    bio: "text-steel-800",
    chip: "bg-white/60 text-steel-800",
    ring: "ring-white/70",
  },
  pale: {
    card: "bg-brand-pale",
    name: "text-steel-900",
    role: "text-brand-deep",
    bio: "text-steel-800",
    chip: "bg-white/70 text-steel-800",
    ring: "ring-white/80",
  },
  sand: {
    /* A wash of the accent rather than the accent itself, which is too low in
       contrast to carry text. */
    card: "team-card-sand",
    name: "text-steel-900",
    role: "text-steel-800",
    bio: "text-steel-800",
    chip: "bg-white/70 text-steel-800",
    ring: "ring-white/80",
  },
  plain: {
    card: "bg-surface ring-1 ring-steel-900/10",
    name: "text-steel-900",
    role: "text-brand-deep",
    bio: "text-steel-800",
    chip: "bg-background text-steel-800",
    ring: "ring-steel-900/10",
  },
};

export default function AboutTeam() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  /* Cards are held back until the section arrives, so they rise in together
     rather than having already happened by the time you scroll to them. */
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

  return (
    <section
      ref={sectionRef}
      id="team"
      className="bg-background px-6 pb-20 sm:px-10 lg:px-[6.5vw] lg:pb-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="max-w-2xl">
          <p
            className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase"
            data-visible={visible}
          >
            [ {teamHeading.eyebrow} ]
          </p>
          <h2
            className="hl-reveal type-display mt-4 text-[clamp(1.6rem,4.2vw,2.8rem)] leading-[1.15] text-steel-900 uppercase"
            data-visible={visible}
            style={{ animationDelay: "80ms" }}
          >
            {teamHeading.title}
          </h2>
          <p
            className="hl-reveal mt-5 text-sm leading-relaxed text-steel-800 sm:text-base"
            data-visible={visible}
            style={{ animationDelay: "160ms" }}
          >
            {teamHeading.standfirst}
          </p>
        </header>

        {/* Seven cards with the chairman's running double width — eight column
            units, which fills both rows of the four-column grid exactly. */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {team.map((member, i) => (
            <Card key={member.id} member={member} index={i} visible={visible} />
          ))}
        </div>

        <p
          className="hl-reveal mt-8 text-xs text-steel-800/70"
          data-visible={visible}
          style={{ animationDelay: "900ms" }}
        >
          Board of Directors and Key Managerial Personnel as listed in the
          FY2025-26 annual report.
        </p>
      </div>
    </section>
  );
}

function Card({
  member,
  index,
  visible,
}: {
  member: TeamMember;
  index: number;
  visible: boolean;
}) {
  const tone = TONES[member.tone];

  return (
    <article
      className={`hl-reveal flex flex-col rounded-2xl p-6 sm:p-7 ${tone.card} ${
        member.feature ? "sm:col-span-2" : ""
      }`}
      data-visible={visible}
      style={{ animationDelay: `${240 + index * 90}ms` }}
    >
      <span
        className={`relative block h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ${tone.ring} sm:h-[5.5rem] sm:w-[5.5rem]`}
      >
        <Image
          src={member.image}
          alt={`Portrait of ${member.name}`}
          fill
          sizes="88px"
          className="object-cover"
        />
      </span>

      <h3
        className={`mt-5 font-display text-lg leading-snug font-semibold ${tone.name} ${
          member.feature ? "sm:text-2xl" : ""
        }`}
      >
        {member.name}
      </h3>
      <p
        className={`mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${tone.role}`}
      >
        {member.role}
      </p>

      <p
        className={`mt-4 text-sm leading-relaxed ${tone.bio} ${
          member.feature ? "max-w-lg" : ""
        }`}
      >
        {member.bio}
      </p>

      <div className="mt-auto pt-6">
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
      </div>
    </article>
  );
}
