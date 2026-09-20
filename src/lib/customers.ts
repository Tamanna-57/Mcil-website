/**
 * The customers band on the landing page.
 *
 * REAL NAMES, TYPESET MARKS. The eleven companies below are MCIL's named
 * customers. What renders for each one is a *wordmark set in the site's own
 * type*, not the company's registered logo: those are third-party artwork and
 * none of it ships in this repo. Each row therefore carries an optional
 * `logo` — drop the supplied artwork in from the admin panel (Home → Customers
 * → Logo) and the cell prints the picture instead of the wordmark, with no
 * component change.
 *
 * The typeset marks follow one system so the band reads as a set rather than a
 * scrapbook: a heavy first word, and where the name has one, a second word set
 * light and tracked beside it. `font` swaps between the two site faces so the
 * row is not eleven settings of the same one.
 */

/** Which of the two site faces the mark is set in. */
export type MarkFont = "display" | "body";

export type Customer = {
  id: string;
  /** The company as it is written — the cell's accessible name. */
  name: string;
  /** The heavy first word of the mark. */
  mark: string;
  /** The lighter, tracked second word, where the name has one. */
  suffix?: string;
  font: MarkFont;
  /**
   * Supplied logo artwork. Set it and the cell prints this instead of the
   * wordmark; `logoAlt` then names the company for a screen reader.
   */
  logo?: string;
  logoAlt?: string;
};

export const customersHeading = {
  eyebrow: "Our Customers",
  title: "The companies we roll for",
  standfirst:
    "Auto components, white goods and electrical equipment makers who take our cold rolled strip to schedule, coil after coil.",
  footnote:
    "Company names are the property of their respective owners and are listed here as MCIL customers.",
};

export const customers: Customer[] = [
  { id: "talbros", name: "Talbros", mark: "TALBROS", font: "body" },
  { id: "havells", name: "Havells", mark: "HAVELLS", font: "display" },
  { id: "caparo", name: "Caparo", mark: "CAPARO", font: "display" },
  { id: "seitz", name: "Seitz", mark: "SEITZ", font: "body" },
  { id: "san-auto", name: "San Auto", mark: "SAN", suffix: "AUTO", font: "body" },
  {
    id: "jaina-mobile",
    name: "Jaina Mobile",
    mark: "JAINA",
    suffix: "MOBILE",
    font: "display",
  },
  { id: "kanin", name: "Kanin", mark: "KANIN", font: "display" },
  {
    id: "laser-shaving",
    name: "Laser Shaving",
    mark: "LASER",
    suffix: "SHAVING",
    font: "body",
  },
  {
    id: "nikko-auto",
    name: "Nikko Auto",
    mark: "NIKKO",
    suffix: "AUTO",
    font: "display",
  },
  { id: "makino", name: "Makino", mark: "MAKINO", font: "body" },
  {
    id: "satyam-auto",
    name: "Satyam Auto",
    mark: "SATYAM",
    suffix: "AUTO",
    font: "display",
  },
];
