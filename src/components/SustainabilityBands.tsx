"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { bands as defaultBands, type Band } from "@/lib/sustainability";

/**
 * The alternating image-and-text blocks, after the reference page's rhythm:
 * a photograph on one side, two paragraphs on the other, sides swapping band
 * to band. Below `lg` the photograph sits above the copy in every band.
 */
export default function SustainabilityBands({
  bands = defaultBands,
}: {
  bands?: Band[];
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sustain-band px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-28"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:gap-24">
        {bands.map((band, i) => (
          <article
            key={band.id}
            id={band.id}
            className="grid scroll-mt-32 items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >
            <div
              className={`hl-reveal relative aspect-[4/3] overflow-hidden rounded-2xl ${
                band.flipped ? "lg:order-2" : ""
              }`}
              data-visible={visible}
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              <Image
                src={band.image}
                alt={band.alt}
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>

            <div
              className="hl-reveal"
              data-visible={visible}
              style={{ animationDelay: `${200 + i * 90}ms` }}
            >
              <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
                [ {band.eyebrow} ]
              </p>
              <h2 className="type-display mt-4 text-[clamp(1.4rem,3.4vw,2.2rem)] leading-[1.18] text-steel-900 uppercase">
                {band.title}
              </h2>
              {band.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="mt-5 text-sm leading-relaxed text-steel-800 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
