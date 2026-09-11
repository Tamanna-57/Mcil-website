/**
 * "Latest Reports" — the document library on the investor page.
 *
 * The four categories and their sub-categories mirror the live mcil.net
 * investor section exactly, so the structure a shareholder already knows is
 * preserved. The documents themselves are PLACEHOLDERS: titles and dates are
 * shaped like the real filings, but no file is attached yet.
 *
 * Adding the real thing later is a two-field edit per row — set `href` to the
 * PDF's path under `public/` (e.g. "/docs/annual-report-2026.pdf") and the row
 * turns into a live download on its own. Rows without an `href` render with an
 * inert Download control, so an unfilled row reads as pending rather than
 * broken. Nothing here points back at mcil.net.
 */

export type ReportDoc = {
  title: string;
  /** ISO yyyy-mm-dd. Formatted for display; also what the list sorts on. */
  date: string;
  /** Path to the file under `public/`. Absent until the document is uploaded. */
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

export const reportCategories: ReportCategory[] = [
  {
    id: "financials",
    label: "Financials",
    blurb:
      "Annual reports and the audited and unaudited results, as filed with the exchange.",
    subCategories: [
      {
        id: "annual-audited",
        label: "Annual Report & Audited Financial Results",
        docs: [
          { title: "Annual Report 2026", date: "2026-08-14" },
          {
            title: "Audited Financial Results — 31.03.2026",
            date: "2026-05-28",
          },
          { title: "Annual Report 2025", date: "2025-08-12" },
          {
            title: "Audited Financial Results — 31.03.2025",
            date: "2025-05-27",
          },
          { title: "Annual Report 2024", date: "2024-08-13" },
          {
            title: "Audited Financial Results — 31.03.2024",
            date: "2024-05-29",
          },
          { title: "Annual Report 2023", date: "2023-08-11" },
          {
            title: "Audited Financial Results — 31.03.2023",
            date: "2023-05-30",
          },
        ],
      },
      {
        id: "unaudited",
        label: "Unaudited Financial Results",
        docs: [
          {
            title: "Unaudited Financial Results — 30.06.2026",
            date: "2026-08-07",
          },
          {
            title: "Unaudited Financial Results — 31.12.2025",
            date: "2026-02-10",
          },
          {
            title: "Unaudited Financial Results — 30.09.2025",
            date: "2025-11-11",
          },
          {
            title: "Unaudited Financial Results — 30.06.2025",
            date: "2025-08-08",
          },
          {
            title: "Unaudited Financial Results — 31.12.2024",
            date: "2025-02-11",
          },
          {
            title: "Unaudited Financial Results — 30.09.2024",
            date: "2024-11-12",
          },
        ],
      },
    ],
  },
  {
    id: "compliance",
    label: "Stock Exchange Compliance",
    blurb:
      "Quarterly and annual disclosures filed under the SEBI Listing Regulations.",
    subCategories: [
      {
        id: "integrated-filing",
        label: "Integrated Filing Report",
        docs: [
          {
            title: "Integrated Filing (Financial) — 30.06.2026",
            date: "2026-08-07",
          },
          {
            title: "Integrated Filing (Governance) — 31.03.2026",
            date: "2026-04-21",
          },
          {
            title: "Integrated Filing (Financial) — 31.12.2025",
            date: "2026-02-10",
          },
          {
            title: "Integrated Filing (Governance) — 31.12.2025",
            date: "2026-01-20",
          },
        ],
      },
      {
        id: "shareholding-pattern",
        label: "Shareholding Pattern",
        docs: [
          { title: "Shareholding Pattern — 30.06.2026", date: "2026-07-16" },
          { title: "Shareholding Pattern — 31.03.2026", date: "2026-04-15" },
          { title: "Shareholding Pattern — 31.12.2025", date: "2026-01-14" },
          {
            title: "Shareholding Pattern — 30.09.2025 (Revised)",
            date: "2025-10-24",
          },
          { title: "Shareholding Pattern — 30.09.2025", date: "2025-10-15" },
          { title: "Shareholding Pattern — 30.06.2025", date: "2025-07-16" },
        ],
      },
      {
        id: "corporate-governance",
        label: "Corporate Governance Report",
        docs: [
          {
            title: "Corporate Governance Report — 30.06.2026",
            date: "2026-07-16",
          },
          {
            title: "Corporate Governance Report — 31.03.2026",
            date: "2026-04-15",
          },
          {
            title: "Corporate Governance Report — 31.12.2025",
            date: "2026-01-14",
          },
          {
            title: "Corporate Governance Report — 30.09.2025",
            date: "2025-10-15",
          },
        ],
      },
      {
        id: "secretarial-compliance",
        label: "Secretarial Compliance Report",
        docs: [
          {
            title: "Annual Secretarial Compliance Report — FY 2025-26",
            date: "2026-05-28",
          },
          {
            title: "Annual Secretarial Compliance Report — FY 2024-25",
            date: "2025-05-27",
          },
          {
            title: "Annual Secretarial Compliance Report — FY 2023-24",
            date: "2024-05-29",
          },
        ],
      },
      {
        id: "agm",
        label: "AGM",
        docs: [
          {
            title: "Notice of the 31st Annual General Meeting",
            date: "2026-08-14",
          },
          {
            title: "AGM Voting Results & Scrutiniser's Report — 2025",
            date: "2025-09-26",
          },
          {
            title: "Notice of the 30th Annual General Meeting",
            date: "2025-08-12",
          },
          {
            title: "AGM Voting Results & Scrutiniser's Report — 2024",
            date: "2024-09-27",
          },
        ],
      },
      {
        id: "shareholder-information",
        label: "Shareholder Information",
        docs: [
          {
            title: "Details of the Registrar & Share Transfer Agent",
            date: "2026-04-15",
          },
          {
            title: "Investor Contact & Grievance Redressal",
            date: "2026-04-15",
          },
          {
            title: "Dematerialisation & Transfer Procedure",
            date: "2025-10-15",
          },
          { title: "Nomination & Bank Mandate Guidance", date: "2025-07-16" },
        ],
      },
      {
        id: "committee-of-directors",
        label: "Committee of Directors",
        docs: [
          {
            title: "Composition of Board Committees — FY 2025-26",
            date: "2026-04-15",
          },
          { title: "Terms of Reference — Audit Committee", date: "2025-08-12" },
          {
            title: "Terms of Reference — Nomination & Remuneration Committee",
            date: "2025-08-12",
          },
          {
            title: "Terms of Reference — Stakeholders Relationship Committee",
            date: "2025-08-12",
          },
        ],
      },
      {
        id: "investor-complaints",
        label: "Investors Complaint Report",
        docs: [
          {
            title: "Investor Complaints Statement — 30.06.2026",
            date: "2026-07-16",
          },
          {
            title: "Investor Complaints Statement — 31.03.2026",
            date: "2026-04-15",
          },
          {
            title: "Investor Complaints Statement — 31.12.2025",
            date: "2026-01-14",
          },
          {
            title: "Investor Complaints Statement — 30.09.2025",
            date: "2025-10-15",
          },
        ],
      },
      {
        id: "share-capital-audit",
        label: "Reconciliation of Share Capital Audit Report",
        docs: [
          {
            title: "Reconciliation of Share Capital Audit — 30.06.2026",
            date: "2026-07-16",
          },
          {
            title: "Reconciliation of Share Capital Audit — 31.03.2026",
            date: "2026-04-15",
          },
          {
            title: "Reconciliation of Share Capital Audit — 31.12.2025",
            date: "2026-01-14",
          },
          {
            title: "Reconciliation of Share Capital Audit — 30.09.2025",
            date: "2025-10-15",
          },
        ],
      },
      {
        id: "sast",
        label: "SAST",
        docs: [
          {
            title:
              "Disclosure under Regulation 31(4) of SEBI (SAST) — FY 2025-26",
            date: "2026-04-10",
          },
          {
            title:
              "Disclosure under Regulation 31(4) of SEBI (SAST) — FY 2024-25",
            date: "2025-04-11",
          },
          {
            title:
              "Disclosure under Regulation 31(4) of SEBI (SAST) — FY 2023-24",
            date: "2024-04-12",
          },
        ],
      },
      {
        id: "familiarisation",
        label: "Familiarisation Programme",
        docs: [
          {
            title:
              "Familiarisation Programme for Independent Directors — FY 2025-26",
            date: "2026-04-15",
          },
          {
            title:
              "Familiarisation Programme for Independent Directors — FY 2024-25",
            date: "2025-04-15",
          },
          {
            title:
              "Familiarisation Programme for Independent Directors — FY 2023-24",
            date: "2024-04-15",
          },
        ],
      },
      {
        id: "credit-ratings",
        label: "Credit Ratings",
        docs: [
          { title: "Credit Rating Review — FY 2025-26", date: "2026-06-18" },
          { title: "Credit Rating Review — FY 2024-25", date: "2025-06-19" },
          { title: "Credit Rating Review — FY 2023-24", date: "2024-06-20" },
        ],
      },
      {
        id: "compliance-others",
        label: "Others",
        docs: [
          { title: "Annual Return — FY 2025-26", date: "2026-09-04" },
          {
            title: "Business Responsibility & Sustainability Disclosures",
            date: "2026-08-14",
          },
          {
            title: "Related Party Transactions — Half Year Ended 31.03.2026",
            date: "2026-05-28",
          },
          {
            title: "Related Party Transactions — Half Year Ended 30.09.2025",
            date: "2025-11-11",
          },
        ],
      },
    ],
  },
  {
    id: "letters",
    label: "Letters Sent to Stock Exchange",
    blurb:
      "Board meeting intimations, outcomes and newspaper publications, filed as they are issued.",
    subCategories: [
      {
        id: "intimation",
        label: "Intimation",
        docs: [
          {
            title: "Intimation of Board Meeting — 05.08.2026",
            date: "2026-07-29",
          },
          {
            title: "Intimation of Book Closure & Record Date",
            date: "2026-07-16",
          },
          {
            title: "Intimation of Board Meeting — 26.05.2026",
            date: "2026-05-18",
          },
          {
            title: "Intimation of Board Meeting — 06.02.2026",
            date: "2026-01-29",
          },
          { title: "Intimation of Trading Window Closure", date: "2025-12-31" },
        ],
      },
      {
        id: "outcome",
        label: "Outcome",
        docs: [
          {
            title: "Outcome of Board Meeting — 05.08.2026",
            date: "2026-08-05",
          },
          {
            title: "Outcome of Board Meeting — 26.05.2026",
            date: "2026-05-26",
          },
          {
            title: "Outcome of Board Meeting — 06.02.2026",
            date: "2026-02-06",
          },
          {
            title: "Outcome of Board Meeting — 07.11.2025",
            date: "2025-11-07",
          },
          {
            title: "Outcome of Board Meeting — 06.08.2025",
            date: "2025-08-06",
          },
        ],
      },
      {
        id: "newspaper",
        label: "Newspaper Publication",
        docs: [
          {
            title: "Newspaper Publication — Audited Results FY 2025-26",
            date: "2026-05-29",
          },
          {
            title: "Newspaper Publication — Notice of Board Meeting",
            date: "2026-05-19",
          },
          {
            title: "Newspaper Publication — Unaudited Results Q3 FY26",
            date: "2026-02-07",
          },
          {
            title: "Newspaper Publication — Unaudited Results Q2 FY26",
            date: "2025-11-08",
          },
        ],
      },
      {
        id: "letters-others",
        label: "Others",
        docs: [
          {
            title: "Certificate under Regulation 74(5) — 30.06.2026",
            date: "2026-07-09",
          },
          {
            title: "Certificate under Regulation 40(9) — FY 2025-26",
            date: "2026-04-24",
          },
          {
            title: "Intimation of Change in Registered Office Contact Details",
            date: "2025-12-12",
          },
          {
            title: "Certificate under Regulation 74(5) — 31.12.2025",
            date: "2026-01-08",
          },
        ],
      },
    ],
  },
  {
    id: "policies",
    label: "Policies, Code & Unclaimed Dividend",
    blurb:
      "Board policies, the codes of conduct, investor forms and the unclaimed dividend record.",
    subCategories: [
      {
        id: "policies-list",
        label: "Policies",
        docs: [
          { title: "Policy on Related Party Transactions", date: "2026-04-15" },
          {
            title: "Whistle Blower & Vigil Mechanism Policy",
            date: "2025-08-12",
          },
          {
            title: "Policy on Determination of Materiality of Events",
            date: "2025-08-12",
          },
          { title: "Nomination & Remuneration Policy", date: "2024-08-13" },
          {
            title: "Policy on Preservation of Documents & Archival",
            date: "2024-08-13",
          },
          { title: "Risk Management Policy", date: "2023-08-11" },
        ],
      },
      {
        id: "code",
        label: "Code",
        docs: [
          {
            title: "Code of Conduct for Directors & Senior Management",
            date: "2025-08-12",
          },
          {
            title: "Code of Conduct for Prevention of Insider Trading",
            date: "2025-08-12",
          },
          {
            title: "Code of Practices & Procedures for Fair Disclosure",
            date: "2024-08-13",
          },
          {
            title: "Code of Conduct for Independent Directors",
            date: "2024-08-13",
          },
        ],
      },
      {
        id: "unclaimed-dividend",
        label: "Unclaimed Dividend",
        docs: [
          { title: "Unclaimed Dividend — FY 2025-26", date: "2026-09-04" },
          { title: "Unclaimed Dividend — FY 2024-25", date: "2025-09-05" },
          { title: "Unclaimed Dividend — FY 2023-24", date: "2024-09-06" },
          {
            title: "Details of Shares Transferred to IEPF",
            date: "2024-09-06",
          },
        ],
      },
      {
        id: "investor-forms",
        label: "Investor Forms",
        docs: [
          {
            title: "Form ISR-1 — Registration of PAN, KYC & Bank Details",
            date: "2026-04-15",
          },
          {
            title: "Form ISR-2 — Confirmation of Signature by the Bank",
            date: "2026-04-15",
          },
          {
            title: "Form ISR-3 — Declaration to Opt Out of Nomination",
            date: "2026-04-15",
          },
          { title: "Form SH-13 — Nomination", date: "2025-08-12" },
          {
            title: "Form IEPF-5 — Claim of Unclaimed Dividend",
            date: "2025-08-12",
          },
        ],
      },
    ],
  },
];

/** "2026-08-14" -> "14 August 2026", the format the list sets dates in. */
export function formatReportDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
