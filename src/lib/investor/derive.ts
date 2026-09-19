/**
 * Turns the financial year series into the shapes the investor page renders.
 *
 * This is a *generator*, not a runtime layer: it produces the same
 * `InvestorSlide` / `Highlight` / `PerformanceMetric` / `ReportDoc` objects that
 * are written by hand today, and the import flow saves its output into the
 * ordinary `investors` content override. Nothing on the public page reads this
 * file. That is deliberate — every field stays editable in the admin panel
 * afterwards, and an import that gets a number slightly wrong is corrected by
 * typing over it rather than by changing code.
 *
 * Everything here is arithmetic on the reported figures. Copy that states a
 * *cause* ("as steel prices softened") cannot be derived from a number, so the
 * few editorial lines are passed in through `EditorialNotes` and left to the
 * person doing the import.
 */

import type { HeroMetric, InvestorSlide, MetricGroup } from "@/lib/investor-hero";
import type { Bar, Highlight } from "@/lib/investor-highlights";
import type { PerformanceMetric } from "@/lib/investor-performance";
import type { ReportDoc } from "@/lib/investor-reports";
import type { Heading } from "@/lib/content/types";
import {
  changePct,
  dividendOnFacePct,
  dividendPayoutPct,
  dividendTotalCr,
  EQUITY_SHARES_LAKH,
  ebitdaMarginPct,
  fyLabel,
  fyShort,
  money,
  round,
  type FinancialYear,
} from "./years";

/**
 * Bar widths are a visual scale, not a figure. Each card keeps the scale it
 * was drawn with so an import does not silently resize the existing charts:
 * the revenue bars top out at 88% of the track, the EPS bars fill it.
 */
const REVENUE_BAR_SCALE = 88;
const EPS_BAR_SCALE = 100;

/** Years shown in the small bar panels on the highlights cards. */
const BAR_YEARS = 4;

/** Top of the gauge arc on the PAT card, as an EBITDA margin percentage. */
const GAUGE_FULL_SCALE_PCT = 5;

/**
 * Copy that states a cause rather than a figure.
 *
 * Each of these replaces a derived sentence outright rather than being spliced
 * into it. The published cards read "Down 7% on FY25 *as steel prices softened
 * through the year*, against ₹160.25 Cr in the prior year" — an explanation
 * threaded through the middle of the figures, which no template can place. The
 * review form pre-fills these with the derived sentence so the wording is a
 * starting point to edit, not a blank box.
 */
export type EditorialNotes = {
  /** Under the hero's Operating Performance group. */
  operatingFootnote?: string;
  /** The standfirst over the highlights bento. */
  highlightsStandfirst?: string;
  /** Replaces the revenue card's paragraph. */
  revenueBody?: string;
  /** Replaces the profit-after-tax card's paragraph. */
  patBody?: string;
};

/** "up" when the figure grew, "down" when it fell, absent when it held. */
function trendOf(
  current: number,
  previous: number | undefined,
): "up" | "down" | undefined {
  if (previous === undefined) return undefined;
  if (current > previous) return "up";
  if (current < previous) return "down";
  return undefined;
}

/** ₹ crore as the lakh figure the annual report itself prints. */
function lakh(cr: number): string {
  return `${money(cr * 100, 2)} lakh`;
}

/* --------------------------------------------------------------- hero panel */

