"use client";

import { useEffect, useRef, useState } from "react";
import { company } from "@/lib/company";
import { locations } from "@/lib/contact-locations";

function telHref(phone: string) {
  /* Works numbers are published as a pair ("0129-2307602 / 2307422"); the link
     takes the first, the label keeps both. */
  return `tel:${phone.split("/")[0].trim().replace(/[\s-]/g, "")}`;
}

/** The written details under the card — small, on the same blue ground. */
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="mt-5 grid gap-4 sm:grid-cols-3">
      {locations.map((location, i) => (
        <article
          key={location.id}
          className="cc-tile hl-reveal rounded-2xl p-5"
          data-visible={visible}
          style={{ animationDelay: `${60 + i * 80}ms` }}
        >
          <h2 className="text-[10px] font-semibold tracking-[0.16em] text-brand-deep uppercase">
            {location.label}
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-steel-800">
            {location.address}
          </p>
          <a
            href={telHref(location.phone)}
            className="type-figure mt-3 inline-block text-sm text-steel-900 transition-colors hover:text-brand-deep"
          >
            {location.phone}
          </a>
        </article>
      ))}

      <article
        className="cc-tile hl-reveal rounded-2xl p-5"
        data-visible={visible}
        style={{ animationDelay: "220ms" }}
      >
        <h2 className="text-[10px] font-semibold tracking-[0.16em] text-brand-deep uppercase">
          Email &amp; Company
        </h2>
        <a
          href={`mailto:${company.email}`}
          className="mt-3 inline-block text-[13px] font-semibold text-steel-900 transition-colors hover:text-brand-deep"
        >
          {company.email}
        </a>
        <p className="mt-2 text-[12px] leading-relaxed text-steel-800/80">
          {company.complianceOfficer.name} — investor queries
        </p>
        <p className="mt-2 text-[11px] tracking-[0.04em] text-steel-800/60 tabular-nums">
          CIN {company.cin}
        </p>
      </article>
    </section>
  );
}
