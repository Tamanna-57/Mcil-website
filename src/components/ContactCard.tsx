"use client";

import { useState } from "react";
import ContactForm from "@/components/ContactForm";
import { locations, mapEmbed } from "@/lib/contact-locations";

/**
 * The contact panel: the map is the picture across the top, the way to reach
 * us directly underneath, both inside one card.
 *
 * The map is a keyless Google embed, so it geocodes the address itself and
 * drops its own pin — there is no API key to keep alive, and the pin follows
 * the address if it is ever corrected in contact-locations.ts.
 */
export default function ContactCard() {
  const [activeId, setActiveId] = useState(locations[0].id);
  const [loaded, setLoaded] = useState(false);
  const active = locations.find((l) => l.id === activeId) ?? locations[0];

  return (
    <section className="bg-surface px-6 pb-20 sm:px-10 lg:px-[6.5vw] lg:pb-28">
      {/* Pulled up onto the dark band above, so the card reads as the page's
          one object rather than a second section under a header. */}
      <div className="mx-auto -mt-28 w-full max-w-5xl overflow-hidden rounded-3xl shadow-[0_40px_80px_-48px_color-mix(in_srgb,var(--steel-900)_65%,transparent)] lg:-mt-32">
        <div className="relative isolate h-[400px] bg-steel-900 sm:h-[420px] lg:h-[440px]">
          <iframe
            key={active.id}
            src={mapEmbed(active)}
            onLoad={() => setLoaded(true)}
            title={`Map showing MCIL's ${active.label.toLowerCase()} at ${active.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-700 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Map tiles are light and unpredictable, so the headline gets its
              own wash rather than trusting whatever is under it. Click-through,
              so the map still pans and zooms. */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/40"
            aria-hidden
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 pt-10 sm:pt-14">
            <h1 className="cc-title type-display text-center text-[clamp(1.3rem,3.4vw,2.3rem)] leading-[1.25] text-white">
              Hello.
              <br />
              Tell us what you need rolled.
            </h1>
          </div>

          {/* Two sites, one map: the switch sits on the glass at the foot of
              the frame so it never competes with the headline. */}
          <div
            className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-6 sm:pb-6"
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
                    if (isActive) return;
                    setLoaded(false);
                    setActiveId(location.id);
                  }}
                  aria-pressed={isActive}
                  className={`cc-pill cursor-pointer rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${
                    isActive
                      ? "bg-steel-900 text-white"
                      : "bg-white/70 text-steel-900 hover:bg-white"
                  }`}
                >
                  <span className="cc-dot" data-active={isActive} aria-hidden />
                  {location.label}
                </button>
              );
            })}

            <a
              href={active.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="cc-pill ml-auto rounded-full bg-white/70 px-4 py-2 text-[11px] font-semibold tracking-[0.1em] text-steel-900 uppercase transition-colors hover:bg-white"
            >
              Open in Maps
            </a>
          </div>
        </div>

        <ContactForm address={active.address} />
      </div>
    </section>
  );
}
