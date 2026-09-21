/**
 * The customers band on the landing page.
 *
 * REAL COMPANIES, REAL MARKS. The eleven below are MCIL's named customers.
 * Eight carry the company's own logo, taken from that company's own website
 * and kept in `public/images/customers/`; the three that have no website to
 * take one from fall back to a wordmark set in the site's own type. Supply
 * artwork for one of those (admin panel → Home → Customers → Logo) and the
 * cell prints it instead, with no component change.
 *
 * Two of the files needed work before they were usable on a white plate, and
 * both are noted on the row itself: Talbros publishes only the reversed
 * lockup, and Makino's is a JPEG on a flat grey ground.
 *
 * `scale` exists because eleven logos drawn to eleven different proportions do
 * not balance at one height — a tall round badge reads far bigger than a long
 * thin wordmark of the same height. It nudges a single mark against the rest
 * rather than setting its size outright.
 */

/** Which of the two site faces a typeset mark is set in. */
export type MarkFont = "display" | "body";

export type Customer = {
  id: string;
  /** The company as it is written — the cell's accessible name. */
  name: string;
  /** The heavy first word of the typeset mark, where there is no logo. */
  mark: string;
  /** The lighter, tracked second word, where the name has one. */
  suffix?: string;
  font: MarkFont;
  /** The company's own artwork. Set, it replaces the typeset mark. */
  logo?: string;
  logoAlt?: string;
  /** Height multiplier against the row's common height. 1 is the default. */
  scale?: number;
};

export const customersHeading = {
  eyebrow: "Our Customers",
  title: "The companies we roll for",
  /* Left empty: the heading carries the section on its own. Type one into the
     admin panel and it appears under the heading. */
  standfirst: "",
  footnote:
    "Logos are the property of their respective owners and are shown here to identify MCIL's customers.",
};

export const customers: Customer[] = [
  {
    id: "talbros",
    name: "Talbros",
    mark: "TALBROS",
    font: "body",
    /* talbros.com carries the lockup white, for its own dark header. The
       letterforms are set to the page's ink here so it reads on a light
       ground, and the white disc behind the O is dropped so the band shows
       through it; the orange O itself is the artwork's own colour. */
    logo: "/images/customers/talbros.svg",
    logoAlt: "Talbros Automotive Components",
  },
  {
    id: "havells",
    name: "Havells",
    mark: "HAVELLS",
    font: "display",
    logo: "/images/customers/havells.svg",
    logoAlt: "Havells India",
    scale: 0.86,
  },
  {
    id: "caparo",
    name: "Caparo",
    mark: "CAPARO",
    font: "display",
    logo: "/images/customers/caparo.svg",
    logoAlt: "Caparo India",
  },
  {
    id: "sietz",
    name: "Sietz Auto",
    mark: "SIETZ",
    suffix: "AUTO",
    font: "body",
    logo: "/images/customers/sietz.webp",
    logoAlt: "Sietz Auto Technologies",
    scale: 1.38,
  },
  {
    id: "san-auto",
    name: "SAN Automotive",
    mark: "SAN",
    suffix: "AUTO",
    font: "body",
    /* The .webp their site serves, not the .png beside it: the two differ in
       the ghosted S behind the wordmark, which is white in the PNG and
       vanishes into a pale patch on this band. */
    logo: "/images/customers/san-automotive.webp",
    logoAlt: "SAN Automotive",
    scale: 1.05,
  },
  {
    id: "jaina",
    name: "Jaina",
    mark: "JAINA",
    suffix: "MOBILE",
    font: "display",
    logo: "/images/customers/jaina.png",
    logoAlt: "Jaina India",
    scale: 0.95,
  },
  /* Kanin (India) Ltd has no site of its own to take a logo from. */
  { id: "kanin", name: "Kanin", mark: "KANIN", font: "display" },
  /* Likewise Laser Shaving (India), whose domain refuses every request. */
  {
    id: "laser-shaving",
    name: "Laser Shaving",
    mark: "LASER",
    suffix: "SHAVING",
    font: "body",
  },
  /* And Nikko Auto, which has never had one. */
  {
    id: "nikko-auto",
    name: "Nikko Auto",
    mark: "NIKKO",
    suffix: "AUTO",
    font: "display",
  },
  {
    id: "makino",
    name: "Makino",
    mark: "MAKINO",
    font: "body",
    /* A round badge over two lines of small type: it needs the most height of
       any mark here to stay readable. Lifted off the grey ground makino.in
       publishes it on, so it sits on the plate rather than in a grey box. */
    logo: "/images/customers/makino.png",
    logoAlt: "Makino Auto Industries",
    scale: 1.7,
  },
  {
    id: "satyam-auto",
    name: "Satyam Auto",
    mark: "SATYAM",
    suffix: "AUTO",
    font: "display",
    logo: "/images/customers/satyam.png",
    logoAlt: "Satyam Auto Components",
    scale: 1.2,
  },
];
