/**
 * The editable shape of the site.
 *
 * Every field an admin can change from /admin lives somewhere in `SiteContent`.
 * The baseline values are the ones already written into `src/lib/*.ts`; what an
 * admin saves is stored as a *partial* override and deep-merged over that
 * baseline (see `defaults.ts` and `store.ts`). That way a section nobody has
 * touched keeps rendering the copy in the repo, and deleting the stored
 * overrides restores the site exactly as it ships.
 */

import type { AdvantagePoint } from "@/lib/about-advantage";
import type { ProcessStep } from "@/lib/about-process";
import type { TeamMember } from "@/lib/about-team";
import type { ContactLocation } from "@/lib/contact-locations";
import type { Customer } from "@/lib/customers";
import type { HeroSlide } from "@/lib/hero-slides";
import type { InvestorSlide } from "@/lib/investor-hero";
import type { Highlight } from "@/lib/investor-highlights";
import type { PerformanceMetric } from "@/lib/investor-performance";
import type { ReportCategory } from "@/lib/investor-reports";
import type { FinancialYear } from "@/lib/investor/years";
import type { Product } from "@/lib/products";

/** Eyebrow / title / standfirst — the heading trio most sections open with. */
export type Heading = {
  eyebrow: string;
  title: string;
  standfirst: string;
};

export type SiteContent = {
  home: {
    hero: {
      slides: HeroSlide[];
      /** The paragraph under the wordmark. */
      standfirst: string;
    };
    about: {
      eyebrow: string;
      title: string;
      body: string;
    };
    /** The customer band under the process walkthrough. */
    customers: {
      eyebrow: string;
      title: string;
      standfirst: string;
      /** Small print under the row; empty hides it. */
      footnote: string;
      items: Customer[];
    };
  };

  about: {
    hero: {
      eyebrow: string;
      title: string;
      standfirst: string;
      image: string;
      alt: string;
    };
    process: {
      eyebrow: string;
      title: string;
      steps: ProcessStep[];
    };
    advantage: {
      eyebrow: string;
      title: string;
      standfirst: string;
      points: AdvantagePoint[];
      image: string;
      alt: string;
      badgeLabel: string;
      badgeText: string;
    };
    team: {
      heading: Heading;
      members: TeamMember[];
      footnote: string;
    };
    closing: {
      title: string;
      body: string;
      ctaLabel: string;
      ctaHref: string;
    };
  };

  products: {
    intro: Heading;
    items: Product[];
  };

  contact: {
    locations: ContactLocation[];
  };

  /** Corporate facts, reused by the contact page and the footer of the forms. */
  company: {
    legalName: string;
    incorporated: string;
    promoters: string;
    cin: string;
    bseScripCode: string;
    bseScripId: string;
    isin: string;
    bisLicence: string;
    registeredOffice: string;
    works: string;
    phone: string;
    worksPhone: string;
    email: string;
    complianceOfficer: { name: string; role: string };
    registrar: {
      name: string;
      was: string;
      address: string;
      phone: string;
    };
  };

  investors: {
    /**
     * The reported figures, oldest first — the source the panels below are
     * generated from when an annual report is imported. Editing a year here
     * and pressing "Regenerate" in the admin panel rewrites the hero,
     * highlights and chart from it; editing those panels directly still works
     * and simply goes out of step with this until the next regeneration.
     */
    years: FinancialYear[];
    slides: InvestorSlide[];
    highlights: {
      heading: Heading;
      items: Highlight[];
    };
    performance: {
      title: string;
      standfirst: string;
      metrics: PerformanceMetric[];
    };
    reports: {
      heading: Heading;
      categories: ReportCategory[];
    };
  };
};

/** A recursive partial — the shape an override file is allowed to take. */
export type DeepPartial<T> = T extends readonly (infer U)[]
  ? U[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type SiteContentOverrides = DeepPartial<SiteContent>;
