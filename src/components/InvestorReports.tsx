"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatReportDate,
  REPORTS_PAGE_SIZE,
  reportCategories,
  reportsHeading,
  type ReportDoc,
} from "@/lib/investor-reports";

/**
 * Document library, modelled on the "Latest Announcements" board in the
 * reference: a tab row across the top, then one card listing title, date and a
 * Download control per row.
 *
 * MCIL files under four categories, each with its own sub-categories, so the
 * card carries a second row of chips under the tabs. "View All" expands the
 * active sub-category in place rather than routing anywhere — the documents
 * themselves are not attached yet (see src/lib/investor-reports.ts).
 */
export default function InvestorReports() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [categoryId, setCategoryId] = useState(reportCategories[0].id);
  const [subId, setSubId] = useState(reportCategories[0].subCategories[0].id);
  const [expanded, setExpanded] = useState(false);

  const category =
    reportCategories.find((c) => c.id === categoryId) ?? reportCategories[0];
  const sub =
    category.subCategories.find((s) => s.id === subId) ??
    category.subCategories[0];

  /* The whole band rises in once, when it first reaches the viewport. */
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
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectCategory = useCallback((id: string) => {
    const next = reportCategories.find((c) => c.id === id);
    if (!next) return;
    setCategoryId(next.id);
    setSubId(next.subCategories[0].id);
    setExpanded(false);
  }, []);

  /* The hero CTAs and the header menu link straight at a category
     (/investors#financials, #compliance, #policies, #letters), so the hash
     both scrolls here and opens the right tab. */
  useEffect(() => {
    const apply = () => {
      const id = window.location.hash.replace("#", "");
      if (reportCategories.some((c) => c.id === id)) selectCategory(id);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [selectCategory]);

  /* Newest first, whatever order the rows were written in. The React compiler
     memoizes this; a manual useMemo on `sub` is what it cannot preserve. */
  const docs = [...sub.docs].sort((a, b) => b.date.localeCompare(a.date));
  const shown = expanded ? docs : docs.slice(0, REPORTS_PAGE_SIZE);

  return (
    <section
      ref={sectionRef}
      id="reports"
      className="relative overflow-hidden bg-background px-6 py-20 sm:px-10 lg:px-[6.5vw] lg:py-24"
    >
      {/* Colour for the glass to pick up — without something behind it, a
          blurred panel over a flat page reads as plain white. */}
      <div className="rp-glow rp-glow--one" aria-hidden />
      <div className="rp-glow rp-glow--two" aria-hidden />

      {/* Anchor targets, one per category, sitting at the top of the band so a
          hash brings the heading and the tabs into view under the fixed
          header rather than the card alone. */}
      {reportCategories.map((c) => (
        <span
          key={c.id}
          id={c.id}
          aria-hidden
          className="absolute top-0 block h-0 w-0 scroll-mt-[calc(var(--header-h)+1.5rem)]"
        />
      ))}

      <div className="relative mx-auto w-full max-w-5xl">
        <header className="text-center">
          <p
            className="rp-rise text-[11px] font-semibold tracking-[0.24em] text-accent uppercase"
            data-visible={visible}
          >
            [ {reportsHeading.eyebrow} ]
          </p>
          <h2
            className="rp-rise type-display mt-4 text-[clamp(1.7rem,5.4vw,3.9rem)] leading-[1.15] text-steel-900 uppercase"
            data-visible={visible}
            style={{ animationDelay: "80ms" }}
          >
            {reportsHeading.title}
          </h2>
          <p
            className="rp-rise mx-auto mt-4 max-w-2xl text-sm text-steel-800 sm:text-base"
            data-visible={visible}
            style={{ animationDelay: "160ms" }}
          >
            {reportsHeading.standfirst}
          </p>
        </header>

        {/* Category tabs, hairline-divided as in the reference. The row sits
            wider than the card so the four labels hold one line on a desktop;
            where it does wrap, each divider travels with the tab before it so
            a line never opens on a stray pipe. */}
        <div
          className="rp-rise mt-10 flex flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:gap-x-3 lg:-mx-[5vw]"
          role="tablist"
          aria-label="Report category"
          data-visible={visible}
          style={{ animationDelay: "240ms" }}
        >
          {reportCategories.map((c, i) => {
            const active = c.id === category.id;
            return (
              <div key={c.id} className="flex items-center gap-x-2 sm:gap-x-3">
                <button
                  type="button"
                  role="tab"
                  id={`rp-tab-${c.id}`}
                  aria-selected={active}
                  aria-controls="rp-panel"
                  onClick={() => selectCategory(c.id)}
                  className={`rp-tab cursor-pointer px-1 pb-1 text-sm tracking-[0.04em] transition-colors sm:text-base ${
                    active
                      ? "font-semibold text-brand-deep"
                      : "text-steel-800/75 hover:text-steel-900"
                  }`}
                  data-active={active}
                >
                  {c.label}
                </button>
                {i < reportCategories.length - 1 && (
                  <span className="text-steel-900/25 select-none" aria-hidden>
                    |
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          id="rp-panel"
          role="tabpanel"
          aria-labelledby={`rp-tab-${category.id}`}
          className="rp-rise rp-card mt-8 rounded-3xl p-5 sm:mt-10 sm:p-8"
          data-visible={visible}
          style={{ animationDelay: "320ms" }}
        >
          <p className="text-center text-xs text-steel-800/80 sm:text-sm">
            {category.blurb}
          </p>

          {/* Sub-category chips. Wrap rather than scroll — Stock Exchange
              Compliance alone carries thirteen of them. */}
          <div
            className="mt-5 flex flex-wrap justify-center gap-2"
            role="tablist"
            aria-label={`${category.label} sub-categories`}
          >
            {category.subCategories.map((s) => {
              const active = s.id === sub.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSubId(s.id);
                    setExpanded(false);
                  }}
                  className="rp-chip cursor-pointer rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.04em] transition-colors sm:text-xs"
                  data-active={active}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-steel-900/10 pt-1" />

          {/* Keyed on the active list so the rows re-mount and the rise
              animation replays on every change of tab or chip. */}
          <ul key={`${category.id}-${sub.id}-${expanded}`} className="mt-1">
            {shown.map((doc, i) => (
              <Row key={doc.title} doc={doc} index={i} />
            ))}
          </ul>

          {docs.length > REPORTS_PAGE_SIZE && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="cursor-pointer text-sm text-steel-900 underline decoration-steel-900/35 underline-offset-[6px] transition-colors hover:text-brand-deep hover:decoration-brand"
              >
                {expanded ? "Show Less" : `View All (${docs.length})`}
              </button>
            </div>
          )}
        </div>

        <p
          className="rp-rise mt-6 text-center text-xs text-steel-800/70"
          data-visible={visible}
          style={{ animationDelay: "420ms" }}
        >
          Document files are being migrated; titles and dates are shown ahead of
          the downloads going live.
        </p>
      </div>
    </section>
  );
}

function Row({ doc, index }: { doc: ReportDoc; index: number }) {
  const date = formatReportDate(doc.date);

  return (
    <li
      className="rp-row flex items-center gap-4 border-b border-steel-900/10 py-4 last:border-b-0 sm:gap-5 sm:py-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <DocIcon />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-steel-900 sm:text-[0.95rem]">
          {doc.title}
        </p>
        <p className="mt-1 text-xs text-steel-800/75 italic sm:text-sm">
          {date}
        </p>
      </div>

      {doc.href ? (
        <a
          href={doc.href}
          download
          className="rp-download flex shrink-0 items-center gap-2 text-xs font-semibold tracking-[0.04em] sm:text-sm"
        >
          Download
          <DownArrow />
          <span className="sr-only">
            {doc.title}, dated {date}
          </span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="This document has not been uploaded yet"
          className="rp-download flex shrink-0 items-center gap-2 text-xs font-semibold tracking-[0.04em] sm:text-sm"
        >
          Download
          <DownArrow />
          <span className="sr-only">
            {doc.title} — not yet available for download
          </span>
        </button>
      )}
    </li>
  );
}

function DocIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-steel-800/70 sm:h-9 sm:w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5Z" />
      <path d="M14 3v4.5h4.5" />
      <path d="M8.75 12h6.5M8.75 15h6.5M8.75 9h2.5" />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="rp-download-arrow h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 2.5v10M4 9l4 4 4-4" />
    </svg>
  );
}
