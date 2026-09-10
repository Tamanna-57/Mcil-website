/**
 * The four stages of MCIL's cold rolling line, driven by scroll on /about.
 *
 * The photographs carry their own burned-in step number and label, so the copy
 * here deliberately does not repeat them — the tab reads as the short name and
 * the body adds what the picture cannot show.
 */

export type ProcessStep = {
  id: string;
  /** Short label for the pill in the tab bar. */
  tab: string;
  /** Heading shown beside the photograph. */
  title: string;
  body: string;
  /** Two or three supporting facts, shown as a small definition row. */
  facts: { label: string; value: string }[];
  image: string;
  alt: string;
};

export const processSteps: ProcessStep[] = [
  {
    id: "input",
    tab: "Input",
    title: "Hot rolled coils arrive",
    body: "Every run starts with hot rolled coil sourced to specification. Each lot is checked for gauge, width and surface condition before it is cleared to the pickling line.",
    facts: [
      { label: "Coil weight", value: "Up to 25 MT" },
      { label: "Incoming gauge", value: "1.8 – 6.0 mm" },
    ],
    image: "/images/process-1.jpg",
    alt: "Hot rolled steel coils staged in the input bay",
  },
  {
    id: "rolling",
    tab: "Cold Rolling",
    title: "Reduced at room temperature",
    body: "The strip passes through a series of rolls that bring it down to finished gauge without heat. Cold work tightens the grain, lifts yield strength and leaves a far brighter surface than hot rolling can.",
    facts: [
      { label: "Reduction", value: "Up to 75%" },
      { label: "Finished gauge", value: "0.12 – 2.5 mm" },
    ],
    image: "/images/process-2.jpg",
    alt: "Steel strip running through the cold rolling mill stands",
  },
  {
    id: "strip",
    tab: "Strip",
    title: "Gauge held across the width",
    body: "Thickness and flatness are measured continuously along the line. Strip is slit to ordered width, edge-trimmed and inspected before it is wound, so what reaches the customer needs no rework.",
    facts: [
      { label: "Gauge tolerance", value: "± 0.01 mm" },
      { label: "Width range", value: "25 – 1250 mm" },
    ],
    image: "/images/process-3.jpg",
    alt: "Cold rolled steel strip running out along the finishing line",
  },
  {
    id: "finished",
    tab: "Finished Coils",
    title: "Wound, marked and despatched",
    body: "Finished coils are annealed, skin-passed to the required temper, oiled and wrapped. Each carries its heat number and test certificate through to despatch.",
    facts: [
      { label: "Certification", value: "BIS IS: 513:2008" },
      { label: "Despatch", value: "Pan-India" },
    ],
    image: "/images/process-4.jpg",
    alt: "Finished cold rolled coils lined up for despatch",
  },
];

/** Viewport heights of scroll allotted to each step while the panel is pinned. */
export const SCROLL_PER_STEP = 85;
