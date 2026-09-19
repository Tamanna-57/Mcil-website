"use client";

import { useRef, useState } from "react";
import {
  FIELD_LABELS,
  PER_SHARE_FIELDS,
  type Candidate,
  type Extraction,
  type FieldKey,
} from "@/lib/investor/extract";
import {
  deriveHeroSlide,
  deriveHighlights,
  derivePerformance,
  deriveReportDocs,
  type EditorialNotes,
} from "@/lib/investor/derive";
import { fyLabel, type FinancialYear } from "@/lib/investor/years";
import { inputClass } from "./Fields";

/**
 * "Import from annual report" — upload the PDF, check what was read out of it,
 * and regenerate the investor panels from the result.
 *
 * The review step is not a formality. Figures are read by matching labels in a
 * PDF's text, which is reliable enough to save typing and nowhere near
 * reliable enough to publish unseen, so every figure arrives beside the line it
 * was taken from and nothing leaves this panel until someone presses Apply —
 * and even then it only fills the Investors form, which still has to be saved.
 */

type Json = Record<string, unknown>;

/** What the reviewer is working on: the parse, plus their corrections. */
type Draft = {
  fy: string;
  revenue: string;
  ebitda: string;
  pat: string;
  eps: string;
  dividendPerShare: string;
  reportDate: string;
  href: string;
  notes: EditorialNotes;
};

type Phase =
  | { kind: "idle" }
  | { kind: "reading" }
  | { kind: "review"; extraction: Extraction; fileName: string }
  | { kind: "error"; message: string };

const MONEY_FIELDS: FieldKey[] = ["revenue", "ebitda", "pat"];
const ALL_FIELDS: FieldKey[] = [...MONEY_FIELDS, "eps", "dividendPerShare"];

const sectionClass =
  "rounded-2xl border border-brand-deep/20 bg-brand-deep/[0.03] p-5 sm:p-6";

const buttonClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs " +
  "font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

/** A figure as the form should show it: trimmed, but never rounded away. */
function show(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return "";
  return String(Number(value.toFixed(6)));
}

function num(text: string): number {
  const n = Number(text.replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function draftFrom(extraction: Extraction): Draft {
  const at = (key: FieldKey): Candidate | undefined => extraction.fields[key];
  const fy = extraction.fy ?? new Date().getUTCFullYear();
  return {
    fy: String(fy),
    revenue: show(at("revenue")?.value),
    ebitda: show(at("ebitda")?.value),
    pat: show(at("pat")?.value),
    eps: show(at("eps")?.value),
    dividendPerShare: show(at("dividendPerShare")?.value),
    reportDate: `${fy}-08-14`,
    href: "",
    notes: {},
  };
}

function yearFrom(draft: Draft): FinancialYear {
  return {
    fy: Math.round(num(draft.fy)),
    revenueCr: num(draft.revenue),
    ebitdaCr: num(draft.ebitda),
    patCr: num(draft.pat),
    eps: num(draft.eps),
    dividendPerShare: num(draft.dividendPerShare),
  };
}

/** The year series with this year added, or replaced when it is already there. */
export function mergeYear(
  years: FinancialYear[],
  year: FinancialYear,
): FinancialYear[] {
  const rest = years.filter((y) => y.fy !== year.fy);
  return [...rest, year].sort((a, b) => a.fy - b.fy);
}

/**
 * Rewrite the investor content from a year series.
 *
 * Only the four generated panels are touched. The compliance and governance
 * hero slides, every other report category, and anything else hand-written in
 * the section are carried through untouched — an import is not a reset.
 */
export function regenerate(
  investors: Json,
  years: FinancialYear[],
  notes: EditorialNotes,
  report?: { date: string; href?: string },
): Json {
  const latest = years[years.length - 1];
  const next: Json = { ...investors, years };

  /* Hero: the results slide only, found by id so a reordered deck still works. */
  const slides = Array.isArray(investors.slides) ? [...investors.slides] : [];
  const index = slides.findIndex(
    (s) => (s as Json)?.id === "results",
  );
  if (index >= 0) {
    slides[index] = {
      ...(slides[index] as Json),
      ...deriveHeroSlide(years, notes),
    };
    next.slides = slides;
  }

  const highlights = deriveHighlights(years, notes);
  next.highlights = {
    ...(investors.highlights as Json),
    heading: highlights.heading,
    items: highlights.items,
  };

  next.performance = {
    ...(investors.performance as Json),
    metrics: derivePerformance(years),
  };

  /* Reports: prepend this year's rows to Financials -> Annual Report, leaving
     every other category and every existing row where it is. */
  if (report) {
    const reports = (investors.reports as Json) || {};
    const categories = (reports.categories as Json[]) || [];
    const docs = deriveReportDocs(latest.fy, report.href, report.date);
    const titles = new Set(docs.map((d) => d.title));

    next.reports = {
      ...reports,
      categories: categories.map((category) => {
        if (category.id !== "financials") return category;
        const subs = (category.subCategories as Json[]) || [];
        return {
          ...category,
          subCategories: subs.map((sub) => {
            if (sub.id !== "annual-audited") return sub;
            const existing = ((sub.docs as Json[]) || []).filter(
              (d) => !titles.has(d.title as string),
            );
            return { ...sub, docs: [...docs, ...existing] };
          }),
        };
      }),
    };
  }

  return next;
}

/* ------------------------------------------------------------------ pieces */

function ConfidenceChip({ candidate }: { candidate?: Candidate }) {
  if (!candidate) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-900 uppercase">
        Not found
      </span>
    );
  }
  if (candidate.confidence === "low") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-900 uppercase">
        Check this
      </span>
    );
  }
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-900 uppercase">
      Matched
    </span>
  );
}

