import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SustainabilityBands from "@/components/SustainabilityBands";
import SustainabilityPillars from "@/components/SustainabilityPillars";
import { approach, closing, hero, note } from "@/lib/sustainability";

export const metadata: Metadata = {
  title: "Sustainability — Metal Coatings (India) Ltd",
  description:
    "How MCIL runs its Faridabad cold rolling works: the environment, the people on the line, and the governance a listed company is held to.",
};

export default function SustainabilityPage() {
  return (
    <main>
      {/* Page hero */}
      <section className="relative isolate flex min-h-[72svh] items-center overflow-hidden bg-steel-900 px-6 pt-32 pb-20 sm:px-10 lg:px-[6.5vw]">
        <Image
          src={hero.image}
          alt={hero.alt}
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
            [ {hero.eyebrow} ]
          </p>
          <h1 className="type-display mt-5 max-w-3xl text-[clamp(1.9rem,5.2vw,3.6rem)] leading-[1.12] text-white uppercase">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {hero.standfirst}
          </p>
        </div>
      </section>

      {/* Approach */}
      <section
        id="approach"
        className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-24"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
              [ {approach.eyebrow} ]
            </p>
            <h2 className="type-display mt-4 text-[clamp(1.6rem,4.2vw,2.8rem)] leading-[1.15] text-steel-900 uppercase">
              {approach.title}
            </h2>
          </div>
          <div>
            <p className="text-sm leading-relaxed text-steel-800 sm:text-base">
              {approach.standfirst}
            </p>
            {approach.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-5 text-sm leading-relaxed text-steel-800 sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <SustainabilityPillars />

      <SustainabilityBands />

      {/* What this page does not carry. Kept as plain, unglamorous type: it is
          a statement of limits, and dressing it up would work against it. */}
      <section
        id="note"
        className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw]"
      >
        <div className="mx-auto w-full max-w-3xl border-t border-steel-900/12 pt-10">
          <h2 className="font-display text-lg font-semibold text-steel-900">
            {note.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-steel-800">
            {note.body}
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-background px-6 pb-24 sm:px-10 lg:px-[6.5vw]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 rounded-3xl bg-steel-900 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">
              {closing.title}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/75">
              {closing.body}
            </p>
          </div>
          <Link
            href={closing.ctaHref}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-steel-900 transition-colors hover:bg-brand-pale"
          >
            {closing.ctaLabel}
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
