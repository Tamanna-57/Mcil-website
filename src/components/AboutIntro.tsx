"use client";

import Image from "next/image";
import { useState } from "react";
import {
  advantage,
  type AdvantagePoint,
} from "@/lib/about-advantage";

export default function AboutIntro({
  eyebrow = advantage.eyebrow,
  title = advantage.title,
  standfirst = advantage.standfirst,
  points = advantage.points,
  image = advantage.image,
  alt = advantage.alt,
  badgeLabel = advantage.badgeLabel,
  badgeText = advantage.badgeText,
}: {
  eyebrow?: string;
  title?: string;
  standfirst?: string;
  points?: AdvantagePoint[];
  image?: string;
  alt?: string;
  badgeLabel?: string;
  badgeText?: string;
}) {
  /* The first point is open on arrival, as the reference has it. */
  const [open, setOpen] = useState(points[0]?.id ?? "");

  return (
    <section
      id="advantage"
      className="bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-28"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
            [ {eyebrow} ]
          </p>
          <h2 className="type-display mt-4 text-[clamp(1.6rem,4.2vw,2.8rem)] leading-[1.15] text-steel-900 uppercase">
            {title}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-steel-800 sm:text-base">
            {standfirst}
          </p>

          <dl className="mt-10">
            {points.map((point) => {
              const isOpen = open === point.id;
              return (
                <div
                  key={point.id}
                  className="border-t border-steel-900/12 last:border-b"
                >
                  <dt>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? "" : point.id)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                    >
                      <span className="font-display text-lg font-semibold text-steel-900">
                        {point.title}
                      </span>
                      <span
                        aria-hidden
                        className={`shrink-0 text-xl leading-none text-steel-800 transition-transform duration-300 ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>
                  </dt>
                  <dd
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 text-sm leading-relaxed text-steel-800">
                        {point.body}
                      </p>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 40vw, 92vw"
            className="object-cover"
          />
          <div
            className="absolute inset-x-4 bottom-4 rounded-2xl p-5 text-white"
            style={{
              background:
                "color-mix(in srgb, var(--steel-900) 62%, transparent)",
              backdropFilter: "blur(16px) saturate(140%)",
              WebkitBackdropFilter: "blur(16px) saturate(140%)",
            }}
          >
            <p className="text-[11px] tracking-[0.16em] uppercase opacity-80">
              {badgeLabel}
            </p>
            <p className="mt-1 font-display text-lg font-semibold">
              {badgeText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
