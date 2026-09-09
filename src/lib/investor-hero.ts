/**
 * Investor Relations hero.
 *
 * ⚠️ EVERY NUMBER IN THIS FILE IS PLACEHOLDER DATA. mcil.net/investors.aspx
 * publishes only document categories — Policies/Codes & Unclaimed Dividend,
 * Stock Exchange Compliance, Letters Sent to Stock Exchange, and Financials —
 * with no headline figures to lift. The metrics below are plausible for a cold
 * rolled steel maker of MCIL's size and exist so the layout can be reviewed.
 * Replace them with audited results before this goes anywhere near production.
 *
 * The CTA targets map to the four real categories from the live site.
 */

export type HeroMetric = {
  /** Short label, set in a chip. Uppercase in the design. */
  label: string;
  /** Small word before the figure, e.g. "PAT". Optional. */
  prefix?: string;
  /** The figure itself, e.g. "24%". */
  value: string;
  /** Direction marker rendered before the value. */
  trend?: "up" | "down";
  /** Small line under the figure. Optional. */
  note?: string;
};

export type MetricGroup = {
  heading: string;
  metrics: HeroMetric[];
  /** Small caption closing the column. Optional. */
  footnote?: string;
};

export type BannerStat = {
  label: string;
  value: string;
  trend?: "up" | "down";
};

export type InvestorSlide = {
  id: string;
  /** Small letterspaced line above the headline. */
  eyebrow: string;
  /** Rendered one line per array entry. */
  headline: string[];
  /** Optional supporting line, used on the slides without a metrics panel. */
  standfirst?: string;
  cta: { label: string; href: string };
  image: string;
  alt: string;
  position: string;
  /** Only the results slide carries the metrics panel, as in the reference. */
  groups?: MetricGroup[];
  banner?: { stats: BannerStat[]; footnote?: string };
};

export const investorSlides: InvestorSlide[] = [
  {
    id: "results",
    eyebrow: "MCIL FY26 Results",
    headline: ["Strength in", "every coil"],
    cta: { label: "View Financials", href: "#financials" },
    image: "/images/hero-4.jpg",
    alt: "Cold rolled coils lining the MCIL warehouse aisle",
    position: "50% 55%",
    groups: [
      {
        heading: "Operating Performance",
        metrics: [
          { label: "Despatches", prefix: "Vol", value: "18%", trend: "up" },
          {
            label: "Capacity",
            prefix: "Utilisation",
            value: "82%",
            note: "Cold rolling and HRPO lines combined",
          },
        ],
        footnote: "Led by auto component and white goods demand",
      },
      {
        heading: "Financial Momentum",
        metrics: [
          {
            label: "Revenue",
            prefix: "YoY",
            value: "24%",
            trend: "up",
            note: "FY26 over FY25",
          },
          {
            label: "EBITDA",
            prefix: "YoY",
            value: "31%",
            trend: "up",
            note: "Margin expansion of 140 bps",
          },
          { label: "PAT", prefix: "YoY", value: "2.1x", trend: "up" },
        ],
      },
    ],
    banner: {
      stats: [
        { label: "FY26 Revenue", value: "24%", trend: "up" },
        { label: "EBITDA Margin", value: "9.8%" },
      ],
      footnote: "*Placeholder figures — pending audited results",
    },
  },
  {
    id: "compliance",
    eyebrow: "Regulatory Disclosures",
    headline: ["Transparency", "by default"],
    standfirst:
      "Stock exchange filings, shareholding patterns and the letters we send to the exchange — published as they are filed.",
    cta: { label: "Browse Filings", href: "#compliance" },
    image: "/images/hero-2.jpg",
    alt: "Cold rolled steel coils stacked down the finished goods bay",
    position: "55% 50%",
  },
  {
    id: "governance",
    eyebrow: "Policies, Codes & Unclaimed Dividend",
    headline: ["Governed", "in the open"],
    standfirst:
      "Board policies, the code of conduct and unclaimed dividend records, kept current for every shareholder.",
    cta: { label: "Read the Policies", href: "#policies" },
    image: "/images/hero-3.jpg",
    alt: "Bundled steel stock staged across the warehouse floor",
    position: "50% 60%",
  },
];

/** Milliseconds each slide holds before advancing. Mirrors --ir-slide-duration. */
export const IR_SLIDE_DURATION = 8000;
