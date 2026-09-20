/**
 * The Sustainability page.
 *
 * WHAT IS ASSERTED HERE. The page is written to the same standard as the rest
 * of the site: nothing is claimed that MCIL's own filings do not support.
 *
 *   Sourced — the board's composition (three of five directors independent),
 *   the BIS licence, the works and registered office, the listing and the
 *   compliance officer all come from `company.ts` and `about-team.ts`, which
 *   are read off the FY2025-26 annual report and mcil.net.
 *
 *   True of the process itself — cold rolling reduces gauge at room
 *   temperature, with no reheating furnace; steel scrap is recyclable without
 *   loss of properties. These are facts about the process, not claims about
 *   MCIL's performance in it.
 *
 *   Intent — everything written as "we aim", "our approach is", "we work to".
 *   These are commitments, and they are deliberately not quantified.
 *
 * WHAT IS NOT HERE, and must not be added without a source: emissions,
 * energy or water figures; percentage reductions; ISO 14001 or any other
 * certification MCIL does not hold; injury rates; CSR spend or named
 * programmes. The closing note tells the reader that measured figures follow
 * when they are prepared, which is the honest position until they are.
 */

export type Pillar = {
  id: string;
  /** Plate tone, matching the product bands and the news cards. */
  tone: "ink" | "amber" | "pale";
  label: string;
  title: string;
  body: string;
  points: string[];
};

export type Band = {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
  image: string;
  alt: string;
  /** Odd bands carry the photograph on the left. */
  flipped?: boolean;
};

export const hero = {
  eyebrow: "Sustainability",
  title: "Rolled to a tolerance, run with a conscience",
  standfirst:
    "Steel is among the few materials that can be melted and made again without losing what makes it steel. That is the ground our approach stands on: a long-lived product, a process run at room temperature, and a company small enough to know what happens on its own floor.",
  image: "/images/hero-4.jpg",
  alt: "Coil warehouse aisle at the Faridabad works",
};

export const approach = {
  eyebrow: "Our approach",
  title: "Commerce and consequence, held together",
  standfirst:
    "We are a cold rolling mill in Faridabad, and we have been one since 1996. Our environmental and social responsibilities are the ones that come with that: the material we consume, the effluent we handle, the people on the line, and the governance the company is held to as a listed entity.",
  body: [
    "We would rather describe what we do than publish a target we have not measured. This page sets out how the works is run and what we are working towards. Measured figures will be published here as they are prepared and assured, alongside the disclosures the company already files.",
  ],
};

export const pillars: Pillar[] = [
  {
    id: "environment",
    tone: "ink",
    label: "Environment",
    title: "A process that does not reheat the steel",
    body: "Cold rolling reduces a coil to gauge at room temperature. There is no reheating furnace in the line, and the energy the works draws is electrical rather than burnt on site to soften steel.",
    points: [
      "Offcuts, trimmings and end cuts are steel, and steel is recycled without loss — we segregate them for return to the melting cycle rather than to landfill.",
      "Pickling is the part of the line that needs the most care, and it is handled under the consents and approvals the works operates within.",
      "We work to reduce what the line consumes per tonne rolled — power, water, oil and packaging — and to buy from suppliers close enough that the coil is not carried further than it needs to be.",
    ],
  },
  {
    id: "people",
    tone: "amber",
    label: "People & Safety",
    title: "The floor is where this is decided",
    body: "A rolling mill is a place of moving coil, and nothing about our approach to safety is delegated to a poster. The works team runs it, and the standard we hold ourselves to is that every incident is both reportable and preventable.",
    points: [
      "Guarding, handling practice and protective equipment are the works team's standing responsibility, not a periodic exercise.",
      "Most of the people at Sector 59 come from Faridabad and the districts around it; steady employment is the most direct contribution we make to the neighbourhood we sit in.",
      "We aim to pay our people and our vendors on time, which for a small supplier is a form of support that outlasts a donation.",
    ],
  },
  {
    id: "governance",
    tone: "pale",
    label: "Governance",
    title: "Answerable to a board we do not control",
    body: "MCIL is listed on the BSE and reports to a board on which the independent directors outnumber the executive ones — three of the five seats. The finance and secretarial functions report into that board, not around it.",
    points: [
      "Three of the five directors are independent and non-executive, as listed in the FY2025-26 annual report.",
      "The company's policies, codes and disclosures are published under Investor Relations and filed with the exchange.",
      "The Company Secretary & Compliance Officer is the named point of contact for shareholder and investor correspondence.",
    ],
  },
];

export const bands: Band[] = [
  {
    id: "material",
    eyebrow: "Material",
    title: "The most recycled material there is",
    body: [
      "A coil that leaves our line goes into auto components, white goods and electrical work — products with lives measured in years. When those lives end, the steel does not. It is collected, melted and rolled again, and it comes back as steel.",
      "That is not something we can take credit for inventing. It is the reason a cold rolling mill starts from a better position than most manufacturing does, and it is why our own housekeeping — keeping scrap clean, segregated and moving back into the cycle — matters more than it might appear.",
    ],
    image: "/images/process-4.jpg",
    alt: "Finished cold rolled coils lined up for despatch",
  },
  {
    id: "works",
    eyebrow: "The works",
    title: "One site, seen end to end",
    body: [
      "Everything we make is made at one place: Plot 113, HSIIDC Industrial Estate, Sector 59, Faridabad. Input arrives, is pickled, rolled, finished and despatched from the same floor, under the BIS licence the product is certified to.",
      "A single site is an advantage worth naming here. What is consumed, what is discharged and what is thrown away are all in one place, in front of the people responsible for them — which is the only honest starting point for reducing any of it.",
    ],
    image: "/images/process-1.jpg",
    alt: "Hot rolled steel coils staged in the input bay",
    flipped: true,
  },
];

export const note = {
  title: "What is on this page, and what is not",
  body: "This page describes how MCIL operates and what it is working towards. It carries no emissions, energy, water or safety figures, and claims no certification the company does not hold, because none of those have been measured and assured for publication yet. They will appear here when they have been, alongside the reports and disclosures already filed under Investor Relations.",
};

export const closing = {
  title: "Questions about how we run the works?",
  body: "Investor and compliance correspondence goes to the Company Secretary; anything about the line itself, the works team will answer.",
  ctaLabel: "Contact us",
  ctaHref: "/contact",
};
