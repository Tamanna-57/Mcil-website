export type HeroSlide = {
  /** Sector word that swaps in after the pipe. Keep it short — it is set in bold display caps. */
  sector: string;
  /** Path under /public. Swap these files to change the hero imagery. */
  image: string;
  /** Alt text, read by screen readers when the slide becomes active. */
  alt: string;
  /** Horizontal focal point for the plate, so the crop keeps the subject in frame. */
  position: string;
};

/**
 * The hero cycles these four in order and loops. Order here is the order on screen.
 */
export const heroSlides: HeroSlide[] = [
  {
    sector: "Precision Strips",
    image: "/images/hero-1.jpg",
    alt: "Fabricators grinding and finishing steel sections on the shop floor",
    position: "55% 55%",
  },
  {
    sector: "Cold Rolled",
    image: "/images/hero-2.jpg",
    alt: "Cold rolled steel coils stacked down the finished goods bay",
    position: "45% 50%",
  },
  {
    sector: "Galvanised",
    image: "/images/hero-3.jpg",
    alt: "Bundled galvanised steel stock staged across the warehouse floor",
    position: "50% 60%",
  },
  {
    sector: "HRPO Coils",
    image: "/images/hero-4.jpg",
    alt: "Hot rolled pickled and oiled coils lining the warehouse aisle at sunrise",
    position: "50% 55%",
  },
];

/** Milliseconds each slide holds before advancing. Mirrors --hero-slide-duration. */
export const HERO_SLIDE_DURATION = 6000;

/**
 * Milliseconds for the whole sector word swap: the outgoing word leaves, then
 * the incoming one arrives. Kept in step with the .hero-word-out / .hero-word-in
 * timings in src/app/globals.css.
 */
export const HERO_WORD_DURATION = 740;
