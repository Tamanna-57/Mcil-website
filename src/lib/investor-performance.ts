/**
 * "Performance over the years" chart on the investor page.
 *
 * REAL FIGURES. Sources:
 *  - FY2025-26 and FY2024-25 from MCIL's FY2025-26 annual report: revenue from
 *    operations ₹14,897.55 / ₹16,025.02 lakh, EBITDA ₹350.96 / ₹604.29 lakh,
 *    PAT ₹239.97 / ₹236.96 lakh, EPS ₹3.28 / ₹3.23, dividend ₹1 per share
 *    (30.53% of PAT).
 *  - FY2020-21 to FY2023-24 from the published annual P&L (BSE 531810).
 *    PAT for those years is EPS x 73.27 lakh shares — the share count implied
 *    by the FY26 dividend (₹73.27 lakh paid at ₹1 per share), which reproduces
 *    both reported PAT figures to the paisa.
 *
 * EBITDA and margin use one definition across the whole series so the trend is
 * comparable year to year; that makes FY25 and FY26 read a little under the
 * annual report's own EBITDA, which is struck after other income.
 */

export type MetricKind = "currency" | "percent";

export type PerformanceMetric = {
  id: string;
  label: string;
  /** Currency metrics convert with the rate below; percentages never do. */
  kind: MetricKind;
  /** Values in ₹ crore for currency metrics, or percent for percentages. */
  points: { year: number; value: number }[];
};

/**
 * ₹1 crore in US$ million. A placeholder rate — swap for the closing rate the
 * annual report uses, and state it in the footnote.
 */
export const USD_MN_PER_INR_CR = 0.12;

export const performanceMetrics: PerformanceMetric[] = [
  {
    id: "revenue",
    label: "Revenue",
    kind: "currency",
    points: [
      { year: 2021, value: 94 },
      { year: 2022, value: 142 },
      { year: 2023, value: 170 },
      { year: 2024, value: 168 },
      { year: 2025, value: 160.3 },
      { year: 2026, value: 149.0 },
    ],
  },
  {
    id: "ebitda",
    label: "EBITDA",
    kind: "currency",
    points: [
      { year: 2021, value: 3.2 },
      { year: 2022, value: 3.1 },
      { year: 2023, value: 3.7 },
      { year: 2024, value: 3.2 },
      { year: 2025, value: 5.3 },
      { year: 2026, value: 3.5 },
    ],
  },
  {
    id: "pat",
    label: "PAT",
    kind: "currency",
    points: [
      { year: 2021, value: 2.57 },
      { year: 2022, value: 2.82 },
      { year: 2023, value: 2.76 },
      { year: 2024, value: 2.5 },
      { year: 2025, value: 2.37 },
      { year: 2026, value: 2.4 },
    ],
  },
  {
    id: "eps",
    label: "EPS",
    kind: "currency",
    points: [
      { year: 2021, value: 3.51 },
      { year: 2022, value: 3.85 },
      { year: 2023, value: 3.77 },
      { year: 2024, value: 3.41 },
      { year: 2025, value: 3.23 },
      { year: 2026, value: 3.28 },
    ],
  },
  {
    id: "ebitda-margin",
    label: "EBITDA Margin",
    kind: "percent",
    points: [
      { year: 2021, value: 3.4 },
      { year: 2022, value: 2.2 },
      { year: 2023, value: 2.2 },
      { year: 2024, value: 1.9 },
      { year: 2025, value: 3.3 },
      { year: 2026, value: 2.4 },
    ],
  },
  {
    id: "dividend-payout",
    label: "Dividend Payout",
    kind: "percent",
    points: [
      { year: 2021, value: 0 },
      { year: 2022, value: 0 },
      { year: 2023, value: 0 },
      { year: 2024, value: 0 },
      { year: 2025, value: 31 },
      { year: 2026, value: 30.5 },
    ],
  },
];

export const performanceHeading = {
  title: "MCIL Highlights",
  standfirst: "Performance over the years.",
};

/** EPS is per share, not in crore — the chart labels it accordingly. */
export const PER_SHARE_METRICS = new Set(["eps"]);

/** Milliseconds a bar takes to grow, and the gap between consecutive bars. */
export const BAR_GROW_DURATION = 850;
export const BAR_STAGGER = 110;
