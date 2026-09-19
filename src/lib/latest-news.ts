/**
 * The Latest News section on the landing page — the news cards and the social
 * feed that runs beside them.
 *
 * SAMPLE DATA. Every headline, post and date below is placeholder copy written
 * to the right shape and length so the section can be laid out and reviewed;
 * none of it is a real MCIL announcement. Replace the two arrays with the real
 * items when they are supplied — no component change is needed, the section
 * reads whatever is here.
 *
 * Photographs are existing site imagery (`public/images/`) standing in for the
 * article art. Titles are deliberately about two lines long at card width,
 * which is where the reference clamps them.
 */

export type NewsItem = {
  id: string;
  /** Small label above the headline — the section the story belongs to. */
  category: string;
  title: string;
  /** Where "Read more" goes. `#` while the stories are placeholders. */
  href: string;
  /** Machine-readable, for <time dateTime>. */
  date: string;
  /** As printed on the card. */
  dateLabel: string;
  image: string;
  alt: string;
};

export type SocialPost = {
  id: string;
  /** Printed beside the handle, e.g. "Sep 17". */
  dateLabel: string;
  date: string;
  body: string;
  /** Optional photograph carried by the post. */
  image?: string;
  alt?: string;
  href: string;
};

export const newsHeading = {
  title: "Latest News",
  /** Read by screen readers as the section's accessible name. */
  label: "Latest news from Metal Coatings (India) Ltd",
};

/** The account the left-hand feed belongs to. */
export const socialChannel = {
  name: "Metal Coatings (India) Ltd",
  handle: "@mcilindia",
  avatar: "/images/mcil-mark.png",
  href: "#",
  /** Names the feed above the posts. */
  label: "Company updates",
};

/**
 * The cards stacked to the right of the feed. Rendered in order, with the
 * photograph swapping sides card by card, so two is the natural count — a
 * third simply continues the alternation.
 */
export const newsItems: NewsItem[] = [
  {
    id: "cold-rolled-line-upgrade",
    category: "Operations",
    title: "MCIL commissions upgraded cold rolling line at the Faridabad works",
    href: "#",
    date: "2026-09-18",
    dateLabel: "18 September 2026",
    image: "/images/process-2.jpg",
    alt: "Steel strip running through the cold rolling mill stands",
  },
  {
    id: "q1-results",
    category: "Investors",
    title:
      "Board approves unaudited financial results for the quarter ended June 2026",
    href: "#",
    date: "2026-09-09",
    dateLabel: "9 September 2026",
    image: "/images/hero-3.jpg",
    alt: "Bundled galvanised stock across the warehouse floor",
  },
];

/**
 * The feed column. It scrolls on its own inside the panel, so the list can run
 * longer than the cards beside it.
 */
export const socialPosts: SocialPost[] = [
  {
    id: "post-1",
    dateLabel: "Sep 17",
    date: "2026-09-17",
    body: "Thirty years of rolling steel in Faridabad. Our cold rolled strips leave the line held to gauge across the full width — the same tolerance our customers have built their own lines around since 1996.",
    image: "/images/process-4.jpg",
    alt: "Finished cold rolled coils lined up for despatch",
    href: "#",
  },
  {
    id: "post-2",
    dateLabel: "Sep 12",
    date: "2026-09-12",
    body: "Hot rolled input arrives, is pickled, oiled and staged for the mill. Every coil is logged against its heat number before it moves an inch further down the line.",
    image: "/images/process-1.jpg",
    alt: "Hot rolled steel coils staged in the input bay",
    href: "#",
  },
  {
    id: "post-3",
    dateLabel: "Sep 5",
    date: "2026-09-05",
    body: "Our works team at Sector 59 closed the quarter without a single reportable safety incident. Thank you to every person on the floor who made that the ordinary outcome rather than the exceptional one.",
    href: "#",
  },
  {
    id: "post-4",
    dateLabel: "Aug 28",
    date: "2026-08-28",
    body: "Precision strips for auto components, white goods and general engineering — rolled, finished and certified to IS 513 at a single site.",
    image: "/images/hero-1.jpg",
    alt: "Fabricators grinding steel sections on the shop floor",
    href: "#",
  },
];
