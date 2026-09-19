/**
 * What the admin panel puts on screen, and how.
 *
 * The dashboard has no hand-written forms. It walks this description of the
 * content and renders the right control for each field, so adding something
 * editable is a matter of adding an entry here rather than writing another
 * page of JSX. Keys mirror `SiteContent` exactly — a field's `key` is the
 * property it reads and writes.
 */

import type { ContentSection } from "@/lib/content/defaults";

export type Field =
  | {
      /** `file` is an uploadable document (a filing, a report); `image` is a
          picture rendered on the page. */
      type: "text" | "textarea" | "image" | "file" | "url" | "date";
      key: string;
      label: string;
      help?: string;
      placeholder?: string;
    }
  | {
      type: "number";
      key: string;
      label: string;
      help?: string;
      step?: number;
      min?: number;
      max?: number;
    }
  | {
      type: "select";
      key: string;
      label: string;
      help?: string;
      options: { value: string; label: string }[];
    }
  | { type: "boolean"; key: string; label: string; help?: string }
  /** A list of plain strings, one per line — e.g. a headline's lines. */
  | { type: "strings"; key: string; label: string; help?: string }
  /** A fixed nested object. */
  | {
      type: "group";
      key: string;
      label: string;
      help?: string;
      fields: Field[];
      /** Rendered as an optional block the admin can add or remove. */
      optional?: boolean;
    }
  /** A repeatable list of objects: add, remove, reorder. */
  | {
      type: "list";
      key: string;
      label: string;
      help?: string;
      /** Field whose value titles each row in the list. */
      titleKey: string;
      addLabel: string;
      fields: Field[];
      /** Seed values for a newly added row. */
      template?: Record<string, unknown>;
      /**
       * Rows carry a stable `id`. The editor mints one when a row is added and
       * never shows or changes it afterwards.
       */
      identify?: boolean;
    };

export type SectionSchema = {
  id: ContentSection;
  label: string;
  blurb: string;
  fields: Field[];
};

/* ------------------------------------------------------------ shared bits */

const headingFields: Field[] = [
  { type: "text", key: "eyebrow", label: "Eyebrow" },
  { type: "text", key: "title", label: "Title" },
  { type: "textarea", key: "standfirst", label: "Standfirst" },
];

const ctaFields: Field[] = [
  { type: "text", key: "label", label: "Button label" },
  { type: "text", key: "href", label: "Link" },
];

const toneOptions = [
  { value: "deep", label: "Deep navy" },
  { value: "blue", label: "Brand blue" },
  { value: "pale", label: "Pale blue" },
  { value: "sand", label: "Sand" },
  { value: "plain", label: "Plain" },
];

const plateFields: Field[] = [
  {
    type: "image",
    key: "src",
    label: "Photograph",
    help: "Leave empty to show a labelled placeholder frame instead.",
  },
  { type: "text", key: "alt", label: "Alt text" },
  {
    type: "select",
    key: "tone",
    label: "Plate tint",
    options: [
      { value: "navy", label: "Navy" },
      { value: "accent", label: "Accent" },
      { value: "pale", label: "Pale" },
    ],
  },
];

/* -------------------------------------------------------------- sections */

