"use client";

import { type Editor, useDraft, useEditingEditor } from "@/lib/admin/draft";
import { edit, editItem } from "@/lib/admin/editable";
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
 *
 * In the in-page editor every row carries its date, a button to upload or
 * replace its file, and Delete; each list opens on "+ Add report". Rows keep
 * the path they are stored at through the sorting and the archive split, so
 * an edit lands on the right filing whichever tab it is shown under.
 */

/** A filing, and where it is stored. */
type Entry = { doc: ReportDoc; list: string; index: number };

type ViewSub = {
  id: string;
  label: string;
  docs: Entry[];
  /** Where it is stored; absent on the Archives tab's gathered chips. */
  path?: string;
  /** Its place among its category's sub-categories. */
  at?: number;
};

type ViewCategory = {
  id: string;
  label: string;
  blurb: string;
  subCategories: ViewSub[];
  path?: string;
};

const ROOT = "investors.reports.categories";

function located(categories: ReportCategory[]): ViewCategory[] {
  return categories.map((c, ci) => {
    const path = `${ROOT}.${ci}`;
    return {
      id: c.id,
      label: c.label,
      blurb: c.blurb,
      path,
      subCategories: (c.subCategories ?? []).map((s, si) => {
        const subPath = `${path}.subCategories.${si}`;
        return {
          id: s.id,
          label: s.label,
          path: subPath,
          at: si,
          docs: (s.docs ?? []).map((doc, index) => ({
            doc,
            list: `${subPath}.docs`,
            index,
          })),
        };
      }),
    };
  });
}
export default function InvestorReports({
  heading,
  categories: publishedCategories,
}: {
  heading: { eyebrow: string; title: string; standfirst: string };
  categories: ReportCategory[];
}) {
  const allCategories = useDraft(ROOT, publishedCategories);
  const editor = useEditingEditor();

  /* Sub-categories are added and deleted from the editor, so any category can
     arrive empty. A category with no sub-categories has nothing to show and
     is left out of the tab row until it gets one. */
  const categories = useMemo(
    () =>
      withArchives(
        located(allCategories).filter((c) => c.subCategories.length > 0),
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
    (b.doc.date ?? "").localeCompare(a.doc.date ?? ""),
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
                  {c.path ? (
                    <span {...edit(`${c.path}.label`)}>{c.label}</span>
                  ) : (
                    c.label
                  )}
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
          <p
            className="text-center text-xs text-steel-800/80 sm:text-sm"
            {...(category.path ? edit(`${category.path}.blurb`) : {})}
          >
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
                  {...(s.path && category.path && s.at !== undefined
                    ? editItem(`${category.path}.subCategories`, s.at)
                    : {})}
                >
                  {s.path ? (
                    <span {...edit(`${s.path}.label`)}>{s.label}</span>
                  ) : (
                    s.label
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-steel-900/10 pt-1" />

          {editor ? (
            <AddReport
              key={`${category.id}-${sub.id}`}
              editor={editor}
              sub={sub}
              isAnnualReport={sub.id === "annual-audited"}
            />
          ) : null}

          {/* Keyed on the active list so the rows re-mount and the rise
              animation replays on every change of tab or chip. */}
          <ul key={`${category.id}-${sub.id}-${expanded}`} className="mt-1">
            {shown.map((entry, i) => (
              <Row
                key={`${entry.list}.${entry.index}`}
                entry={entry}
                index={i}
                editor={editor}
              />
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
function withArchives(categories: ViewCategory[]): ViewCategory[] {
  const archived: ViewSub[] = [];
  const current = categories.map((c) => ({
    ...c,
    subCategories: c.subCategories.map((s) => {
      const docs = s.docs;
      const old = docs.filter((e) => isArchived(e.doc));
      if (old.length > 0) {
        archived.push({
          id: `${ARCHIVES_ID}-${c.id}-${s.id}`,
          label: s.label,
          docs: old,
        });
      }
      return { ...s, docs: docs.filter((e) => !isArchived(e.doc)) };
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
function Row({
  entry,
  index,
  editor,
}: {
  entry: Entry;
  index: number;
  editor: Editor | null;
}) {
  const { doc, list, index: at } = entry;
  const path = `${list}.${at}`;
  /* While editing, the title is text to type into rather than a link. */
  const view = editor ? null : viewUrlFor(doc.href);

  return (
    <li
      className="rp-row flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-steel-900/10 py-4 last:border-b-0 sm:gap-x-5 sm:py-5"
      style={{ animationDelay: `${Math.min(index, 12) * 70}ms` }}
    >
      <DocIcon />

      <div className="min-w-0 flex-1">
        {view ? (
          <p className="text-sm font-semibold text-steel-900 sm:text-[0.95rem]">
            {/* Opens the PDF in a new tab to read; Download beside it saves it. */}
            <a
              href={view}
              target="_blank"
              rel="noopener"
              className="underline-offset-4 transition-colors hover:text-brand-deep hover:underline"
            >
              {doc.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        ) : (
          <p
            className="text-sm font-semibold text-steel-900 sm:text-[0.95rem]"
            {...edit(`${path}.title`)}
          >
            {doc.title}
          </p>
        )}
      </div>

      {editor ? (
        <RowTools editor={editor} doc={doc} list={list} at={at} />
      ) : doc.href ? (
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

const TOOL =
  "cursor-pointer rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors disabled:cursor-default disabled:opacity-50";

/** A filing's controls in edit mode: its date, its file, and Delete. */
function RowTools({
  editor,
  doc,
  list,
  at,
}: {
  editor: Editor;
  doc: ReportDoc;
  list: string;
  at: number;
}) {
  const path = `${list}.${at}`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const attach = async (file: File) => {
    setBusy(true);
    editor.say("Uploading…");
    try {
      const url = await editor.upload(file, "document");
      editor.update(`${path}.href`, url);
      editor.say(`File attached to “${doc.title}” — press Save to publish`);
    } catch (err) {
      editor.say(`Upload failed: ${(err as Error).message}`, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-edit-ui className="flex shrink-0 flex-wrap items-center gap-1.5">
      <input
        type="date"
        value={doc.date ?? ""}
        onChange={(e) => editor.update(`${path}.date`, e.target.value)}
        title="Filed on — the list is ordered by this, and filings before March 2018 move to Archives"
        className="rounded-full border border-steel-900/15 bg-white px-2.5 py-1 text-[11px] text-steel-900"
      />
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void attach(file);
        }}
      />
      {doc.href ? (
        <a
          href={viewUrlFor(doc.href) ?? doc.href}
          target="_blank"
          rel="noreferrer"
          className={`${TOOL} text-steel-800 ring-1 ring-steel-900/15 hover:bg-steel-900/5`}
        >
          Open
        </a>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className={`${TOOL} ${doc.href ? "text-steel-900 ring-1 ring-steel-900/15 hover:bg-steel-900/5" : "bg-amber-400 text-steel-900 hover:bg-amber-300"}`}
      >
        {busy ? "Uploading…" : doc.href ? "Replace file" : "Upload file"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (!confirm(`Delete “${doc.title}” from the list?`)) return;
          editor.remove(list, at);
          editor.say("Report deleted — press Save to publish");
        }}
        className={`${TOOL} bg-red-600 text-white hover:bg-red-500`}
      >
        Delete
      </button>
    </div>
  );
}

/**
 * "+ Add report": a title, the date it was filed, and the file. It goes to the
 * top of the list as it is shown now, and is published with Save.
 *
 * An annual report can also be read for its figures. That hands the file to
 * the investor-figures import instead, which attaches it to this list itself
 * when its figures are applied — so it is not added twice.
 */
function AddReport({
  editor,
  sub,
  isAnnualReport,
}: {
  editor: Editor;
  sub: ViewSub;
  isAnnualReport: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [readFigures, setReadFigures] = useState(isAnnualReport);
  const [busy, setBusy] = useState(false);

  /* The Archives tab gathers filings from every other tab; a new one is added
     under its own tab and moves here by its date. */
  if (!sub.path) {
    return (
      <p
        data-edit-ui
        className="mt-3 rounded-xl bg-steel-900/5 px-4 py-3 text-center text-xs text-steel-800"
      >
        Add a filing under its own tab — one dated before March 2018 moves here
        by itself.
      </p>
    );
  }

  const isPdf = Boolean(file && /\.pdf$/i.test(file.name));

  const reset = () => {
    setOpen(false);
    setTitle("");
    setFile(null);
    setLink("");
    setReadFigures(isAnnualReport);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isAnnualReport && readFigures && isPdf && file) {
      editor.openFigures(file);
      reset();
      return;
    }
    if (!title.trim()) {
      editor.say("Give the report a title", true);
      return;
    }
    setBusy(true);
    try {
      let href = link.trim();
      if (file) href = await editor.upload(file, "document");
      editor.insert(`${sub.path}.docs`, 0, {
        title: title.trim(),
        date,
        ...(href ? { href } : {}),
      });
      editor.say(`“${title.trim()}” added — press Save to publish`);
      reset();
    } catch (err) {
      editor.say(`Upload failed: ${(err as Error).message}`, true);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-lg border border-steel-900/15 bg-white px-3 py-2 text-sm text-steel-900 outline-none focus:border-brand-deep";

  if (!open) {
    return (
      <div data-edit-ui className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${TOOL} bg-emerald-600 px-4 py-2 text-xs text-white hover:bg-emerald-500`}
        >
          + Add report to “{sub.label}”
        </button>
        {isAnnualReport ? (
          <button
            type="button"
            onClick={() => editor.openFigures()}
            className={`${TOOL} bg-steel-900 px-4 py-2 text-xs text-white hover:bg-steel-800`}
          >
            Import annual report &amp; update figures
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      data-edit-ui
      onSubmit={submit}
      className="mt-3 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-steel-900/10 sm:grid-cols-[1fr_11rem]"
    >
      <p className="text-sm font-semibold text-steel-900 sm:col-span-2">
        New report in “{sub.label}”
      </p>
      <label className="grid gap-1 text-[11px] font-semibold tracking-[0.08em] text-steel-800 uppercase">
        Title
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Shareholding Pattern — 30.09.2026"
          className={`${input} normal-case tracking-normal`}
        />
      </label>
      <label className="grid gap-1 text-[11px] font-semibold tracking-[0.08em] text-steel-800 uppercase">
        Filed on
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={input}
        />
      </label>
      <label className="grid gap-1 text-[11px] font-semibold tracking-[0.08em] text-steel-800 uppercase sm:col-span-2">
        File (PDF, Word, Excel)
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm font-normal tracking-normal normal-case"
        />
      </label>
      {!file ? (
        <label className="grid gap-1 text-[11px] font-semibold tracking-[0.08em] text-steel-800 uppercase sm:col-span-2">
          …or a link to it (e.g. on BSE)
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://"
            className={`${input} normal-case tracking-normal`}
          />
        </label>
      ) : null}
      {isAnnualReport && isPdf ? (
        <label className="flex items-start gap-2 text-sm text-steel-800 sm:col-span-2">
          <input
            type="checkbox"
            checked={readFigures}
            onChange={(e) => setReadFigures(e.target.checked)}
            className="mt-1"
          />
          <span>
            This is the annual report: read the figures out of it and update
            the hero, the highlights and the performance chart too. You check
            the figures before anything changes, and the report is added to
            this list when you apply them.
          </span>
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className={`${TOOL} bg-steel-900 px-4 py-2 text-xs text-white hover:bg-steel-800`}
        >
          {busy
            ? "Uploading…"
            : isAnnualReport && readFigures && isPdf
              ? "Read the figures"
              : "Add report"}
        </button>
        <button
          type="button"
          onClick={reset}
          className={`${TOOL} px-4 py-2 text-xs text-steel-800 hover:bg-steel-900/6`}
        >
          Cancel
        </button>
      </div>
    </form>
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
