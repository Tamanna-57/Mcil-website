"use client";

import { useEffect } from "react";
import { fyLabel, type FinancialYear } from "@/lib/investor/years";
import type { SiteContent } from "@/lib/content/types";
import ImportReport, { inputClass } from "./ImportReport";

type Investors = SiteContent["investors"];

/**
 * The investor figures, opened from the edit bar on the investor page.
 *
 * The hero panel, the highlights cards and the performance chart are all built
 * from one series of reported years. This is where that series is kept up:
 * read a new annual report and check what came out of it, or correct a year by
 * hand and rebuild the panels. Whatever is applied lands in the draft, so it
 * shows on the page behind the dialog and is published with Save.
 */

const COLUMNS: { key: keyof FinancialYear; label: string; unit: string }[] = [
  { key: "revenueCr", label: "Revenue", unit: "₹ Cr" },
  { key: "ebitdaCr", label: "EBITDA", unit: "₹ Cr" },
  { key: "patCr", label: "PAT", unit: "₹ Cr" },
  { key: "eps", label: "EPS", unit: "₹" },
  { key: "dividendPerShare", label: "Dividend", unit: "₹ / share" },
];

export default function FiguresDialog({
  investors,
  initialFile,
  onApply,
  onClose,
}: {
  investors: Investors;
  initialFile?: File;
  onApply: (next: Investors) => void;
  onClose: () => void;
}) {
  const years = investors.years ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setYears = (next: FinancialYear[]) =>
    onApply({ ...investors, years: [...next].sort((a, b) => a.fy - b.fy) });

  const setCell = (fy: number, key: keyof FinancialYear, text: string) => {
    const value = Number(text.replace(/,/g, ""));
    if (!Number.isFinite(value)) return;
    setYears(years.map((y) => (y.fy === fy ? { ...y, [key]: value } : y)));
  };

  return (
    <div
      data-edit-ui
      className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-steel-900/55 px-3 py-10 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-3xl bg-background p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-steel-900">
              Investor figures
            </h2>
            <p className="mt-1 text-sm text-steel-800/75">
              The hero panel, the highlights and the performance chart are
              built from these. Upload the latest annual report to add its
              year.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold text-steel-800 hover:bg-steel-900/8"
          >
            Close
          </button>
        </div>

        <div className="mt-6">
          <ImportReport
            investors={investors as unknown as Record<string, unknown>}
            initialFile={initialFile}
            onApply={(next) => onApply(next as unknown as Investors)}
          />
        </div>

        <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-steel-900/10 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-steel-900">
              Reported figures by year
            </h3>
            <p className="text-xs text-steel-800/70">
              Correct a figure here, then “Regenerate from the figures on file”
              above.
            </p>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="text-left text-[11px] tracking-[0.08em] text-steel-800/70 uppercase">
                  <th className="py-2 pr-2 font-semibold">Year</th>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="px-1 py-2 font-semibold">
                      {c.label}{" "}
                      <span className="font-normal normal-case">
                        ({c.unit})
                      </span>
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...years].reverse().map((y) => (
                  <tr key={y.fy} className="border-t border-steel-900/8">
                    <td className="py-1.5 pr-2 font-semibold whitespace-nowrap text-steel-900">
                      {fyLabel(y.fy)}
                    </td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="px-1 py-1.5">
                        <input
                          key={String(y[c.key])}
                          defaultValue={String(y[c.key])}
                          inputMode="decimal"
                          onBlur={(e) => setCell(y.fy, c.key, e.target.value)}
                          className={`${inputClass} px-2 py-1 text-right`}
                        />
                      </td>
                    ))}
                    <td className="py-1.5 pl-1">
                      <button
                        type="button"
                        title={`Remove ${fyLabel(y.fy)}`}
                        onClick={() => {
                          if (confirm(`Remove ${fyLabel(y.fy)} from the figures?`))
                            setYears(years.filter((x) => x.fy !== y.fy));
                        }}
                        className="cursor-pointer rounded-full px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={() => {
              const last = years[years.length - 1];
              const fy = (last?.fy ?? new Date().getUTCFullYear() - 1) + 1;
              setYears([
                ...years,
                {
                  fy,
                  revenueCr: 0,
                  ebitdaCr: 0,
                  patCr: 0,
                  eps: 0,
                  dividendPerShare: 0,
                },
              ]);
            }}
            className="mt-3 cursor-pointer rounded-lg border border-dashed border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            + Add a year
          </button>
        </div>
      </div>
    </div>
  );
}
