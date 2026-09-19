/**
 * One record per financial year — the single source the investor page's
 * figures are generated from.
 *
 * Until now the same year's numbers were typed into three files by hand
 * (`investor-hero.ts`, `investor-highlights.ts`, `investor-performance.ts`),
 * each with its own rounding, and a new year meant editing all three plus the
 * reports list without missing anything. A year is described once here instead,
 * and `derive.ts` turns the series into the shapes those panels already expect.
 *
 * FIGURES ARE HELD IN ₹ CRORE, unrounded. Indian annual reports state their
 * numbers in ₹ lakh, so the importer divides by 100 on the way in. Keeping the
 * precise figure matters because the same number is shown at two precisions —
 * the hero reads "₹ 148.98 Cr" while the chart reads "149.0" — and rounding at
 * the source would make one of them wrong.
 *
 * The seed below reproduces exactly what the investor page renders today; see
 * `investor-performance.ts` for the sourcing of each year.
 */

export type FinancialYear = {
  /** The year the financial year ends in: 2026 means FY 2025-26. */
  fy: number;
  /** Revenue from operations, ₹ crore. */
  revenueCr: number;
  /** EBITDA, ₹ crore. */
  ebitdaCr: number;
  /** Profit after tax, ₹ crore. */
  patCr: number;
  /** Earnings per share, basic and diluted, in ₹. */
  eps: number;
  /** Dividend declared per equity share, ₹. Zero when none was declared. */
  dividendPerShare: number;
};

/**
 * Oldest first. `derive.ts` reads the last entry as the reported year, so a new
 * year is appended rather than inserted.
 *
 * FY2025's EBITDA is the series-consistent figure (₹5.3 Cr), not the ₹6.04 Cr
 * the FY2025-26 annual report strikes after other income. That is deliberate
 * and predates this file — the chart holds one EBITDA definition across all six
 * years so the trend is comparable, and FY2025's EBITDA is shown nowhere else.
 */
export const financialYears: FinancialYear[] = [
  {
    fy: 2021,
    revenueCr: 94,
    ebitdaCr: 3.2,
    patCr: 2.57,
    eps: 3.51,
    dividendPerShare: 0,
  },
  {
    fy: 2022,
    revenueCr: 142,
    ebitdaCr: 3.1,
    patCr: 2.82,
    eps: 3.85,
    dividendPerShare: 0,
  },
  {
    fy: 2023,
    revenueCr: 170,
    ebitdaCr: 3.7,
    patCr: 2.76,
    eps: 3.77,
    dividendPerShare: 0,
  },
  {
    fy: 2024,
    revenueCr: 168,
    ebitdaCr: 3.2,
    patCr: 2.5,
    eps: 3.41,
    dividendPerShare: 0,
  },
  {
    fy: 2025,
    revenueCr: 160.2502,
    ebitdaCr: 5.3,
    patCr: 2.3696,
    eps: 3.23,
    dividendPerShare: 1,
  },
  {
    fy: 2026,
    revenueCr: 148.9755,
    ebitdaCr: 3.5096,
    patCr: 2.3997,
    eps: 3.28,
    dividendPerShare: 1,
  },
];

/* ------------------------------------------------------- company constants */

/**
 * Figures that describe the share capital rather than a year's trading, and
 * that the annual report restates unchanged each year.
 *
 * 73.27 lakh shares is what the FY2025-26 report implies — ₹73.27 lakh paid at
 * ₹1 per share — and reproduces the 30.53% payout it states, to the paisa.
 * Change these only if the capital structure itself changes.
 */
export const EQUITY_SHARES_LAKH = 73.27;
export const FACE_VALUE = 10;

/* ------------------------------------------------------------- derived bits */

/** EBITDA as a percentage of revenue. Zero revenue would be a parse failure. */
export function ebitdaMarginPct(year: FinancialYear): number {
  return year.revenueCr ? (year.ebitdaCr / year.revenueCr) * 100 : 0;
}

/** Total dividend paid across all equity shares, ₹ crore. */
export function dividendTotalCr(year: FinancialYear): number {
  return (year.dividendPerShare * EQUITY_SHARES_LAKH) / 100;
}

/**
 * Dividend as a percentage of profit.
 *
 * Struck on the total payout rather than per-share dividend over EPS, because
 * EPS is reported rounded to the paisa and the per-share route inherits that
 * error — it gives 30.49% for FY2026 where the annual report states 30.53%.
 */
export function dividendPayoutPct(year: FinancialYear): number {
  return year.patCr ? (dividendTotalCr(year) / year.patCr) * 100 : 0;
}

/** Dividend as a percentage of face value — "10% on face value". */
export function dividendOnFacePct(year: FinancialYear): number {
  return (year.dividendPerShare / FACE_VALUE) * 100;
}

/** "FY 2025-26", the form the annual report and the page both use. */
export function fyLabel(fy: number): string {
  return `FY ${fy - 1}-${String(fy).slice(2)}`;
}

/** "FY25" — the short form the hero's comparison notes use. */
export function fyShort(fy: number): string {
  return `FY${String(fy).slice(2)}`;
}

/** Round half-up to `places`, so display and stored figures never disagree. */
export function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** "148.98" — a figure at fixed precision, grouped the Indian way. */
export function money(value: number, places = 2): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });
}

/** Percentage change against the prior year, or null when there is no prior. */
export function changePct(
  current: number,
  previous: number | undefined,
): number | null {
  if (previous === undefined || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
