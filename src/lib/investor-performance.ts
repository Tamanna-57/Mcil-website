/**
 * "Performance over the years" chart on the investor page.
 *
 * ⚠️ PLACEHOLDER DATA. MCIL publishes results only as scanned PDFs, so no
 * machine-readable history was available. This is a plausible six-year run for
 * a plant of MCIL's real 7,400 TPA capacity. The FY26 endpoints line up with
 * the bento above (revenue ₹44 Cr, PAT ₹1.8 Cr, EBITDA margin 9.1%) so the
 * page stays internally consistent — keep them in step when audited numbers
 * land.
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
      { year: 2021, value: 26 },
      { year: 2022, value: 30 },
      { year: 2023, value: 34 },
      { year: 2024, value: 37 },
      { year: 2025, value: 40 },
      { year: 2026, value: 44 },
    ],
  },
  {
    id: "ebitda",
    label: "EBITDA",
    kind: "currency",
    points: [
      { year: 2021, value: 1.6 },
      { year: 2022, value: 2.0 },
      { year: 2023, value: 2.4 },
      { year: 2024, value: 2.8 },
      { year: 2025, value: 3.3 },
      { year: 2026, value: 4.0 },
    ],
  },
  {
    id: "pat",
    label: "PAT",
    kind: "currency",
    points: [
      { year: 2021, value: 0.5 },
      { year: 2022, value: 0.7 },
      { year: 2023, value: 0.9 },
      { year: 2024, value: 1.2 },
      { year: 2025, value: 1.5 },
      { year: 2026, value: 1.8 },
    ],
  },
  {
    id: "ebitda-margin",
    label: "EBITDA Margin",
    kind: "percent",
    points: [
      { year: 2021, value: 6.2 },
      { year: 2022, value: 6.7 },
      { year: 2023, value: 7.1 },
      { year: 2024, value: 7.6 },
      { year: 2025, value: 8.2 },
      { year: 2026, value: 9.1 },
    ],
  },
  {
    id: "dividend-payout",
    label: "Dividend Payout",
    kind: "percent",
    points: [
      { year: 2021, value: 10 },
      { year: 2022, value: 10 },
      { year: 2023, value: 12 },
      { year: 2024, value: 12 },
      { year: 2025, value: 15 },
      { year: 2026, value: 15 },
    ],
  },
];

export const performanceHeading = {
  title: "MCIL Highlights",
  standfirst: "Performance over the years.",
};

/** Milliseconds a bar takes to grow, and the gap between consecutive bars. */
export const BAR_GROW_DURATION = 850;
export const BAR_STAGGER = 110;
