/**
 * "Highlights" band on the investor page.
 *
 * ⚠️ PLACEHOLDER DATA, as with investor-hero.ts. mcil.net publishes no headline
 * figures, so these are plausible numbers for a cold rolled steel maker of
 * MCIL's size, sized so the layout can be reviewed. Swap in audited results
 * before launch — only `value`, `decimals`, `prefix` and `suffix` need editing;
 * the counter reads them directly.
 */

export type Highlight = {
  /** The number the counter climbs to. */
  value: number;
  /** Decimal places to hold while counting and at rest. */
  decimals?: number;
  /** Rendered before the figure, e.g. "₹ ". */
  prefix?: string;
  /** Rendered after the figure, e.g. " Cr" or "%". */
  suffix?: string;
  /** Caption under the figure. */
  label: string;
};

export const highlightsHeading = {
  title: "Strength in numbers",
  standfirst: "Company Highlights FY26",
};

export const highlights: Highlight[] = [
  { value: 82, suffix: "%", label: "Capacity Utilisation" },
  { value: 486, prefix: "₹ ", suffix: " Cr", label: "Revenue" },
  { value: 34, prefix: "₹ ", suffix: " Cr", label: "Profit After Tax" },
  {
    value: 1.2,
    decimals: 1,
    suffix: " Lakh MT",
    label: "Installed Capacity",
  },
];

/** Milliseconds the counter takes to climb. */
export const COUNT_DURATION = 1800;
