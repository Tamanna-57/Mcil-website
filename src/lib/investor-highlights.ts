/**
 * "Highlights" bento on the investor page.
 *
 * REAL FIGURES for FY2025-26, from MCIL's annual report and the published
 * annual P&L (BSE 531810). See investor-performance.ts for the full sourcing
 * note; the two files share the same series and must stay in step.
 *
 * Nothing here is invented. Where a figure could not be sourced — plant
 * capacity, end-market split — the card was changed rather than filled in.
 */

export type Bar = {
  label: string;
  /** Bar width, 0-100. For series that are not percentages this is scaled. */
  percent: number;
  /** Optional label shown instead of "<percent>%", e.g. "₹ 3.28". */
  display?: string;
};

export type Highlight = {
  id: string;
  /** The number the counter climbs to. */
  value: number;
  /** Decimal places to hold while counting and at rest. */
  decimals?: number;
  /** Rendered before the figure, e.g. "₹ ". */
  prefix?: string;
  /** Rendered after the figure. */
  suffix?: string;
  /** Whether the suffix is set small and raised, as "%" is in the reference. */
  suffixSmall?: boolean;
  title: string;
  body: string;
  /** Which supporting graphic the card carries. */
  visual: "mix" | "gauge" | "bars" | "thumbs";
  /** Heading above the panel on the tall card. */
  panelTitle?: string;
  /** visual: "gauge" — arc fill 0-1, plus its caption. */
  gauge?: { fill: number; caption: string };
  /** visual: "bars" and "mix". */
  bars?: Bar[];
  /** visual: "thumbs". */
  cta?: { label: string; href: string };
};

export const highlightsHeading = {
  eyebrow: "FY 2025-26",
  title: "The year in numbers",
  standfirst:
    "Revenue eased with steel prices while profit and the dividend held steady.",
};

export const highlights: Highlight[] = [
  {
    id: "revenue",
    value: 148.98,
    decimals: 2,
    prefix: "₹ ",
    suffix: " Cr",
    title: "Revenue from Operations",
    body: "Down 7% on FY25 as steel prices softened through the year, against ₹160.25 Cr in the prior year.",
    visual: "mix",
    panelTitle: "Revenue by Year (₹ Cr)",
    bars: [
      { label: "FY 2023", percent: 88, display: "170" },
      { label: "FY 2024", percent: 87, display: "168" },
      { label: "FY 2025", percent: 83, display: "160.3" },
      { label: "FY 2026", percent: 77, display: "149.0" },
    ],
  },
  {
    id: "pat",
    value: 2.4,
    decimals: 2,
    prefix: "₹ ",
    suffix: " Cr",
    title: "Profit After Tax",
    body: "Held steady at ₹239.97 lakh against ₹236.96 lakh, helped by a sharp fall in finance costs.",
    visual: "gauge",
    gauge: { fill: 0.47, caption: "2.4% EBITDA margin" },
  },
  {
    id: "eps",
    value: 3.28,
    decimals: 2,
    prefix: "₹ ",
    title: "Earnings Per Share",
    body: "Basic and diluted, up from ₹3.23 in FY25 on 73.27 lakh equity shares.",
    visual: "bars",
    bars: [
      { label: "FY 2023", percent: 100, display: "₹ 3.77" },
      { label: "FY 2024", percent: 90, display: "₹ 3.41" },
      { label: "FY 2025", percent: 86, display: "₹ 3.23" },
      { label: "FY 2026", percent: 87, display: "₹ 3.28" },
    ],
  },
  {
    id: "dividend",
    value: 1,
    decimals: 2,
    prefix: "₹ ",
    suffix: " per share",
    title: "Dividend Declared",
    body: "10% on face value, a total payout of ₹73.27 lakh — 30.53% of profit after tax.",
    visual: "thumbs",
    cta: { label: "See the Six-Year Trend", href: "#performance" },
  },
];

/** Milliseconds the counter takes to climb. */
export const COUNT_DURATION = 1800;
