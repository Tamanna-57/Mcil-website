/**
 * The two products MCIL makes, and the layout each one gets.
 *
 * Both bands follow the reference composition: the product name set heavy
 * above a short paragraph in the right-hand column, then a block of imagery
 * below. The first product carries the giant-wordmark block with one
 * photograph inset into it; the second carries a four-plate gallery row.
 *
 * Photographs: a plate with `src` renders the photograph, a plate without one
 * renders a labelled placeholder frame naming the shot that belongs there, so
 * an unfilled slot reads as pending rather than broken. Dropping a file into
 * `public/images/` and setting `src` is the only change needed.
 */

export type ProductPlate = {
  /** Path under `public/`. Absent until the photograph is shot. */
  src?: string;
  /** Required either way — the placeholder is labelled with it. */
  alt: string;
  /** Tint of the plate behind the photograph. */
  tone: "navy" | "accent" | "pale";
};

export type Product = {
  /** Anchor id, also what the header menu links at. */
  id: string;
  /** Set heavy above the paragraph, where the reference sets its year. */
  name: string;
  /**
   * Paragraph under the name. The span wrapped in braces is underlined, as
   * the product name is in the reference.
   */
  body: string;
  layout: "wordmark" | "gallery";
  /** layout: "wordmark" — set giant across the block. Keep it short; a long
      string would run off the plate before the photograph clips it. */
  wordmark?: string;
  /** layout: "wordmark" — the single plate, which pops up on scroll. */
  plate?: ProductPlate;
  /** layout: "gallery" — exactly four plates, in row order. */
  plates?: ProductPlate[];
};

export const productsIntro = {
  eyebrow: "Products",
  title: "Two products, one integrated line",
  standfirst:
    "Cold rolled strips and coils, and hot rolled pickled and oiled coils — rolled, finished and certified at Faridabad.",
};

export const products: Product[] = [
  {
    id: "cold-rolled",
    name: "Cold Rolled Strips & Coils",
    wordmark: "Cold Rolled",
    body: "{Cold rolled strips and coils} are reduced from hot rolled input at room temperature and finished to gauge, with thickness held across the full width rather than sampled at the edges.",
    layout: "wordmark",
    plate: {
      src: "/images/hero-2.jpg",
      alt: "Cold rolled steel coils lined up down the finished goods bay",
      tone: "navy",
    },
  },
  {
    id: "hrpo",
    name: "HRPO Steel Coils",
    body: "{HRPO steel coils} are hot rolled, pickled and oiled — acid descaled in line and surface protected, so they can be formed or welded without further preparation. Every coil ships with its heat number and test certificate.",
    layout: "gallery",
    plates: [
      { alt: "Hot rolled coil staged in the input bay", tone: "pale" },
      { alt: "The pickling line, scale coming off the strip", tone: "navy" },
      { alt: "Oiled strip surface, close up", tone: "accent" },
      { alt: "Finished HRPO coils banded for despatch", tone: "navy" },
    ],
  },
];