/** The metrics panel and stat banner on the "results" hero slide. */
export function deriveHeroSlide(
  years: FinancialYear[],
  notes: EditorialNotes = {},
): Pick<InvestorSlide, "eyebrow" | "groups" | "banner"> {
  const year = years[years.length - 1];
  const prior = years[years.length - 2];

  const margin = ebitdaMarginPct(year);

  const operating: HeroMetric[] = [
    {
      label: "Revenue",
      prefix: "₹",
      value: `${money(year.revenueCr)} Cr`,
      ...(trendOf(year.revenueCr, prior?.revenueCr)
        ? { trend: trendOf(year.revenueCr, prior?.revenueCr) }
        : {}),
      ...(prior
        ? { note: `From ₹${money(prior.revenueCr)} Cr in ${fyShort(prior.fy)}` }
        : {}),
    },
    {
      label: "EBITDA",
      prefix: "₹",
      value: `${money(year.ebitdaCr)} Cr`,
      ...(trendOf(year.ebitdaCr, prior?.ebitdaCr)
        ? { trend: trendOf(year.ebitdaCr, prior?.ebitdaCr) }
        : {}),
      note: `${money(margin, 1)}% of revenue`,
    },
  ];

  const returns: HeroMetric[] = [
    {
      label: "PAT",
      prefix: "₹",
      value: `${money(year.patCr)} Cr`,
      ...(trendOf(year.patCr, prior?.patCr)
        ? { trend: trendOf(year.patCr, prior?.patCr) }
        : {}),
      ...(prior
        ? { note: `₹${lakh(year.patCr)} against ₹${lakh(prior.patCr)}` }
        : {}),
    },
    {
      label: "EPS",
      prefix: "₹",
      value: money(year.eps),
      ...(trendOf(year.eps, prior?.eps)
        ? { trend: trendOf(year.eps, prior?.eps) }
        : {}),
      ...(prior
        ? { note: `Basic and diluted, from ₹${money(prior.eps)}` }
        : {}),
    },
  ];

  if (year.dividendPerShare > 0) {
    returns.push({
      label: "Dividend",
      prefix: "₹",
      value: money(year.dividendPerShare),
      note: "Per equity share",
    });
  }

  const groups: MetricGroup[] = [
    {
      heading: "Operating Performance",
      metrics: operating,
      ...(notes.operatingFootnote?.trim()
        ? { footnote: notes.operatingFootnote.trim() }
        : {}),
    },
    { heading: "Returns to Shareholders", metrics: returns },
  ];

  return {
    eyebrow: `MCIL ${fyLabel(year.fy)} Results`,
    groups,
    banner: {
      stats: [
        {
          label: `${fyShort(year.fy)} Revenue`,
          value: `₹ ${money(year.revenueCr)} Cr`,
        },
        { label: "Profit After Tax", value: `₹ ${money(year.patCr)} Cr` },
      ],
      footnote: `FY${year.fy - 1}-${String(year.fy).slice(2)}, as reported`,
    },
  };
}

/* --------------------------------------------------------------- highlights */

/** Scale a series into bar widths, holding the card's own top of scale. */
function barsFor(
  years: FinancialYear[],
  pick: (y: FinancialYear) => number,
  display: (y: FinancialYear) => string,
  scale: number,
): Bar[] {
  const shown = years.slice(-BAR_YEARS);
  const max = Math.max(...shown.map(pick));
  return shown.map((y) => ({
    label: `FY ${y.fy}`,
    percent: max ? Math.round((pick(y) / max) * scale) : 0,
    display: display(y),
  }));
}

