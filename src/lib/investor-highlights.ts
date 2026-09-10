/**
 * "Highlights" bento on the investor page.
 *
 * ⚠️ PLACEHOLDER DATA, as with investor-hero.ts. mcil.net publishes no headline
 * figures, so these are plausible numbers for a cold rolled steel maker of
 * MCIL's size. The values line up with investor-performance.ts so the page
 * stays internally consistent — keep them in step when the audited numbers
 * land. Only `value`, `decimals`, `prefix` and `suffix` drive the counter.
 */

export type Bar = { label: string; percent: number };

export type Highlight = {
  id: string;
  /** The number the counter climbs to. */
  value: number;
  /** Decimal places to hold while counting and at rest. */
  decimals?: number;
  /** Rendered before the figure, e.g. "₹ ". */
  prefix?: string;
  /** Rendered after the figure. Set small when it should sit as a superscript. */
  suffix?: string;
  /** Whether the suffix is set small and raised, as "%" is in the reference. */
  suffixSmall?: boolean;
  title: string;
  body: string;
  /** Which supporting graphic the card carries. */
  visual: "mix" | "gauge" | "bars" | "thumbs";
  /** visual: "gauge" — arc fill 0-1, plus its caption. */
  gauge?: { fill: number; caption: string };
  /** visual: "bars" and "mix". */
  bars?: Bar[];
  /** visual: "thumbs". */
  cta?: { label: string; href: string };
};

export const highlightsHeading = {
  eyebrow: "FY26",
  title: "Strength in numbers",
  standfirst:
    "Six years of steady expansion across cold rolling, HRPO and galvanising.",
};

export const highlights: Highlight[] = [
  {
    id: "capacity",
    value: 82,
    suffix: "%",
    suffixSmall: true,
    title: "Running Near Capacity",
    body: "Cold rolling and HRPO lines held above four-fifths of design capacity through the year.",
    visual: "mix",
    bars: [
      { label: "Cold Rolled", percent: 46 },
      { label: "HRPO", percent: 24 },
      { label: "Galvanised", percent: 18 },
      { label: "Precision Strips", percent: 12 },
    ],
  },
  {
    id: "revenue",
    value: 486,
    prefix: "₹ ",
    suffix: " Cr",
    title: "Revenue",
    body: "FY26 turnover, up 24% on the prior year on stronger despatch volumes.",
    visual: "gauge",
    gauge: { fill: 0.8, caption: "+24% year on year" },
  },
  {
    id: "pat",
    value: 34,
    prefix: "₹ ",
    suffix: " Cr",
    title: "Profit After Tax",
    body: "Margin expansion of 140 bps lifted profit 2.1x over FY25.",
    visual: "bars",
    bars: [
      { label: "Auto Components", percent: 46 },
      { label: "White Goods", percent: 28 },
      { label: "Electrical & Power", percent: 26 },
    ],
  },
  {
    id: "installed",
    value: 1.2,
    decimals: 1,
    suffix: " Lakh MT",
    title: "Installed Capacity",
    body: "Across cold rolling, HRPO and galvanising lines, supplying manufacturers nationwide.",
    visual: "thumbs",
    cta: { label: "View Financials", href: "#performance" },
  },
];

/** Milliseconds the counter takes to climb. */
export const COUNT_DURATION = 1800;
