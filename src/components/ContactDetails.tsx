"use client";

import { useEffect, useRef, useState } from "react";
import { company } from "@/lib/company";
import { locations } from "@/lib/contact-locations";

function telHref(phone: string) {
  /* Works numbers are published as a pair ("0129-2307602 / 2307422"); the link
     takes the first, the label keeps both. */
  return `tel:${phone.split("/")[0].trim().replace(/[\s-]/g, "")}`;
}

/** The written details, in the same order as the map's two pins. */
export default function ContactDetails() {
  const sectionRef = useRef<HTMLElement>(null);
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background px-6 pb-24 sm:px-10 lg:px-[6.5vw]"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p
          className="hl-reveal text-[11px] font-semibold tracking-[0.24em] text-accent uppercase"
          data-visible={visible}
        >
          [ Where to Find Us ]
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {locations.map((location, i) => (
            <article
              key={location.id}
              className="hl-reveal rounded-3xl border border-steel-900/10 bg-surface p-7 sm:p-8"
              data-visible={visible}
              style={{ animationDelay: `${80 + i * 90}ms` }}
            >
              <h2 className="font-display text-lg font-semibold text-steel-900">
                {location.label}
              </h2>
              <p className="mt-1 text-[12px] tracking-[0.06em] text-steel-800/70">
                {location.role}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-steel-800">
                {location.address}
              </p>
              <a
                href={telHref(location.phone)}
                className="type-figure mt-5 inline-block text-lg text-steel-900 transition-colors hover:text-brand-deep"
              >
                {location.phone}
              </a>
            </article>
          ))}
        </div>

        <dl
          className="hl-reveal mt-6 grid gap-x-8 gap-y-6 rounded-3xl bg-steel-900 p-7 text-white sm:grid-cols-3 sm:p-8"
          data-visible={visible}
          style={{ animationDelay: "260ms" }}
        >
          <div>
            <dt className="text-[11px] tracking-[0.14em] text-white/55 uppercase">
              Email
            </dt>
            <dd className="mt-2">
              <a
                href={`mailto:${company.email}`}
                className="text-sm font-semibold text-white transition-colors hover:text-brand-pale"
              >
                {company.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.14em] text-white/55 uppercase">
              Investor Queries
            </dt>
            <dd className="mt-2 text-sm text-white/85">
              {company.complianceOfficer.name}
              <span className="block text-xs text-white/55">
                {company.complianceOfficer.role}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] tracking-[0.14em] text-white/55 uppercase">
              CIN
            </dt>
            <dd className="mt-2 text-sm text-white/85 tabular-nums">
              {company.cin}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
