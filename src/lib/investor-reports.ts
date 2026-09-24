/**
 * "Latest Reports" — the document library on the investor page.
 *
 * The four categories and their sub-categories mirror the old mcil.net
 * investor section exactly, so the structure a shareholder already knows is
 * preserved.
 *
 * The categories and their documents are listed in
 * `investor-report-categories.ts`; this file holds the types and settings the
 * page component shares with it, and stays small because that component
 * ships to the browser.
 *
 * Filings dated before `ARCHIVE_BEFORE` are listed under their own
 * "Archives" tab rather than in the everyday lists.
 */

export type ReportDoc = {
  title: string;
  /**
   * ISO yyyy-mm-dd. Not printed anywhere — the titles carry the year
   * themselves — but it is what the list is ordered by, newest first, and
   * what moves a filing into Archives.
   */
  date: string;
  /** URL of the file to download. Absent until the document is available. */
  href?: string;
};

export type ReportSubCategory = {
  id: string;
  label: string;
  docs: ReportDoc[];
};

export type ReportCategory = {
  /** Also the anchor the hero CTAs and header menu link to. */
  id: string;
  /** Set in the tab row. */
  label: string;
  /** Short line under the tabs, giving the category context. */
  blurb: string;
  subCategories: ReportSubCategory[];
};

export const reportsHeading = {
  eyebrow: "Investor Documents",
  title: "Latest Reports",
  standfirst:
    "Financial results, exchange filings, board letters and governance records — grouped the way they are filed.",
};

/** Rows shown before "View All" expands the sub-category in place. */
export const REPORTS_PAGE_SIZE = 5;

/**
 * Filings dated before this (ISO yyyy-mm-dd) leave the everyday lists and show
 * under the Archives tab instead. Every one stays downloadable.
 */
export const ARCHIVE_BEFORE = "2018-03-01";

/** A row with no date cannot be placed, so it stays in the everyday list. */
export function isArchived(doc: ReportDoc): boolean {
  return Boolean(doc.date) && doc.date < ARCHIVE_BEFORE;
}
