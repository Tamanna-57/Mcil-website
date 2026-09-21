/**
 * The two products MCIL makes, and the layout each one gets.
 *
 * Both bands follow the reference composition: the product name set heavy
 * above a short paragraph, both hung off the page's left margin, then a block
 * of imagery below. The first product carries the giant-wordmark block with one
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
  /**
   * A second photograph, wiped in over `src` as the cursor crosses the band:
   * a divider tracks the pointer's x, and this photograph fills the plate to
   * the left of it. Needs `src` to wipe against, and is ignored where there is
   * no cursor to drive it — a coarse pointer, or reduced motion — so the plate
   * falls back to `src` alone rather than to half of each.
   */
  compare?: { src: string; alt: string };
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
    body: "{Cold rolled strips and coils} are reduced from hot rolled input at room temperature and finished to gauge, with thickness held across the full width.",
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
    /* Four photographs of the coils themselves rather than of the line that
       makes them: the pickling and oiling stages have never been photographed
       here, and a frame naming a shot nobody has taken reads as unfinished
       once the plates either side of it are full. Each alt says what its own
       photograph shows, so none of them claims a stage it does not. */
    plates: [
      {
        src: "/images/hrpo-coils.jpg",
        alt: "Hot rolled coils in stock at the works",
        tone: "pale",
      },
      /* The third plate laps over most of the second, so the second is the
         slot to spend on the weakest photograph — here the hero slide — and
         the two on the right, which show whole, are the ones the HRPO
         photographs get. */
      {
        src: "/images/hero-4.jpg",
        alt: "The coil warehouse aisle, stock staged for despatch",
        tone: "navy",
      },
      /* The centre plate, the one that shows whole and sits over the middle
         of the row, is the one that carries the wipe: the stock bay, with
         the line that filled it drawn across as the cursor moves. */
      {
        src: "/images/works-coil-bay.jpg",
        alt: "Coils stacked down the bay at the Faridabad works",
        tone: "accent",
        compare: {
          src: "/images/works-coil-line.jpg",
          alt: "The coil line running down the length of the works",
        },
      },
      {
        src: "/images/hrpo-coils-banded.jpg",
        alt: "Hot rolled coils banded and marked, staged for the mill",
        tone: "navy",
      },
    ],
  },
];
