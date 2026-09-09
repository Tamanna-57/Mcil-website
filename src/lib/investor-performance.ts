/**
 * "Performance over the years" chart on the investor page.
 *
 * ⚠️ PLACEHOLDER DATA. mcil.net publishes no historical figures, so this is a
 * plausible six-year run for a cold rolled steel maker of MCIL's size. The
 * FY26 endpoints line up with the highlights band above (revenue ₹486 Cr,
 * PAT ₹34 Cr, EBITDA margin 9.8%) so the page stays internally consistent —
 * keep them in step when the audited numbers land.
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
      { year: 2021, value: 268 },
      { year: 2022, value: 312 },
      { year: 2023, value: 359 },
      { year: 2024, value: 402 },
      { year: 2025, value: 441 },
      { year: 2026, value: 486 },
    ],
  },
  {
    id: "ebitda",
    label: "EBITDA",
    kind: "currency",
    points: [
      { year: 2021, value: 18.2 },
      { year: 2022, value: 22.6 },
      { year: 2023, value: 27.9 },
      { year: 2024, value: 33.4 },
      { year: 2025, value: 39.8 },
      { year: 2026, value: 47.6 },
    ],
  },
  {
    id: "pat",
    label: "PAT",
    kind: "currency",
    points: [
      { year: 2021, value: 8.4 },
      { year: 2022, value: 11.2 },
      { year: 2023, value: 15.1 },
      { year: 2024, value: 20.3 },
      { year: 2025, value: 26.7 },
      { year: 2026, value: 34.0 },
    ],
  },
  {
    id: "ebitda-margin",
    label: "EBITDA Margin",
    kind: "percent",
    points: [
      { year: 2021, value: 6.8 },
      { year: 2022, value: 7.2 },
      { year: 2023, value: 7.8 },
      { year: 2024, value: 8.3 },
      { year: 2025, value: 9.0 },
      { year: 2026, value: 9.8 },
    ],
  },
  {
    id: "dividend-payout",
    label: "Dividend Payout",
    kind: "percent",
    points: [
      { year: 2021, value: 10 },
      { year: 2022, value: 12 },
      { year: 2023, value: 12 },
      { year: 2024, value: 15 },
      { year: 2025, value: 15 },
      { year: 2026, value: 18 },
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
