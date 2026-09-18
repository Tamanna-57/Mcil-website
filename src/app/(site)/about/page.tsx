import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AboutIntro from "@/components/AboutIntro";
import AboutProcess from "@/components/AboutProcess";
import AboutTeam from "@/components/AboutTeam";
import { getContent } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "About Us — Metal Coatings (India) Ltd",
  description:
    "MCIL manufactures cold rolled steel strips, coils and HRPO steel. How a coil is made, from hot rolled input through to finished, certified despatch.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { about } = await getContent();

  return (
    <main>
      {/* Page hero */}
      <section className="relative isolate flex min-h-[72svh] items-center overflow-hidden bg-steel-900 px-6 pt-32 pb-20 sm:px-10 lg:px-[6.5vw]">
        <Image
          src={about.hero.image}
          alt={about.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35"
          aria-hidden
        />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-brand-pale uppercase">
            [ {about.hero.eyebrow} ]
          </p>
          <h1 className="type-display mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,3.6rem)] leading-[1.12] text-white uppercase">
            {about.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {about.hero.standfirst}
          </p>
        </div>
      </section>

      <AboutProcess
        eyebrow={about.process.eyebrow}
        title={about.process.title}
        steps={about.process.steps}
      />

      <AboutIntro
        eyebrow={about.advantage.eyebrow}
        title={about.advantage.title}
        standfirst={about.advantage.standfirst}
        points={about.advantage.points}
        image={about.advantage.image}
        alt={about.advantage.alt}
        badgeLabel={about.advantage.badgeLabel}
        badgeText={about.advantage.badgeText}
      />

      <AboutTeam
        heading={about.team.heading}
        members={about.team.members}
        footnote={about.team.footnote}
      />

      {/* Closing */}
      <section className="bg-background px-6 pb-24 sm:px-10 lg:px-[6.5vw]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 rounded-3xl bg-steel-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              {about.closing.title}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/75">
              {about.closing.body}
            </p>
          </div>
          <Link
            href={about.closing.ctaHref}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-steel-900 transition-colors hover:bg-brand-pale"
          >
            {about.closing.ctaLabel}
            <svg
              width="15"
              height="10"
              viewBox="0 0 15 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden
            >
              <path d="M0 5h13M9 1l4 4-4 4" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
