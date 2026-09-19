"use client";

import { useEffect, useState } from "react";
import ContactForm from "@/components/ContactForm";
import {
  type ContactLocation,
  locations as defaultLocations,
  mapEmbed,
  mapLink,
} from "@/lib/contact-locations";



/**
 * A 68-byte image on the host the map draws its tiles and sprites from.
 *
 * Content blockers — Brave's Shields, uBlock and the rest — stop the Google
 * Maps embed at the network, and when they do the browser paints its own
 * broken-frame icon inside the iframe. Nothing in the page can see that: the
 * frame is cross-origin, and it reports a perfectly ordinary `load` either
 * way. Asking for one small asset from the same host is the way to tell the
 * two apart, and /contact already preconnects here so it costs no handshake.
 */
const MAPS_PROBE = "https://maps.gstatic.com/mapfiles/transparent.png";

/** How long to wait for the probe before treating the map as unavailable. */
const PROBE_TIMEOUT_MS = 4000;

/** Mount the remaining maps when the browser is next idle, so warming them
    never competes with the one the visitor is actually looking at. */
function whenIdle(run: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(run, { timeout: 2000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(run, 400);
  return () => window.clearTimeout(handle);
}

/**
 * The contact panel: the map across the top, the way to reach us directly
 * underneath, both inside one card sitting on the blue ground.
 *
 * The map is a keyless Google embed, so it geocodes the address itself and
 * drops its own pin — there is no API key to keep alive, and the pin follows
 * the address if it is ever corrected in contact-locations.ts.
 *
 * It is also a third-party app that takes a second or two to boot, and it sits
 * at the top of the page, so three things are arranged around that: the frame
 * in view loads eagerly rather than being deferred as lazy content (and the
 * preconnects on /contact have the connection open before it asks); a skeleton
 * holds its place from the first paint, so the card never opens on an empty
 * rectangle; and each location keeps its own frame once warmed, so switching
 * between them is immediate rather than a fresh load of Google's app.
 */
export default function ContactCard({
  locations = defaultLocations,
}: {
  locations?: ContactLocation[];
}) {
  /* Which frame is in the server-rendered HTML, and so the one whose load
     the effects below wait on. */
  const firstId = locations[0]?.id ?? "";

  const [activeId, setActiveId] = useState(firstId);
  const [loadedIds, setLoadedIds] = useState<string[]>([]);
  const [mountedIds, setMountedIds] = useState<string[]>([firstId]);
  /* null while the probe is out; true once we know the embed cannot draw. */
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const active = locations.find((l) => l.id === activeId) ?? locations[0];
  const allMounted = mountedIds.length === locations.length;
  const firstLoaded = loadedIds.includes(firstId);

  const markLoaded = (id: string) =>
    setLoadedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));

  /* The first frame is in the server-rendered HTML and starts loading off the
     preload scanner, so on a warm connection it can be done before React ever
     hydrates — and then its onLoad has already been and gone. The document's
     own load event is the way back to that: an iframe in the initial markup
     holds it open, so once it has fired the frame is loaded whether or not we
     saw it happen. */
  useEffect(() => {
    if (firstLoaded) return;
    const onLoad = () => markLoaded(firstId);
    /* Already fired, so there is no event left to wait for — say so on the
       next tick rather than re-rendering out of the effect body. */
    if (document.readyState === "complete") {
      const handle = window.setTimeout(onLoad, 0);
      return () => window.clearTimeout(handle);
    }
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, [firstLoaded, firstId]);

  useEffect(() => {
    if (allMounted || !firstLoaded) return;
    return whenIdle(() => setMountedIds(locations.map((l) => l.id)));
  }, [allMounted, firstLoaded, locations]);

  /* Is Google Maps actually reachable from this browser? See MAPS_PROBE. */
  useEffect(() => {
    let settled = false;
    const probe = new Image();

    const decide = (isBlocked: boolean) => {
      if (settled) return;
      settled = true;
      setBlocked(isBlocked);
    };

    probe.onload = () => decide(false);
    probe.onerror = () => decide(true);
    /* A blocker that stalls the request rather than refusing it never fires
       either handler, so the timeout is the answer in that case. */
    const timer = window.setTimeout(() => decide(true), PROBE_TIMEOUT_MS);
    probe.src = `${MAPS_PROBE}?v=${Date.now()}`;

    return () => {
      settled = true;
      window.clearTimeout(timer);
      probe.onload = null;
      probe.onerror = null;
    };
  }, []);

  const mount = (id: string) =>
    setMountedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));

  return (
    <div className="contact-card overflow-hidden rounded-[1.75rem]">
      <div className="relative isolate h-[400px] bg-brand-pale sm:h-[420px] lg:h-[450px]">
        {locations.map((location) => {
          if (blocked || !mountedIds.includes(location.id)) return null;
          const isActive = location.id === active.id;
          return (
            <iframe
              key={location.id}
              src={mapEmbed(location)}
              onLoad={() => markLoaded(location.id)}
              title={`Map showing MCIL's ${location.label.toLowerCase()} at ${location.address}`}
              loading={location.id === firstId ? "eager" : "lazy"}
              referrerPolicy="no-referrer-when-downgrade"
              aria-hidden={!isActive}
              tabIndex={isActive ? undefined : -1}
              /* The frame in view is never hidden and never held back behind a
                 fade: an empty iframe paints nothing, so the skeleton reads
                 through it until Google's app draws, and the map appears the
                 moment it has something to show. The one out of view is hidden
                 outright, so a second copy of Maps is not being composited. */
              className={`absolute inset-0 h-full w-full border-0 ${
                isActive
                  ? "opacity-100"
                  : "pointer-events-none invisible opacity-0"
              }`}
            />
          );
        })}

        {/* Stands in for the frame until Google's app has painted, behind it
            rather than over it, and stays there afterwards rather than being
            torn down — so a switch to a location that has not been drawn yet
            has the same ground to arrive over. */}
        <div
          className={`cc-map-skeleton absolute inset-0 -z-10 transition-opacity duration-500 ${
            loadedIds.includes(active.id) && !blocked ? "opacity-0" : "opacity-100"
          }`}
          data-loaded={loadedIds.includes(active.id) && !blocked}
          aria-hidden
        />

        {/* What stands in when the embed cannot draw at all.
            Without this the browser fills the frame with its own broken-page
            icon, which reads as a broken site rather than a blocked one — and
            leaves no way to reach the map. The address and the link do the
            job the map was there to do.

            It sits in the band between the headline and the location pills,
            which both keep their place whether or not the map draws. */}
        {blocked ? (
          <div className="absolute inset-0 z-[1] flex items-center justify-center px-6 pt-24 pb-16 sm:pt-28">
            <div className="max-w-sm rounded-2xl bg-white/85 px-5 py-4 text-center backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-steel-900">
                {active.address}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-steel-800/70">
                The map cannot be shown — this browser is blocking Google Maps.
              </p>
              <a
                href={mapLink(active)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-deep px-4 py-2 text-[11px] font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:bg-navy"
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
        ) : null}

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
                onPointerEnter={() => mount(location.id)}
                onFocus={() => mount(location.id)}
                onClick={() => {
                  if (isActive) return;
                  mount(location.id);
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
            href={mapLink(active)}
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
