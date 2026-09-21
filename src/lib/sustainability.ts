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

export type Foundation = {
  id: string;
  title: string;
  /** Shown once the card opens. Two sentences is what the card holds. */
  body: string;
  /** Where "Read more" goes — an anchor on this page or another page. */
  href: string;
  linkLabel: string;
  image: string;
  alt: string;
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
  eyebrow: "Sustainability at MCIL",
  title: "Rolled to a tolerance, run with a conscience",
  /*
   * `sustainability-hero.jpg` was a byte-for-byte copy of hero-4, so the page
   * opened on a photograph the landing page had already shown. It now opens on
   * one of the works photographs instead. The picture that really belongs here
   * is an environmental one — greenery, the site from outside, planting at the
   * works — and replacing this path is the only change it needs.
   */
  image: "/images/works-coil-bay.jpg",
  alt: "Finished coils stacked down the bay at the Faridabad works",
};

/** Set centred under the hero, as the reference sets its opening line. */
export const intro =
  "Steel is among the few materials that can be melted and made again without losing what makes it steel. That is the ground this page stands on: a long-lived product, a process run at room temperature, and a company small enough to know what happens on its own floor.";

export const approach = {
  eyebrow: "Our approach",
  title: "Commerce and consequence, held together",
  standfirst:
    "We are a cold rolling mill in Faridabad, and we have been one since 1996. Our environmental and social responsibilities are the ones that come with that: the material we consume, the effluent we handle, the people on the line, and the governance the company is held to as a listed entity.",
  body: [
    "We would rather describe what we do than publish a target we have not measured. This page sets out how the works is run and what we are working towards. Measured figures will be published here as they are prepared and assured, alongside the disclosures the company already files.",
  ],
};

/**
 * The foundations, after the reference's card row: a photograph with the
 * title on it, which opens to the paragraph under it.
 *
 * People & Safety carries a works photograph. The other four are still hero
 * slides standing in for pictures that belong to these subjects — planting at
 * the works, the board, the certificate, the works team — and each is marked
 * where it sits. Replacing an `image` path is the only change one needs.
 *
 * What is deliberately not used here, or anywhere outside the process
 * walkthrough on the landing page, is `process-1..4`: those four carry their
 * own burned-in step number and belong to that sequence alone.
 */
export const foundations: Foundation[] = [
  {
    id: "environment",
    title: "Environment",
    body: "Cold rolling reduces a coil to gauge at room temperature — there is no reheating furnace in the line, and no fuel burnt on site to soften steel. We work to reduce what the line consumes per tonne rolled, and to keep offcuts and trimmings segregated for return to the melting cycle rather than to landfill.",
    href: "#material",
    linkLabel: "Read more",
    /* PLACEHOLDER — a hero slide, until an environmental photograph exists. */
    image: "/images/hero-2.jpg",
    alt: "Cold rolled coils down the finished goods bay",
  },
  {
    id: "people",
    title: "People & Safety",
    body: "A rolling mill is a place of moving coil, and the standard we hold ourselves to is that every incident is both reportable and preventable. Guarding, handling practice and protective equipment are the works team's standing responsibility rather than a periodic exercise.",
    href: "/about#team",
    linkLabel: "Meet the team",
    image: "/images/works-inspection.jpg",
    alt: "A works engineer checking a coil on the line",
  },
  {
    id: "governance",
    title: "Governance",
    body: "MCIL is listed on the BSE and reports to a board on which the independent directors outnumber the executive ones — three of the five seats, as listed in the FY2025-26 annual report. The finance and secretarial functions report into that board, not around it.",
    href: "/investors#policies",
    linkLabel: "Policies & codes",
    /* PLACEHOLDER — the board, or the works from outside, belongs here. */
    image: "/images/hero-4.jpg",
    alt: "The coil warehouse aisle at the Faridabad works",
  },
  {
    id: "quality",
    title: "Certification & Compliance",
    body: "Every coil leaves under a heat number and a test certificate, and the product is certified to the BIS licence the works holds. Disclosures go to the exchange on the schedule a listed company is held to, and the Company Secretary is the named point of contact for them.",
    href: "/products",
    linkLabel: "What we make",
    /* PLACEHOLDER — the BIS certificate or a test certificate belongs here. */
    image: "/images/hero-3.jpg",
    alt: "Certified stock bundled across the warehouse floor",
  },
  {
    id: "community",
    title: "Community & Livelihood",
    body: "Most of the people at Sector 59 come from Faridabad and the districts around it, and steady employment is the most direct contribution we make to the neighbourhood the works sits in. We aim to pay our people and our vendors on time, which for a small supplier outlasts a donation.",
    href: "/contact",
    linkLabel: "Talk to us",
    /* PLACEHOLDER — the works team belongs here. */
    image: "/images/hero-1.jpg",
    alt: "Fabricators grinding steel sections on the shop floor",
  },
];

export const foundationsHeading = {
  eyebrow: "What holds it up",
  title: "Our Sustainability Foundations",
};

export const bands: Band[] = [
  {
    id: "material",
    eyebrow: "Material",
    title: "The most recycled material there is",
    body: [
      "A coil that leaves our line goes into auto components, white goods and electrical work — products with lives measured in years. When those lives end, the steel does not. It is collected, melted and rolled again, and it comes back as steel.",
      "That is not something we can take credit for inventing. It is the reason a cold rolling mill starts from a better position than most manufacturing does, and it is why our own housekeeping — keeping scrap clean, segregated and moving back into the cycle — matters more than it might appear.",
    ],
    image: "/images/hrpo-coils.jpg",
    alt: "Hot rolled coils in stock, the input this line starts from",
  },
  {
    id: "works",
    eyebrow: "The works",
    title: "One site, seen end to end",
    body: [
      "Everything we make is made at one place: Plot 113, HSIIDC Industrial Estate, Sector 59, Faridabad. Input arrives, is pickled, rolled, finished and despatched from the same floor, under the BIS licence the product is certified to.",
      "A single site is an advantage worth naming here. What is consumed, what is discharged and what is thrown away are all in one place, in front of the people responsible for them — which is the only honest starting point for reducing any of it.",
    ],
    image: "/images/works-coil-line.jpg",
    alt: "The coil line running the length of the Faridabad works",
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
