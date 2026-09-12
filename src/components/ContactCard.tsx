"use client";

import { useState } from "react";
import ContactForm from "@/components/ContactForm";
import { locations, mapEmbed } from "@/lib/contact-locations";

/**
 * The contact panel: the map across the top, the way to reach us directly
 * underneath, both inside one card sitting on the blue ground.
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
    <div className="contact-card overflow-hidden rounded-[1.75rem]">
      <div className="relative isolate h-[400px] bg-brand-pale sm:h-[420px] lg:h-[450px]">
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

        {/* Only as much wash as the headline needs: a band at the top that is
            gone by the middle, so the streets and the pin stay crisp. It is
            click-through, so the map still pans and zooms under it. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/60 via-black/32 to-transparent"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-8 pt-10 sm:pt-12">
          <h1 className="cc-title type-display text-center text-[clamp(1.15rem,3.2vw,2.15rem)] leading-[1.3] text-white">
            Hello.
            <br />
            Tell us what you need rolled.
          </h1>
        </div>

        {/* Two sites, one map: the switch sits on the glass at the foot of the
            frame so it never competes with the headline. */}
        <div
          className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-5 sm:pb-5"
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
                    ? "bg-brand-deep text-white"
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
  );
}
