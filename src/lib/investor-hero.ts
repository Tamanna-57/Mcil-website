/**
 * Investor Relations hero.
 *
 * REAL FIGURES for FY2025-26, from MCIL's annual report. See
 * investor-performance.ts for the full sourcing note — the three investor
 * files share one series and must stay in step.
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
    eyebrow: "MCIL FY 2025-26 Results",
    headline: ["Strength in", "every coil"],
    cta: { label: "View Financials", href: "#financials" },
    image: "/images/hero-4.jpg",
    alt: "Cold rolled coils lining the MCIL warehouse aisle",
    position: "50% 55%",
    groups: [
      {
        heading: "Operating Performance",
        metrics: [
          {
            label: "Revenue",
            prefix: "₹",
            value: "148.98 Cr",
            trend: "down",
            note: "From ₹160.25 Cr in FY25",
          },
          {
            label: "EBITDA",
            prefix: "₹",
            value: "3.51 Cr",
            trend: "down",
            note: "2.4% of revenue",
          },
        ],
        footnote: "Revenue eased with steel prices through the year",
      },
      {
        heading: "Returns to Shareholders",
        metrics: [
          {
            label: "PAT",
            prefix: "₹",
            value: "2.40 Cr",
            trend: "up",
            note: "₹239.97 lakh against ₹236.96 lakh",
          },
          {
            label: "EPS",
            prefix: "₹",
            value: "3.28",
            trend: "up",
            note: "Basic and diluted, from ₹3.23",
          },
          {
            label: "Dividend",
            prefix: "₹",
            value: "1.00",
            note: "Per equity share",
          },
        ],
      },
    ],
    banner: {
      stats: [
        { label: "FY26 Revenue", value: "₹ 148.98 Cr" },
        { label: "Profit After Tax", value: "₹ 2.40 Cr" },
      ],
      footnote: "FY2025-26, as reported",
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
export const IR_SLIDE_DURATION = 5500;
