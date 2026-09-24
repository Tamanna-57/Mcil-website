/**
 * What the in-page editor needs to know about each list it can add to.
 *
 * Deleting and moving an entry are the same for every list. Adding one is not:
 * a new team member needs a name to click on and a photograph to replace, a new
 * customer needs a typeset name until it has a logo. `create` builds the new
 * entry, from the one it is being added after, so a new slide starts on the
 * same photograph and a new product in the same layout — never on an empty
 * image path, which the pages cannot render.
 *
 * Keys are list paths with every index written as `*`.
 */

type Json = Record<string, unknown>;

export type ListSpec = {
  /** What one entry is called, for the toolbar: "Add slide". */
  label: string;
  /** The fewest entries the list may hold — the pages need at least one. */
  min?: number;
  create: (from: Json | undefined) => Json;
};

/** An id no other entry has, readable in the stored JSON. */
export function freshId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

function clone<T>(value: T): T {
  return value === undefined ? value : structuredClone(value);
}

export const LIST_SPECS: Record<string, ListSpec> = {
  "home.hero.slides": {
    label: "slide",
    create: (from) => ({ ...clone(from), sector: "New sector" }),
  },
  "home.customers.items": {
    label: "customer",
    create: () => ({
      id: freshId("customer"),
      name: "New Customer",
      mark: "NEW CUSTOMER",
      font: "display",
    }),
  },
  "about.process.steps": {
    label: "stage",
    create: (from) => ({
      ...clone(from),
      id: freshId("stage"),
      tab: "New stage",
      title: "Stage title",
      body: "Describe what happens at this stage.",
      facts: [{ label: "Fact", value: "Value" }],
    }),
  },
  "about.process.steps.*.facts": {
    label: "fact",
    create: () => ({ label: "Label", value: "Value" }),
  },
  "about.advantage.points": {
    label: "point",
    create: () => ({
      id: freshId("point"),
      title: "New point",
      body: "Explain the point here.",
    }),
  },
  "about.team.members": {
    label: "member",
    create: (from) => ({
      id: freshId("member"),
      name: "New Member",
      role: "Designation",
      chip: (from?.chip as string) || "Director",
      bio: "A short profile.",
      qualification: "Qualification",
      image: from?.image,
    }),
  },
  "products.items": {
    label: "product",
    create: (from) => ({
      ...clone(from),
      id: freshId("product"),
      name: "New product",
      body: "Describe the {product} here.",
    }),
  },
  "contact.locations": {
    label: "location",
    create: () => ({
      id: freshId("location"),
      label: "New location",
      role: "Office",
      address: "Address",
      phone: "Phone",
      mapQuery: "",
    }),
  },
  "investors.slides": {
    label: "slide",
    create: (from) => ({
      id: freshId("slide"),
      eyebrow: "Investor Relations",
      headline: ["New headline"],
      standfirst: "A supporting line.",
      cta: { label: "View reports", href: "#reports" },
      image: from?.image,
      alt: from?.alt ?? "",
      position: from?.position ?? "center",
    }),
  },
  "investors.slides.*.headline": {
    label: "line",
    create: () => "New line" as unknown as Json,
  },
  "investors.highlights.items": {
    label: "card",
    create: (from) => ({ ...clone(from), id: freshId("highlight"), title: "New card" }),
  },
  "investors.reports.categories.*.subCategories": {
    label: "section",
    create: () => ({ id: freshId("section"), label: "New section", docs: [] }),
  },
};

/** "about.team.members" → its spec; "about.process.steps.2.facts" → the facts spec. */
export function specFor(list: string): ListSpec | undefined {
  return LIST_SPECS[list.replace(/\.\d+(?=\.|$)/g, ".*")];
}
