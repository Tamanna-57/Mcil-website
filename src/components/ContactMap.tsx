"use client";

import { useState } from "react";
import { locations, mapEmbed } from "@/lib/contact-locations";

/**
 * Page opener: the map is the picture. A scrim across the top keeps the
 * transparent site header legible over whatever the map happens to be showing
 * there, and is click-through so the map underneath still pans.
 */
export default function ContactMap() {
  const [activeId, setActiveId] = useState(locations[0].id);
  const [loaded, setLoaded] = useState(false);
  const active = locations.find((l) => l.id === activeId) ?? locations[0];

  return (
    <section className="relative isolate h-[72svh] min-h-[560px] w-full overflow-hidden bg-steel-900">
      <iframe
        key={active.id}
        src={mapEmbed(active)}
        onLoad={() => setLoaded(true)}
        title={`Map showing MCIL's ${active.label.toLowerCase()} at ${active.address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/85 via-black/45 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
        aria-hidden
      />

      {/* The card floats over the map, so it only claims pointer events where
          it actually paints. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pb-8 sm:px-10 lg:px-[6.5vw] lg:pb-12">
        <div className="cm-card pointer-events-auto w-full max-w-xl rounded-3xl p-7 sm:p-9">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-accent uppercase">
            [ Contact Us ]
          </p>
          <h1 className="type-display mt-4 text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.15] text-steel-900">
            Hello.
            <br />
            Tell us what you need rolled.
          </h1>

          <div
            className="mt-7 flex flex-wrap gap-2"
            role="group"
            aria-label="Choose a location to show on the map"
          >
            {locations.map((location) => {
              const isActive = location.id === active.id;
              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => {
                    if (location.id === active.id) return;
                    setLoaded(false);
                    setActiveId(location.id);
                  }}
                  aria-pressed={isActive}
                  className={`cm-pill cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold tracking-[0.06em] uppercase transition-colors ${
                    isActive
                      ? "bg-steel-900 text-white"
                      : "bg-steel-900/6 text-steel-800 hover:bg-steel-900/12"
                  }`}
                >
                  <span className="cm-dot" data-active={isActive} aria-hidden />
                  {location.label}
                </button>
              );
            })}
          </div>

          <p key={active.id} className="cm-swap mt-5 text-sm text-steel-800">
            {active.address}
          </p>
          <a
            href={active.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.08em] text-brand-deep uppercase transition-colors hover:text-steel-900"
          >
            Open in Google Maps
            <svg
              width="13"
              height="9"
              viewBox="0 0 15 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M0 5h13M9 1l4 4-4 4" strokeLinecap="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