export const sections: SectionSchema[] = [
  {
    id: "home",
    label: "Home",
    blurb: "The landing hero and the About band beneath it.",
    fields: [
      {
        type: "group",
        key: "hero",
        label: "Hero",
        fields: [
          {
            type: "textarea",
            key: "standfirst",
            label: "Paragraph under the wordmark",
          },
          {
            type: "list",
            key: "slides",
            label: "Slides",
            titleKey: "sector",
            addLabel: "Add slide",
            help: "The background photographs that crossfade, and the sector word set against each one.",
            template: {
              sector: "New Sector",
              image: "",
              alt: "",
              position: "center",
            },
            fields: [
              {
                type: "text",
                key: "sector",
                label: "Sector word",
                help: "Set in extra-bold after the wordmark. Keep it short — a long word overflows the desktop line.",
              },
              { type: "image", key: "image", label: "Photograph" },
              { type: "text", key: "alt", label: "Alt text" },
              {
                type: "text",
                key: "position",
                label: "Focal point",
                help: 'CSS object-position, e.g. "center", "50% 30%", "right center".',
              },
            ],
          },
        ],
      },
      {
        type: "group",
        key: "about",
        label: "About band",
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow" },
          { type: "textarea", key: "title", label: "Headline" },
          { type: "textarea", key: "body", label: "Paragraph" },
        ],
      },
    ],
  },

  {
    id: "about",
    label: "About page",
    blurb: "Page hero, the process walkthrough, the advantage list and the team.",
    fields: [
      {
        type: "group",
        key: "hero",
        label: "Page hero",
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow" },
          { type: "textarea", key: "title", label: "Headline" },
          { type: "textarea", key: "standfirst", label: "Standfirst" },
          { type: "image", key: "image", label: "Background photograph" },
          { type: "text", key: "alt", label: "Alt text" },
        ],
      },
      {
        type: "group",
        key: "process",
        label: "Process",
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow" },
          { type: "text", key: "title", label: "Heading" },
          {
            type: "list",
            key: "steps",
            label: "Stages",
            identify: true,
            titleKey: "tab",
            addLabel: "Add stage",
            help: "One panel per stage, advanced by scroll. The photographs carry their own burned-in step number, so re-ordering these means re-shooting or re-labelling them.",
            template: {
              tab: "New stage",
              title: "",
              body: "",
              facts: [],
              image: "",
              alt: "",
            },
            fields: [
              { type: "text", key: "tab", label: "Tab label" },
              { type: "text", key: "title", label: "Heading" },
              { type: "textarea", key: "body", label: "Body" },
              {
                type: "list",
                key: "facts",
                label: "Supporting facts",
                titleKey: "label",
                addLabel: "Add fact",
                template: { label: "", value: "" },
                fields: [
                  { type: "text", key: "label", label: "Label" },
                  { type: "text", key: "value", label: "Value" },
                ],
              },
              { type: "image", key: "image", label: "Photograph" },
              { type: "text", key: "alt", label: "Alt text" },
            ],
          },
        ],
      },
      {
        type: "group",
        key: "advantage",
        label: "The MCIL Advantage",
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow" },
          { type: "textarea", key: "title", label: "Heading" },
          { type: "textarea", key: "standfirst", label: "Standfirst" },
          {
            type: "list",
            key: "points",
            label: "Points",
            titleKey: "title",
            addLabel: "Add point",
            help: "Rendered as an accordion; the first one opens by default.",
            template: { title: "", body: "" },
            fields: [
              { type: "text", key: "title", label: "Title" },
              { type: "textarea", key: "body", label: "Body" },
            ],
          },
          { type: "image", key: "image", label: "Photograph" },
          { type: "text", key: "alt", label: "Alt text" },
          {
            type: "text",
            key: "badgeLabel",
            label: "Badge label",
            help: "The small line in the frosted panel over the photograph.",
          },
          { type: "text", key: "badgeText", label: "Badge text" },
        ],
      },
      {
        type: "group",
        key: "team",
        label: "Team",
        fields: [
          {
            type: "group",
            key: "heading",
            label: "Section heading",
            fields: headingFields,
          },
          {
            type: "list",
            key: "members",
            label: "People",
            identify: true,
            titleKey: "name",
            addLabel: "Add person",
            template: {
              name: "",
              role: "",
              chip: "",
              bio: "",
              image: "",
              tone: "plain",
              feature: false,
            },
            fields: [
              { type: "text", key: "name", label: "Name" },
              { type: "text", key: "role", label: "Role" },
              {
                type: "text",
                key: "chip",
                label: "Chip",
                help: 'The small pill at the foot of the card, e.g. "Promoter · Executive".',
              },
              { type: "textarea", key: "bio", label: "Bio" },
              { type: "image", key: "image", label: "Portrait" },
              {
                type: "select",
                key: "tone",
                label: "Card colour",
                options: toneOptions,
              },
              {
                type: "boolean",
                key: "feature",
                label: "Double-width card",
                help: "The grid is four columns wide and fills exactly when the widths add up — check both rows after changing this.",
              },
            ],
          },
          { type: "textarea", key: "footnote", label: "Footnote" },
        ],
      },
      {
        type: "group",
        key: "closing",
        label: "Closing call to action",
        fields: [
          { type: "text", key: "title", label: "Heading" },
          { type: "textarea", key: "body", label: "Body" },
          { type: "text", key: "ctaLabel", label: "Button label" },
          { type: "text", key: "ctaHref", label: "Button link" },
        ],
      },
    ],
  },

  {
    id: "products",
    label: "Products",
    blurb: "The page introduction and the product bands beneath it.",
    fields: [
      {
        type: "group",
        key: "intro",
        label: "Introduction",
        fields: headingFields,
      },
      {
        type: "list",
        key: "items",
        label: "Products",
        identify: true,
        titleKey: "name",
        addLabel: "Add product",
        template: {
          name: "New product",
          body: "",
          layout: "wordmark",
          wordmark: "",
          plate: { src: "", alt: "", tone: "navy" },
        },
        fields: [
          { type: "text", key: "name", label: "Product name" },
          {
            type: "textarea",
            key: "body",
            label: "Paragraph",
            help: "Text wrapped in {braces} is underlined, as the product name is in the reference.",
          },
          {
            type: "select",
            key: "layout",
            label: "Layout",
            help: "Wordmark: giant type with one photograph inset. Gallery: a row of four plates.",
            options: [
              { value: "wordmark", label: "Wordmark + one photograph" },
              { value: "gallery", label: "Four-plate gallery" },
            ],
          },
          {
            type: "text",
            key: "wordmark",
            label: "Wordmark",
            help: "Wordmark layout only. Keep it short — a long string runs off the plate.",
          },
          {
            type: "group",
            key: "plate",
            label: "Plate (wordmark layout)",
            optional: true,
            fields: plateFields,
          },
          {
            type: "list",
            key: "plates",
            label: "Plates (gallery layout)",
            titleKey: "alt",
            addLabel: "Add plate",
            help: "Exactly four, in row order.",
            template: { src: "", alt: "", tone: "navy" },
            fields: plateFields,
          },
        ],
      },
    ],
  },

  {
    id: "contact",
    label: "Contact",
    blurb: "The addresses, phone numbers and map pins on the contact page.",
    fields: [
      {
        type: "list",
        key: "locations",
        label: "Locations",
        identify: true,
        titleKey: "label",
        addLabel: "Add location",
        template: {
          label: "",
          role: "",
          address: "",
          phone: "",
          mapQuery: "",
        },
        fields: [
          { type: "text", key: "label", label: "Name" },
          {
            type: "text",
            key: "role",
            label: "What it is for",
            help: 'The line under the name, e.g. "Rolling line, despatch and material enquiries".',
          },
          { type: "textarea", key: "address", label: "Postal address" },
          { type: "text", key: "phone", label: "Phone" },
          {
            type: "textarea",
            key: "mapQuery",
            label: "Map search",
            help: "What Google geocodes for the pin. Keep it looser than the postal address — a unit number sends the pin to a street centroid, where the building name lands it on the building.",
          },
        ],
      },
    ],
  },

  {
    id: "company",
    label: "Company details",
    blurb:
      "Corporate facts used across the contact page and the enquiry form. Change these with care — several are filed with the exchange.",
    fields: [
      { type: "text", key: "legalName", label: "Legal name" },
      { type: "text", key: "incorporated", label: "Incorporated" },
      { type: "text", key: "promoters", label: "Promoters" },
      { type: "text", key: "cin", label: "CIN" },
      { type: "text", key: "bseScripCode", label: "BSE scrip code" },
      { type: "text", key: "bseScripId", label: "BSE scrip ID" },
      { type: "text", key: "isin", label: "ISIN" },
      { type: "text", key: "bisLicence", label: "BIS licence" },
      { type: "textarea", key: "registeredOffice", label: "Registered office" },
      { type: "textarea", key: "works", label: "Works" },
      { type: "text", key: "phone", label: "Office phone" },
      { type: "text", key: "worksPhone", label: "Works phone" },
      { type: "text", key: "email", label: "Email" },
      {
        type: "group",
        key: "complianceOfficer",
        label: "Compliance officer",
        fields: [
          { type: "text", key: "name", label: "Name" },
          { type: "text", key: "role", label: "Role" },
        ],
      },
      {
        type: "group",
        key: "registrar",
        label: "Registrar",
        fields: [
          { type: "text", key: "name", label: "Name" },
          { type: "text", key: "was", label: "Formerly" },
          { type: "textarea", key: "address", label: "Address" },
          { type: "text", key: "phone", label: "Phone" },
        ],
      },
    ],
  },

  {
    id: "investors",
    label: "Investors",
    blurb:
      "The investor hero, the figures on the highlights and performance panels, and every filed document.",
    fields: [
      {
        type: "list",
        key: "years",
        label: "Reported figures by year",
        titleKey: "fy",
        addLabel: "Add a year",
        help:
          "The figures the hero panel, the highlights cards and the performance " +
          "chart are generated from, oldest last. Importing an annual report fills " +
          "these in; editing one here changes the stored figure but does not " +
          "regenerate the panels — re-import, or edit the panels directly. " +
          "Money is in ₹ crore; EPS and dividend are per share, in ₹.",
        template: {
          fy: 0,
          revenueCr: 0,
          ebitdaCr: 0,
          patCr: 0,
          eps: 0,
          dividendPerShare: 0,
        },
        fields: [
          {
            type: "number",
            key: "fy",
            label: "Financial year ending",
            step: 1,
            help: "2026 means FY 2025-26.",
          },
          {
            type: "number",
            key: "revenueCr",
            label: "Revenue from operations (₹ Cr)",
            step: 0.0001,
          },
          {
            type: "number",
            key: "ebitdaCr",
            label: "EBITDA (₹ Cr)",
            step: 0.0001,
          },
          {
            type: "number",
            key: "patCr",
            label: "Profit after tax (₹ Cr)",
            step: 0.0001,
          },
          {
            type: "number",
            key: "eps",
            label: "Earnings per share (₹)",
            step: 0.01,
          },
          {
            type: "number",
            key: "dividendPerShare",
            label: "Dividend per share (₹)",
            step: 0.01,
          },
        ],
      },
      {
        type: "list",
        key: "slides",
        label: "Investor hero slides",
        identify: true,
        titleKey: "eyebrow",
        addLabel: "Add slide",
        template: {
          eyebrow: "",
          headline: [],
          standfirst: "",
          cta: { label: "", href: "" },
          image: "",
          alt: "",
          position: "center",
        },
        fields: [
          { type: "text", key: "eyebrow", label: "Eyebrow" },
          {
            type: "strings",
            key: "headline",
            label: "Headline",
            help: "One line per row — the headline is set line by line.",
          },
          { type: "textarea", key: "standfirst", label: "Standfirst" },
          {
            type: "group",
            key: "cta",
            label: "Call to action",
            fields: ctaFields,
          },
          { type: "image", key: "image", label: "Photograph" },
          { type: "text", key: "alt", label: "Alt text" },
          { type: "text", key: "position", label: "Focal point" },
          {
            type: "list",
            key: "groups",
            label: "Metric groups",
            titleKey: "heading",
            addLabel: "Add group",
            template: { heading: "", metrics: [], footnote: "" },
            fields: [
              { type: "text", key: "heading", label: "Heading" },
              {
                type: "list",
                key: "metrics",
                label: "Metrics",
                titleKey: "label",
                addLabel: "Add metric",
                template: { label: "", prefix: "", value: "", note: "" },
                fields: [
                  { type: "text", key: "label", label: "Label" },
                  { type: "text", key: "prefix", label: "Prefix" },
                  { type: "text", key: "value", label: "Value" },
                  {
                    type: "select",
                    key: "trend",
                    label: "Trend arrow",
                    options: [
                      { value: "", label: "None" },
                      { value: "up", label: "Up" },
                      { value: "down", label: "Down" },
                    ],
                  },
                  { type: "text", key: "note", label: "Note" },
                ],
              },
              { type: "text", key: "footnote", label: "Footnote" },
            ],
          },
          {
            type: "group",
            key: "banner",
            label: "Stat banner",
            optional: true,
            fields: [
              {
                type: "list",
                key: "stats",
                label: "Stats",
                titleKey: "label",
                addLabel: "Add stat",
                template: { label: "", value: "" },
                fields: [
                  { type: "text", key: "label", label: "Label" },
                  { type: "text", key: "value", label: "Value" },
                  {
                    type: "select",
                    key: "trend",
                    label: "Trend arrow",
                    options: [
                      { value: "", label: "None" },
                      { value: "up", label: "Up" },
                      { value: "down", label: "Down" },
                    ],
                  },
                ],
              },
              { type: "text", key: "footnote", label: "Footnote" },
            ],
          },
        ],
      },
      {
        type: "group",
        key: "highlights",
        label: "Highlights",
        fields: [
          {
            type: "group",
            key: "heading",
            label: "Section heading",
            fields: headingFields,
          },
          {
            type: "list",
            key: "items",
            label: "Cards",
            identify: true,
            titleKey: "title",
            addLabel: "Add card",
            template: {
              value: 0,
              decimals: 0,
              prefix: "",
              suffix: "",
              title: "",
              body: "",
              visual: "bars",
              bars: [],
            },
            fields: [
              { type: "text", key: "title", label: "Title" },
              { type: "textarea", key: "body", label: "Body" },
              {
                type: "number",
                key: "value",
                label: "Figure",
                step: 0.01,
                help: "The number the counter climbs to.",
              },
              {
                type: "number",
                key: "decimals",
                label: "Decimal places",
                step: 1,
                min: 0,
                max: 4,
              },
              {
                type: "text",
                key: "prefix",
                label: "Prefix",
                placeholder: "₹ ",
              },
              { type: "text", key: "suffix", label: "Suffix", placeholder: " Cr" },
              {
                type: "boolean",
                key: "suffixSmall",
                label: "Small raised suffix",
              },
              {
                type: "select",
                key: "visual",
                label: "Supporting graphic",
                options: [
                  { value: "mix", label: "Mix bars" },
                  { value: "gauge", label: "Gauge" },
                  { value: "bars", label: "Bars" },
                  { value: "thumbs", label: "Thumbnails + link" },
                ],
              },
              { type: "text", key: "panelTitle", label: "Panel heading" },
              {
                type: "group",
                key: "gauge",
                label: "Gauge",
                optional: true,
                fields: [
                  {
                    type: "number",
                    key: "fill",
                    label: "Arc fill (0–1)",
                    step: 0.01,
                    min: 0,
                    max: 1,
                  },
                  { type: "text", key: "caption", label: "Caption" },
                ],
              },
              {
                type: "list",
                key: "bars",
                label: "Bars",
                titleKey: "label",
                addLabel: "Add bar",
                template: { label: "", percent: 0, display: "" },
                fields: [
                  { type: "text", key: "label", label: "Label" },
                  {
                    type: "number",
                    key: "percent",
                    label: "Width (0–100)",
                    step: 1,
                    min: 0,
                    max: 100,
                  },
                  {
                    type: "text",
                    key: "display",
                    label: "Shown instead of the percentage",
                  },
                ],
              },
              {
                type: "group",
                key: "cta",
                label: "Link",
                optional: true,
                fields: ctaFields,
              },
            ],
          },
        ],
      },
      {
        type: "group",
        key: "performance",
        label: "Performance",
        fields: [
          { type: "text", key: "title", label: "Heading" },
          { type: "textarea", key: "standfirst", label: "Standfirst" },
          {
            type: "list",
            key: "metrics",
            label: "Series",
            identify: true,
            titleKey: "label",
            addLabel: "Add series",
            template: { label: "", kind: "currency", points: [] },
            fields: [
              { type: "text", key: "label", label: "Label" },
              {
                type: "select",
                key: "kind",
                label: "Unit",
                options: [
                  { value: "currency", label: "Currency (₹ Cr)" },
                  { value: "percent", label: "Percent" },
                ],
              },
              {
                type: "list",
                key: "points",
                label: "Years",
                titleKey: "year",
                addLabel: "Add year",
                template: { year: new Date().getFullYear(), value: 0 },
                fields: [
                  { type: "number", key: "year", label: "Year", step: 1 },
                  {
                    type: "number",
                    key: "value",
                    label: "Value",
                    step: 0.01,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "group",
        key: "reports",
        label: "Reports & filings",
        fields: [
          {
            type: "group",
            key: "heading",
            label: "Section heading",
            fields: headingFields,
          },
          {
            type: "list",
            key: "categories",
            label: "Categories",
            identify: true,
            titleKey: "label",
            addLabel: "Add category",
            template: { label: "", blurb: "", subCategories: [] },
            fields: [
              { type: "text", key: "label", label: "Category" },
              { type: "textarea", key: "blurb", label: "Blurb" },
              {
                type: "list",
                key: "subCategories",
                label: "Sub-categories",
                identify: true,
                titleKey: "label",
                addLabel: "Add sub-category",
                template: { label: "", docs: [] },
                fields: [
                  { type: "text", key: "label", label: "Sub-category" },
                  {
                    type: "list",
                    key: "docs",
                    label: "Documents",
                    titleKey: "title",
                    addLabel: "Add document",
                    help: "Newest first — the list is shown in the order set here.",
                    template: { title: "", date: "", href: "" },
                    fields: [
                      { type: "text", key: "title", label: "Title" },
                      {
                        type: "date",
                        key: "date",
                        label: "Date",
                        help: "Filing date, as YYYY-MM-DD.",
                      },
                      {
                        type: "file",
                        key: "href",
                        label: "Document",
                        help: "Upload the PDF (or Word/Excel file) visitors download. Leave it empty while a filing is still pending — the row shows a greyed-out Download until then.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export function sectionSchema(id: string): SectionSchema | undefined {
  return sections.find((section) => section.id === id);
}
