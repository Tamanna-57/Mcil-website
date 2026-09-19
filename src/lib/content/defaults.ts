/**
 * The baseline site content: everything the repo ships with, in one object.
 *
 * Most of it is re-exported from the per-section modules that already existed
 * (`src/lib/hero-slides.ts` and friends) so there is still exactly one copy of
 * each figure. The rest — page headings and paragraphs that used to be typed
 * straight into a component — is lifted here verbatim so it can be edited too.
 */

import { advantage } from "@/lib/about-advantage";
import { processSteps } from "@/lib/about-process";
import { team, teamHeading } from "@/lib/about-team";
import { company } from "@/lib/company";
import { locations } from "@/lib/contact-locations";
import { heroSlides } from "@/lib/hero-slides";
import { investorSlides } from "@/lib/investor-hero";
import { highlights, highlightsHeading } from "@/lib/investor-highlights";
import {
  performanceHeading,
  performanceMetrics,
} from "@/lib/investor-performance";
import { reportCategories, reportsHeading } from "@/lib/investor-reports";
import { financialYears } from "@/lib/investor/years";
import { products, productsIntro } from "@/lib/products";
import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  home: {
    hero: {
      slides: heroSlides,
      standfirst:
        "Cold rolled and HRPO steel strips engineered for auto components, white goods, electrical equipment and power transmission.",
    },
    about: {
      eyebrow: "About MCIL",
      title:
        "A public limited company promoted by the Khandelwal family in December 1996, manufacturing cold rolled steel strips, coils and HRPO steel.",
      body: "MCIL supplies auto components, white goods, electrical equipment and power transmission manufacturers, and is BIS certified under IS: 513:2008 (Licence no. CM/L-9512364723).",
    },
  },

  about: {
    hero: {
      eyebrow: "About Us",
      title: "Steel finished to a tolerance, not a target",
      standfirst:
        "Metal Coatings (India) Ltd has been cold rolling steel since 1996, supplying to auto components, white goods, electrical equipment and power transmission manufacturers across India.",
      image: "/images/process-4.jpg",
      alt: "Finished cold rolled coils lined up for despatch",
    },
    process: {
      eyebrow: "Process",
      title: "How a coil is made",
      steps: processSteps,
    },
    advantage,
    team: {
      heading: teamHeading,
      members: team,
      footnote:
        "Board of Directors and Key Managerial Personnel as listed in the FY2025-26 annual report.",
    },
    closing: {
      title: "Need a gauge we have not listed?",
      body: "Send us the specification and we will come back with what the line can hold.",
      ctaLabel: "Talk to Us",
      ctaHref: "/contact",
    },
  },

  products: {
    intro: productsIntro,
    items: products,
  },

  contact: {
    locations,
  },

  company,

  investors: {
    years: financialYears,
    slides: investorSlides,
    highlights: {
      heading: highlightsHeading,
      items: highlights,
    },
    performance: {
      title: performanceHeading.title,
      standfirst: performanceHeading.standfirst,
      metrics: performanceMetrics,
    },
    reports: {
      heading: reportsHeading,
      categories: reportCategories,
    },
  },
};

/** The section keys the admin panel and the write API address content by. */
export const CONTENT_SECTIONS = [
  "home",
  "about",
  "products",
  "contact",
  "company",
  "investors",
] as const;

export type ContentSection = (typeof CONTENT_SECTIONS)[number];

export function isContentSection(value: unknown): value is ContentSection {
  return (
    typeof value === "string" &&
    (CONTENT_SECTIONS as readonly string[]).includes(value)
  );
}
