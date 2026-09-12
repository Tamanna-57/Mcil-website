/**
 * Primary navigation, including the panel each item drops on hover.
 *
 * Sub-links point only at destinations that exist today. The pages still to be
 * built carry `soon: true` instead of a dead anchor, so the menu reads as
 * unfinished rather than broken — drop the flag and add the href as each one
 * lands.
 */

import { company } from "@/lib/company";

export type NavLink = {
  label: string;
  href?: string;
  /** Not built yet: rendered as a muted row with a small marker. */
  soon?: boolean;
  /** Opens in a new tab and skips the internal router. */
  external?: boolean;
};

export type NavFigure = { value: string; label: string };

export type NavItem = {
  id: string;
  label: string;
  /** Omitted where the section has no page of its own; the item then only
      opens its panel rather than pretending to navigate. */
  href?: string;
  panel: {
    title: string;
    /** Either prose or a short figure list fills the panel's left column. */
    body?: string;
    figures?: NavFigure[];
    /** Small line closing the left column. */
    caption?: string;
    links: NavLink[];
  };
};

export const navItems: NavItem[] = [
  {
    id: "about",
    label: "About Us",
    href: "/about",
    panel: {
      title: "Who We Are",
      body: "Metal Coatings (India) Ltd has been cold rolling steel since 1994 — strips, coils and HRPO, finished to a tolerance rather than a target.",
      caption: "Promoted by the Khandelwal family, December 1994",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "How a Coil Is Made", href: "/about#process" },
        { label: "The MCIL Advantage", href: "/about#advantage" },
        { label: "Our Team", href: "/about#team" },
      ],
    },
  },
  {
    id: "products",
    label: "Products",
    href: "/products",
    panel: {
      title: "What We Make",
      body: "Two products — cold rolled strips and coils, and hot rolled pickled and oiled coils — rolled on one integrated line and despatched with the heat number and test certificate.",
      caption: "BIS certified · " + company.bisLicence,
      links: [
        { label: "Cold Rolled Strips & Coils", href: "/products#cold-rolled" },
        { label: "HRPO Steel Coils", href: "/products#hrpo" },
        { label: "How a Coil Is Made", href: "/about#process" },
        { label: "Grades & Tolerances", soon: true },
      ],
    },
  },
  {
    id: "advantage",
    label: "MCIL Advantage",
    href: "/about#advantage",
    panel: {
      title: "The MCIL Advantage",
      body: "Thickness held across the width rather than sampled, every coil certified, and three decades of supplying auto components, white goods and electrical manufacturers to schedule.",
      links: [
        { label: "Precision & Quality", href: "/about#advantage" },
        { label: "The Process, Step by Step", href: "/about#process" },
        { label: "The People Behind the Line", href: "/about#team" },
        { label: "Certifications", soon: true },
      ],
    },
  },
  {
    id: "investors",
    label: "Investors",
    href: "/investors",
    panel: {
      title: "Investor Relations",
      figures: [
        { value: "₹ 148.98 Cr", label: "Revenue from Operations" },
        { value: "₹ 2.40 Cr", label: "Profit After Tax" },
        { value: "₹ 3.28", label: "Earnings Per Share" },
      ],
      caption: "FY 2025-26, as reported",
      links: [
        { label: "The Year in Numbers", href: "/investors#highlights" },
        { label: "Performance Over the Years", href: "/investors#performance" },
        { label: "Annual Reports & Financials", href: "/investors#financials" },
        { label: "Stock Exchange Compliance", href: "/investors#compliance" },
        {
          label: "Policies, Code & Unclaimed Dividend",
          href: "/investors#policies",
        },
      ],
    },
  },
  {
    id: "sustainability",
    label: "Sustainability",
    panel: {
      title: "Sustainability",
      body: "Our environmental, social and governance disclosures, published here as they are prepared.",
      links: [
        { label: "Environment", soon: true },
        { label: "People & Safety", soon: true },
        { label: "Governance", soon: true },
        { label: "Policies & Codes", soon: true },
      ],
    },
  },
  {
    id: "contact",
    label: "Contact Us",
    panel: {
      title: "Contact Us",
      /* Both addresses in prose — the accent caption is set in small caps
         with wide tracking, which an address wraps badly in. */
      body: `Registered office — ${company.registeredOffice}. Works — ${company.works}.`,
      caption: "CIN " + company.cin,
      links: [
        {
          label: company.phone,
          href: `tel:${company.phone.replace(/\s/g, "")}`,
          external: true,
        },
        {
          label: company.email,
          href: `mailto:${company.email}`,
          external: true,
        },
        {
          label: "Works · " + company.worksPhone,
          href: `tel:${company.worksPhone.split("/")[0].replace(/\s/g, "")}`,
          external: true,
        },
        { label: "Investor Grievances", soon: true },
      ],
    },
  },
];
