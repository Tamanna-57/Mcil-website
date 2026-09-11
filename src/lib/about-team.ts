/**
 * Board of Directors and Key Managerial Personnel.
 *
 * REAL PEOPLE. Names, designations and portraits are taken from the "Board of
 * Directors & Key Managerial Personnel" page of MCIL's FY2025-26 annual report
 * (the same report the investor figures come from). The report lists seven —
 * five directors and two KMP — so all seven are shown.
 *
 * The bios describe each seat's remit at MCIL. Nothing personal is asserted
 * beyond what the report itself carries: no tenures, qualifications or prior
 * employers have been invented to fill the cards out.
 */

/** Card colourway, drawn from the site palette. */
export type Tone = "deep" | "blue" | "pale" | "sand" | "plain";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Small chip closing the card — the seat's category, not a social handle. */
  chip: string;
  bio: string;
  image: string;
  tone: Tone;
  /** The chairman's card runs two columns wide and leads the grid. */
  feature?: boolean;
};

export const teamHeading = {
  eyebrow: "Our Team",
  title: "The people behind the line",
  standfirst:
    "Metal Coatings (India) Ltd is run by its promoters and overseen by an independent board, with the finance and secretarial functions reporting into it.",
};

export const team: TeamMember[] = [
  {
    id: "ramesh-chander-khandelwal",
    name: "Ramesh Chander Khandelwal",
    role: "Chairman & Whole Time Director",
    chip: "Promoter · Executive",
    bio: "Chairs the board and holds executive charge of the company, which the Khandelwal family promoted in December 1994. Sets the direction for the rolling operation and carries it through to the shop floor.",
    image: "/images/team/ramesh-chander-khandelwal.jpg",
    tone: "deep",
    feature: true,
  },
  {
    id: "pramod-khandelwal",
    name: "Pramod Khandelwal",
    role: "Managing Director",
    chip: "Promoter · Executive",
    bio: "Runs the business day to day — production, order book and customer commitments across the cold rolling, HRPO and galvanised lines.",
    image: "/images/team/pramod-khandelwal.jpg",
    tone: "blue",
  },
  {
    id: "rupali-aggarwal",
    name: "Rupali Aggarwal",
    role: "Non-Executive Independent Director",
    chip: "Independent Director",
    bio: "Brings an outside view to the board and to the committees that sit under it, without an executive role in the company.",
    image: "/images/team/rupali-aggarwal.jpg",
    tone: "plain",
  },
  {
    id: "sachin-khurana",
    name: "Sachin Khurana",
    role: "Non-Executive Independent Director",
    chip: "Independent Director",
    bio: "Independent voice on the board, with oversight of governance and the controls the company reports against each year.",
    image: "/images/team/sachin-khurana.jpg",
    tone: "pale",
  },
  {
    id: "aanchal-gupta",
    name: "Aanchal Gupta",
    role: "Non-Executive Independent Director",
    chip: "Independent Director",
    bio: "Serves on the board in a non-executive capacity, holding management to the standards the company sets itself.",
    image: "/images/team/aanchal-gupta.jpg",
    tone: "sand",
  },
  {
    id: "ram-awtar-sharma",
    name: "Ram Awtar Sharma",
    role: "Chief Financial Officer",
    chip: "Key Managerial Personnel",
    bio: "Responsible for the company's finances and for the accounts published in the annual report and the quarterly results filed with the exchange.",
    image: "/images/team/ram-awtar-sharma.jpg",
    tone: "blue",
  },
  {
    id: "shimpy-goyal",
    name: "Shimpy Goyal",
    role: "Company Secretary & Compliance Officer",
    chip: "Key Managerial Personnel",
    bio: "Keeps the company's filings, disclosures and shareholder correspondence in order, and is the point of contact for investor queries.",
    image: "/images/team/shimpy-goyal.jpg",
    tone: "plain",
  },
];
