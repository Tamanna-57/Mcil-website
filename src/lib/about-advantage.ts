/**
 * "The MCIL Advantage" band on /about — the accordion and the photograph
 * beside it.
 *
 * It sits here rather than inside the component so the admin panel's defaults
 * and the component's own fallback are the same object, not two copies that
 * can drift.
 */

export type AdvantagePoint = {
  id: string;
  title: string;
  body: string;
};

export const advantage = {
  eyebrow: "The MCIL Advantage",
  title: "Built for the tolerances our customers work to",
  standfirst:
    "A public limited company promoted by the Khandelwal family in December 1996, manufacturing cold rolled steel strips, coils and HRPO steel from a single integrated line.",
  image: "/images/hero-2.jpg",
  alt: "Cold rolled coils in the MCIL finished goods bay",
  badgeLabel: "Since 1996",
  badgeText: "Cold Rolled · HRPO · Galvanised",
  points: [
    {
      id: "precision",
      title: "Precision to Gauge",
      body: "Thickness is held to ± 0.01 mm across the width, measured continuously rather than sampled, so a coil behaves the same at its tail as at its head.",
    },
    {
      id: "certified",
      title: "Certified Quality",
      body: "BIS certified under IS: 513:2008, licence CM/L-9512364723. Every coil ships with its heat number and test certificate.",
    },
    {
      id: "supply",
      title: "Dependable Supply",
      body: "Three decades of supplying to auto components, white goods, electrical equipment and power transmission manufacturers as per their schedule.",
    },
  ] as AdvantagePoint[],
};
