/**
 * Real MCIL corporate and investor data, read off mcil.net and BSE filings.
 *
 * Unlike the figures in investor-highlights.ts and investor-performance.ts,
 * everything here is sourced, not placeholder. Nothing renders it yet — it is
 * kept for the contact and investor pages still to be built.
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
  /* No installed-capacity figure is published here. The 3,200 -> 7,400 TPA
     numbers on the old site cannot be right against ₹149 Cr of revenue — that
     would imply about ₹2 lakh a tonne — so they are treated as long out of
     date and left out until MCIL confirms the current rating. */
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