function FigureRow({
  field,
  candidate,
  unit,
  value,
  onChange,
}: {
  field: FieldKey;
  candidate?: Candidate;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const perShare = PER_SHARE_FIELDS.has(field);
  return (
    <div className="border-t border-steel-900/10 py-3 first:border-t-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-steel-900">
          {FIELD_LABELS[field]}
        </span>
        <ConfidenceChip candidate={candidate} />
        <div className="ml-auto flex items-center gap-2">
          <input
            value={value}
            inputMode="decimal"
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} w-36 text-right`}
            placeholder="—"
          />
          <span className="w-16 text-xs text-steel-800/70">
            {perShare ? "₹" : "₹ Cr"}
          </span>
        </div>
      </div>

      {candidate ? (
        <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-steel-800/70">
          read <strong className="font-semibold">{candidate.raw}</strong>
          {!perShare ? ` ${unit} → ₹${show(candidate.value)} Cr` : ""} from “
          {candidate.snippet}”
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] leading-relaxed text-amber-800">
          No line in the report matched this. Type it in, in{" "}
          {perShare ? "rupees per share" : "₹ crore"}.
        </p>
      )}
    </div>
  );
}

function NoteField({
  label,
  help,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold tracking-[0.1em] text-steel-800 uppercase">
        {label}
      </label>
      {help ? (
        <p className="mt-1 text-xs leading-relaxed text-steel-800/70">{help}</p>
      ) : null}
      <textarea
        rows={2}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} mt-1.5 resize-y`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------- panel */

export default function ImportReport({
  investors,
  onApply,
}: {
  investors: Json;
  onApply: (next: Json) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [attach, setAttach] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<File | null>(null);

  const years = (investors.years as FinancialYear[]) || [];

  async function read(file: File) {
    setPhase({ kind: "reading" });
    setPending(file);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/investor/extract", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as {
        extraction?: Extraction;
        error?: string;
      };
      if (!res.ok || !data.extraction) {
        setPhase({ kind: "error", message: data.error || "Could not read it." });
        return;
      }
      setDraft(draftFrom(data.extraction));
      setPhase({
        kind: "review",
        extraction: data.extraction,
        fileName: file.name,
      });
    } catch {
      setPhase({ kind: "error", message: "Could not reach the server." });
    }
  }

  async function apply() {
    if (!draft || phase.kind !== "review") return;

    let href = draft.href;
    if (attach && !href && pending) {
      setUploading(true);
      try {
        const body = new FormData();
        body.append("file", pending);
        body.append("kind", "document");
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setPhase({
            kind: "error",
            message: data.error || "Could not attach the report.",
          });
          setUploading(false);
          return;
        }
        href = data.url;
      } catch {
        setPhase({ kind: "error", message: "Could not attach the report." });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const merged = mergeYear(years, yearFrom(draft));
    onApply(
      regenerate(investors, merged, draft.notes, {
        date: draft.reportDate,
        href: href || undefined,
      }),
    );

    /* Fold the panel away — the figures are now in the form below, which is
       where they get checked a second time before being saved. */
    setPhase({ kind: "idle" });
    setDraft(null);
    setPending(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className={sectionClass}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-base font-semibold text-steel-900">
          Import from an annual report
        </h2>
        <p className="text-xs text-steel-800/70">
          {years.length
            ? `${years.length} years on file, to ${fyLabel(years[years.length - 1].fy)}`
            : "No years on file yet"}
        </p>
      </div>

      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-800/80">
        Upload the report as a PDF and the figures are read out of it, then
        shown here beside the lines they came from. Check them, correct
        anything the parser got wrong, and Apply fills in the hero panel, the
        highlights cards, the performance chart and the reports list below —
        which you then save as usual.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void read(file);
        }}
      />

      {phase.kind !== "review" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={phase.kind === "reading"}
            className={`${buttonClass} bg-steel-900 text-white hover:bg-navy`}
          >
            {phase.kind === "reading" ? "Reading…" : "Choose a PDF"}
          </button>
          {phase.kind === "error" ? (
            <p className="text-sm text-red-700">{phase.message}</p>
          ) : null}
        </div>
      ) : null}

      {phase.kind === "review" && draft ? (
        <div className="mt-5">
          <div className="rounded-xl bg-white p-4 ring-1 ring-steel-900/10 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="text-sm font-semibold text-steel-900">
                {phase.fileName}
              </p>
              <p className="text-xs text-steel-800/70">
                {phase.extraction.pageCount} pages
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                  phase.extraction.unitFound
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                figures in {phase.extraction.unit}
                {phase.extraction.unitFound ? "" : " (assumed)"}
              </span>
            </div>

            {!phase.extraction.unitFound ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                The report does not say what unit its tables are in, so lakh was
                assumed. If they are in crore, every money figure below is a
                hundred times too small — correct them before applying.
              </p>
            ) : phase.extraction.unitSnippet ? (
              <p className="mt-1.5 font-mono text-[11px] text-steel-800/70">
                from “{phase.extraction.unitSnippet}”
              </p>
            ) : null}

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label className="text-[11px] font-semibold tracking-[0.1em] text-steel-800 uppercase">
                  Financial year
                </label>
                <p className="mt-1 text-xs text-steel-800/70">
                  The year it ends in — 2027 for FY 2026-27.
                  {phase.extraction.fySnippet
                    ? ` Read from “${phase.extraction.fySnippet}”.`
                    : " Not found in the report; check this."}
                </p>
              </div>
              <input
                value={draft.fy}
                inputMode="numeric"
                onChange={(e) =>
                  setDraft({ ...draft, fy: e.target.value })
                }
                className={`${inputClass} w-36 text-right`}
              />
            </div>

            <div className="mt-4">
              {ALL_FIELDS.map((field) => (
                <FigureRow
                  key={field}
                  field={field}
                  candidate={phase.extraction.fields[field]}
                  unit={phase.extraction.unit}
                  value={draft[field as keyof Draft] as string}
                  onChange={(v) => setDraft({ ...draft, [field]: v })}
                />
              ))}
            </div>
          </div>

          {/* Editorial copy — the lines a figure cannot produce. */}
          <div className="mt-4 grid gap-4 rounded-xl bg-white p-4 ring-1 ring-steel-900/10 sm:p-5">
            <p className="text-xs leading-relaxed text-steel-800/80">
              These lines explain the figures rather than restate them, so they
              are yours to write. Left empty, each falls back to a plain
              sentence built from the numbers.
            </p>
            <NoteField
              label="Hero footnote"
              value={draft.notes.operatingFootnote ?? ""}
              placeholder="Revenue eased with steel prices through the year"
              onChange={(v) =>
                setDraft({
                  ...draft,
                  notes: { ...draft.notes, operatingFootnote: v },
                })
              }
            />
            <NoteField
              label="Highlights standfirst"
              value={draft.notes.highlightsStandfirst ?? ""}
              placeholder="Revenue eased with steel prices while profit and the dividend held steady."
              onChange={(v) =>
                setDraft({
                  ...draft,
                  notes: { ...draft.notes, highlightsStandfirst: v },
                })
              }
            />
            <NoteField
              label="Revenue card paragraph"
              value={draft.notes.revenueBody ?? ""}
              placeholder="Down 7% on FY25 as steel prices softened through the year, against ₹160.25 Cr in the prior year."
              onChange={(v) =>
                setDraft({ ...draft, notes: { ...draft.notes, revenueBody: v } })
              }
            />
            <NoteField
              label="Profit card paragraph"
              value={draft.notes.patBody ?? ""}
              placeholder="Held steady at ₹239.97 lakh against ₹236.96 lakh, helped by a sharp fall in finance costs."
              onChange={(v) =>
                setDraft({ ...draft, notes: { ...draft.notes, patBody: v } })
              }
            />
          </div>

          {/* The reports list row. */}
          <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-steel-900/10 sm:p-5">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-0 flex-1">
                <label className="text-[11px] font-semibold tracking-[0.1em] text-steel-800 uppercase">
                  Filed on
                </label>
                <p className="mt-1 text-xs text-steel-800/70">
                  The date the reports list shows against “Annual Report{" "}
                  {draft.fy}”.
                </p>
              </div>
              <input
                type="date"
                value={draft.reportDate}
                onChange={(e) =>
                  setDraft({ ...draft, reportDate: e.target.value })
                }
                className={`${inputClass} w-44`}
              />
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-steel-800">
              <input
                type="checkbox"
                checked={attach}
                onChange={(e) => setAttach(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Attach this PDF to the reports list as the downloadable Annual
                Report {draft.fy}.
              </span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void apply()}
              disabled={uploading}
              className={`${buttonClass} bg-steel-900 text-white hover:bg-navy`}
            >
              {uploading ? "Attaching…" : "Apply to the form below"}
            </button>
            <button
              type="button"
              onClick={() => {
                setPhase({ kind: "idle" });
                setDraft(null);
                setPending(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className={`${buttonClass} text-steel-800 hover:bg-steel-900/6`}
            >
              Discard
            </button>
            <p className="text-xs text-steel-800/70">
              Nothing is published until you save the section.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