export function deriveHighlights(
  years: FinancialYear[],
  notes: EditorialNotes = {},
): { heading: Heading; items: Highlight[] } {
  const year = years[years.length - 1];
  const prior = years[years.length - 2];

  const margin = ebitdaMarginPct(year);
  const payout = dividendPayoutPct(year);
  const revenueChange = changePct(year.revenueCr, prior?.revenueCr);

  /* "Down 7% on FY25, against ₹160.25 Cr in the prior year." */
  const revenueBody = prior
    ? `${revenueChange === null || Math.abs(revenueChange) < 0.05 ? "Level with" : revenueChange < 0 ? `Down ${money(Math.abs(revenueChange), 0)}% on` : `Up ${money(revenueChange, 0)}% on`} ${fyShort(prior.fy)}, against ₹${money(prior.revenueCr)} Cr in the prior year.`
    : `Revenue from operations for ${fyLabel(year.fy)}.`;

  const patBody = prior
    ? `₹${lakh(year.patCr)} against ₹${lakh(prior.patCr)} in the prior year.`
    : `Profit after tax for ${fyLabel(year.fy)}.`;

  const items: Highlight[] = [
    {
      id: "revenue",
      value: round(year.revenueCr, 2),
      decimals: 2,
      prefix: "₹ ",
      suffix: " Cr",
      title: "Revenue from Operations",
      body: notes.revenueBody?.trim() || revenueBody,
      visual: "mix",
      panelTitle: "Revenue by Year (₹ Cr)",
      bars: barsFor(
        years,
        (y) => y.revenueCr,
        (y) => money(y.revenueCr, 1),
        REVENUE_BAR_SCALE,
      ),
    },
    {
      id: "pat",
      value: round(year.patCr, 2),
      decimals: 2,
      prefix: "₹ ",
      suffix: " Cr",
      title: "Profit After Tax",
      body: notes.patBody?.trim() || patBody,
      visual: "gauge",
      gauge: {
        fill: round(Math.min(margin / GAUGE_FULL_SCALE_PCT, 1), 2),
        caption: `${money(margin, 1)}% EBITDA margin`,
      },
    },
    {
      id: "eps",
      value: round(year.eps, 2),
      decimals: 2,
      prefix: "₹ ",
      title: "Earnings Per Share",
      body: prior
        ? `Basic and diluted, ${year.eps >= prior.eps ? "up" : "down"} from ₹${money(prior.eps)} in ${fyShort(prior.fy)} on ${money(EQUITY_SHARES_LAKH)} lakh equity shares.`
        : `Basic and diluted, on ${money(EQUITY_SHARES_LAKH)} lakh equity shares.`,
      visual: "bars",
      bars: barsFor(
        years,
        (y) => y.eps,
        (y) => `₹ ${money(y.eps)}`,
        EPS_BAR_SCALE,
      ),
    },
    {
      id: "dividend",
      value: round(year.dividendPerShare, 2),
      decimals: 2,
      prefix: "₹ ",
      suffix: " per share",
      title: "Dividend Declared",
      body:
        year.dividendPerShare > 0
          ? `${money(dividendOnFacePct(year), 0)}% on face value, a total payout of ₹${lakh(dividendTotalCr(year))} — ${money(payout, 2)}% of profit after tax.`
          : `No dividend was declared for ${fyLabel(year.fy)}.`,
      visual: "thumbs",
      cta: { label: "See the Six-Year Trend", href: "#performance" },
    },
  ];

  return {
    heading: {
      eyebrow: fyLabel(year.fy),
      title: "The year in numbers",
      standfirst:
        notes.highlightsStandfirst?.trim() ||
        `Revenue, profit, earnings per share and the dividend for ${fyLabel(year.fy)}.`,
    },
    items,
  };
}

/* -------------------------------------------------------------- performance */

export function derivePerformance(years: FinancialYear[]): PerformanceMetric[] {
  const series = (
    id: string,
    label: string,
    kind: "currency" | "percent",
    pick: (y: FinancialYear) => number,
    places: number,
  ): PerformanceMetric => ({
    id,
    label,
    kind,
    points: years.map((y) => ({ year: y.fy, value: round(pick(y), places) })),
  });

  return [
    series("revenue", "Revenue", "currency", (y) => y.revenueCr, 1),
    series("ebitda", "EBITDA", "currency", (y) => y.ebitdaCr, 1),
    series("pat", "PAT", "currency", (y) => y.patCr, 2),
    series("eps", "EPS", "currency", (y) => y.eps, 2),
    series("ebitda-margin", "EBITDA Margin", "percent", ebitdaMarginPct, 1),
    series("dividend-payout", "Dividend Payout", "percent", dividendPayoutPct, 1),
  ];
}

/* ------------------------------------------------------------------ reports */

/**
 * The two rows a new annual report adds to Financials → Annual Report &
 * Audited Financial Results. `href` is the uploaded file, when there is one.
 */
export function deriveReportDocs(
  fy: number,
  href?: string,
  filedOn?: string,
): ReportDoc[] {
  const date = filedOn || `${fy}-08-14`;
  return [
    { title: `Annual Report ${fy}`, date, ...(href ? { href } : {}) },
    {
      title: `Audited Financial Results — 31.03.${fy}`,
      date: `${fy}-05-28`,
    },
  ];
}
