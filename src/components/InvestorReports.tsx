"use client";

import { edit } from "@/lib/admin/editable";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { viewUrlFor } from "@/lib/document-view";
import {
  ARCHIVE_BEFORE,
  isArchived,
  type ReportCategory,
  type ReportDoc,
  REPORTS_PAGE_SIZE,
} from "@/lib/investor-reports";

/**
 * Document library, modelled on the "Latest Announcements" board in the
 * reference: a tab row across the top, then one card listing a title and a
 * Download control per row.
 *
 * MCIL files under four categories, each with its own sub-categories, so the
 * card carries a second row of chips under the tabs. "View All" expands the
 * active sub-category in place rather than routing anywhere.
 *
 * Filings older than ARCHIVE_BEFORE are lifted out of their sub-category and
 * gathered under a fifth tab, Archives, which keeps the same sub-categories
 * as chips. Which tab a filing lands in follows its date alone, so an old
 * filing added from the admin panel files itself.
 */
export default function InvestorReports({
  heading,
  categories: allCategories,
}: {
  heading: { eyebrow: string; title: string; standfirst: string };
  categories: ReportCategory[];
}) {
  /* Categories and sub-categories are added and deleted from the admin panel,
     so any of them can arrive empty. A category with no sub-categories has
     nothing to show and is left out of the tab row until it gets one. */
  const categories = useMemo(
    () =>
      withArchives(
        allCategories.filter((c) => (c.subCategories ?? []).length > 0),
      ),
    [allCategories],
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [subId, setSubId] = useState(
    categories[0]?.subCategories[0]?.id ?? "",
  );
  const [expanded, setExpanded] = useState(false);

  const category = categories.find((c) => c.id === categoryId) ?? categories[0];
  const sub =
    category?.subCategories.find((s) => s.id === subId) ??
    category?.subCategories[0];

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

  const selectCategory = useCallback(
    (id: string) => {
      const next = categories.find((c) => c.id === id);
      if (!next?.subCategories[0]) return;
      setCategoryId(next.id);
      setSubId(next.subCategories[0].id);
      setExpanded(false);
    },
    [categories],
  );

  /* The hero CTAs and the header menu link straight at a category
     (/investors#financials, #compliance, #policies, #letters, #archives), so
     the hash both scrolls here and opens the right tab. */
  useEffect(() => {
    const apply = () => {
      const id = window.location.hash.replace("#", "");
      if (categories.some((c) => c.id === id)) selectCategory(id);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [categories, selectCategory]);

  /* Newest first, whatever order the rows were written in. The React compiler
     memoizes this; a manual useMemo on `sub` is what it cannot preserve. */
  const docs = [...(sub?.docs ?? [])].sort((a, b) =>
    (b.date ?? "").localeCompare(a.date ?? ""),
  );
  const shown = expanded ? docs : docs.slice(0, REPORTS_PAGE_SIZE);

  if (!category || !sub) return null;

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
      {categories.map((c) => (
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
            [ <span {...edit("investors.reports.heading.eyebrow")}>{heading.eyebrow}</span> ]
          </p>
          <h2
            className="rp-rise type-display mt-4 text-[clamp(1.7rem,5.4vw,3.9rem)] leading-[1.15] text-steel-900 uppercase"
            data-visible={visible}
            style={{ animationDelay: "80ms" }}
            {...edit("investors.reports.heading.title")}
          >
            {heading.title}
          </h2>
          <p
            className="rp-rise mx-auto mt-4 max-w-2xl text-sm text-steel-800 sm:text-base"
            data-visible={visible}
            style={{ animationDelay: "160ms" }}
            {...edit("investors.reports.heading.standfirst")}
          >
            {heading.standfirst}
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
          {categories.map((c, i) => {
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
                {i < categories.length - 1 && (
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
              <Row key={`${i}-${doc.title}`} doc={doc} index={i} />
            ))}
          </ul>

          {docs.length === 0 && (
            <p className="py-8 text-center text-sm text-steel-800/70">
              No documents have been filed here yet.
            </p>
          )}

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

      </div>
    </section>
  );
}

const ARCHIVES_ID = "archives";

/**
 * Splits every sub-category into its current filings and its archived ones,
 * and gathers the archived ones into an Archives category on the end. A
 * sub-category keeps its place in its own tab even when all it holds is
 * archived, so the chips a shareholder knows do not come and go.
 */
function withArchives(categories: ReportCategory[]): ReportCategory[] {
  const archived: ReportCategory["subCategories"] = [];
  const current = categories.map((c) => ({
    ...c,
    subCategories: c.subCategories.map((s) => {
      const docs = s.docs ?? [];
      const old = docs.filter(isArchived);
      if (old.length > 0) {
        archived.push({
          id: `${ARCHIVES_ID}-${c.id}-${s.id}`,
          label: s.label,
          docs: old,
        });
      }
      return { ...s, docs: docs.filter((d) => !isArchived(d)) };
    }),
  }));

  if (archived.length === 0) return current;

  /* "Others" is a sub-category of two tabs; in one row of chips it needs
     saying which. */
  const seen = new Map<string, number>();
  for (const s of archived) seen.set(s.label, (seen.get(s.label) ?? 0) + 1);
  const labelled = archived.map((s) => {
    if ((seen.get(s.label) ?? 0) < 2) return s;
    const owner = current.find((c) =>
      s.id.startsWith(`${ARCHIVES_ID}-${c.id}-`),
    );
    return owner ? { ...s, label: `${s.label} — ${owner.label}` } : s;
  });

  return [
    ...current,
    {
      id: ARCHIVES_ID,
      label: "Archives",
      blurb: `Filings from before ${monthYear(ARCHIVE_BEFORE)}, kept for reference.`,
      subCategories: labelled,
    },
  ];
}

/** "2018-03-01" → "March 2018". */
function monthYear(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * One document: the icon, the title — a link that opens a PDF to read in a
 * new tab — and its Download control.
 *
 * The filing date is not set here. It is still on every row — it is what the
 * list is ordered by, newest first — but the titles carry the year themselves
 * ("Annual Report 2026", "Audited Financial Results — 31.03.2026"), so
 * printing the date under each one said the same thing twice and gave every
 * row a second line to read past.
 */
function Row({ doc, index }: { doc: ReportDoc; index: number }) {
  const view = viewUrlFor(doc.href);
  return (
    <li
      className="rp-row flex items-center gap-4 border-b border-steel-900/10 py-4 last:border-b-0 sm:gap-5 sm:py-5"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <DocIcon />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-steel-900 sm:text-[0.95rem]">
          {view ? (
            // Opens the PDF in a new tab to read; Download beside it saves it.
            <a
              href={view}
              target="_blank"
              rel="noopener"
              className="underline-offset-4 transition-colors hover:text-brand-deep hover:underline"
            >
              {doc.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            doc.title
          )}
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
          <span className="sr-only">{doc.title}</span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="This document is not available yet"
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
