import importedDocs from "./investor-report-docs.json";
import type { ReportCategory, ReportDoc } from "./investor-reports";

/**
 * The shipped report library: the four categories and sub-categories of the
 * old mcil.net investor section, and every filing that was on it.
 *
 * The filings come from `investor-report-docs.json`, which
 * `tools/old-reports/build.py` generates — see the README there. Each `href`
 * is a `/reports/...` path: the file itself sits in the site's bucket and the
 * `/reports` route sends the visitor on to it. Nothing here points back at
 * mcil.net.
 *
 * This is the baseline the admin panel edits from. It is kept out of
 * `investor-reports.ts` so the page component, which runs in the browser,
 * does not carry a second copy of every row in its bundle.
 */

const reportDocs: Record<string, ReportDoc[]> = importedDocs;

function docsFor(subCategoryId: string): ReportDoc[] {
  return reportDocs[subCategoryId] ?? [];
}

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
        docs: docsFor("annual-audited"),
      },
      {
        id: "unaudited",
        label: "Unaudited Financial Results",
        docs: docsFor("unaudited"),
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
        docs: docsFor("integrated-filing"),
      },
      {
        id: "shareholding-pattern",
        label: "Shareholding Pattern",
        docs: docsFor("shareholding-pattern"),
      },
      {
        id: "corporate-governance",
        label: "Corporate Governance Report",
        docs: docsFor("corporate-governance"),
      },
      {
        id: "secretarial-compliance",
        label: "Secretarial Compliance Report",
        docs: docsFor("secretarial-compliance"),
      },
      {
        id: "agm",
        label: "AGM",
        docs: docsFor("agm"),
      },
      {
        id: "shareholder-information",
        label: "Shareholder Information",
        docs: docsFor("shareholder-information"),
      },
      {
        id: "committee-of-directors",
        label: "Committee of Directors",
        docs: docsFor("committee-of-directors"),
      },
      {
        id: "investor-complaints",
        label: "Investors Complaint Report",
        docs: docsFor("investor-complaints"),
      },
      {
        id: "share-capital-audit",
        label: "Reconciliation of Share Capital Audit Report",
        docs: docsFor("share-capital-audit"),
      },
      {
        id: "sast",
        label: "SAST",
        docs: docsFor("sast"),
      },
      {
        id: "familiarisation",
        label: "Familiarisation Programme",
        docs: docsFor("familiarisation"),
      },
      {
        id: "credit-ratings",
        label: "Credit Ratings",
        docs: docsFor("credit-ratings"),
      },
      {
        id: "compliance-others",
        label: "Others",
        docs: docsFor("compliance-others"),
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
        docs: docsFor("intimation"),
      },
      {
        id: "outcome",
        label: "Outcome",
        docs: docsFor("outcome"),
      },
      {
        id: "newspaper",
        label: "Newspaper Publication",
        docs: docsFor("newspaper"),
      },
      {
        id: "letters-others",
        label: "Others",
        docs: docsFor("letters-others"),
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
        docs: docsFor("policies-list"),
      },
      {
        id: "code",
        label: "Code",
        docs: docsFor("code"),
      },
      {
        id: "unclaimed-dividend",
        label: "Unclaimed Dividend",
        docs: docsFor("unclaimed-dividend"),
      },
      {
        id: "investor-forms",
        label: "Investor Forms",
        docs: docsFor("investor-forms"),
      },
    ],
  },
];
