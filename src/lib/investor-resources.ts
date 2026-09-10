/**
 * Real MCIL corporate and investor data, read off mcil.net and BSE filings.
 *
 * Unlike the figures in investor-highlights.ts and investor-performance.ts,
 * everything in this file is sourced, not placeholder. The document categories
 * and their sub-categories mirror the live investor section exactly, and the
 * links point at it until the documents are hosted here.
 */

export const company = {
  legalName: "Metal Coatings (India) Limited",
  incorporated: "December 1994",
  promoters: "Khandelwal family",
  cin: "L74899DL1994PLC063387",
  bseScripCode: "531810",
  bseScripId: "METALCO",
  isin: "INE161E01014",
  bisLicence: "IS: 513:2008 · CM/L-9512364723",
  /** 3,200 TPA at commissioning, raised to 7,400 TPA on adding the galvanising line. */
  installedCapacityTpa: 7400,
  registeredOffice: "912, Hemkunt Chambers, 89 Nehru Place, New Delhi 110 019",
  works:
    "Plot No. 113, HSIIDC Industrial Estate, Sector 59, Faridabad 121 004, Haryana",
  phone: "011-4180 8125",
  worksPhone: "0129-2307602 / 2307422",
  email: "info@mcilindia.net",
  complianceOfficer: {
    name: "Mrs. Shimpy Goyal",
    role: "Company Secretary & Compliance Officer",
  },
  registrar: {
    name: "MUFG Intime India Private Limited",
    was: "formerly Link Intime India Private Limited",
    address: "C-101, 247 Park, LBS Marg, Vikhroli (West), Mumbai 400 083",
    phone: "011-4941 1000",
  },
};

export type ResourceGroup = {
  id: string;
  title: string;
  /** Sub-categories exactly as the live site lists them. */
  items: string[];
  note: string;
  href: string;
};

/** The four categories published at mcil.net/investors.aspx, with their catids. */
export const resourceGroups: ResourceGroup[] = [
  {
    id: "financials",
    title: "Financials",
    items: [
      "Annual Report & Audited Financial Results",
      "Unaudited Financial Results",
    ],
    note: "Annual reports from 2013 to 2026, audited results to 31.03.2026, and quarterly results back to Q2 FY2013.",
    href: "https://mcil.net/investors1.aspx?catid=16",
  },
  {
    id: "compliance",
    title: "Stock Exchange Compliance",
    items: [
      "Shareholding Pattern",
      "Corporate Governance Report",
      "Reconciliation of Share Capital Audit Report",
      "Investors Complaint Report",
      "AGM",
      "Shareholder Information",
      "Committee of Directors",
      "Credit Ratings",
      "Familiarisation Programme",
      "SAST",
      "Secretarial Compliance Report",
      "Integrated Filing Report",
    ],
    note: "Filings made to BSE under the Listing Regulations.",
    href: "https://mcil.net/investors1.aspx?catid=19",
  },
  {
    id: "policies",
    title: "Policies, Code & Unclaimed Dividend",
    items: ["Policies", "Code", "Unclaimed Dividend", "Investor Forms"],
    note: "Board policies, the code of conduct, unclaimed dividend records and shareholder forms.",
    href: "https://mcil.net/investors1.aspx?catid=18",
  },
  {
    id: "letters",
    title: "Letters Sent to Stock Exchange",
    items: ["Intimation", "Outcome", "Newspaper Publication", "Others"],
    note: "Board meeting intimations and outcomes, and statutory newspaper publications.",
    href: "https://mcil.net/investors1.aspx?catid=20",
  },
];
