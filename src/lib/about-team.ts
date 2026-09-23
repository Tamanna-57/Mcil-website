/**
 * Board of Directors and Key Managerial Personnel.
 *
 * REAL PEOPLE. Names, designations, profiles and qualifications are taken from
 * the company's own "MCIL BOD Profile" document — the Board's own words about
 * itself. The report lists seven: five directors and two KMP, all of whom are
 * shown. Nothing has been added to fill a card out.
 *
 * `bio` is the profile as the document sets it, in paragraphs separated by a
 * blank line; the panel prints one paragraph per break, so the shape of the
 * writing survives an edit in the admin panel without any markup to learn.
 */

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Small chip opening the panel — the seat's category, not a social handle. */
  chip: string;
  /** The profile, one paragraph per blank line. */
  bio: string;
  /** Degrees and memberships, as the Board states them. */
  qualification: string;
  image: string;
};

/**
 * `standfirst` is empty by design. Every section's heading carries the same
 * eyebrow / title / standfirst trio, so the field stays on the type, but this
 * section no longer sets a line under the label: the rail names it and the
 * wall of portraits is the whole of what it has to say. `AboutTeam` does not
 * read the field, so filling it back in here would not print it.
 */
export const teamHeading = {
  eyebrow: "Our Team",
  title: "The people behind the line",
  standfirst: "",
};

export const team: TeamMember[] = [
  {
    id: "ramesh-chander-khandelwal",
    name: "Ramesh Chander Khandelwal",
    role: "Chairman & Whole-time Director",
    chip: "Promoter · Executive",
    bio: "Mr. Ramesh Chander Khandelwal is the Chairman and Whole-time Director of the Company. Being in the capacity of Chairman, he chairs the Board of Directors and provides strategic guidance to steer the Company's overall growth and governance.\n\nAs Whole-time Director, he closely oversees the manufacturing function and contributes towards key technical aspects of operations. A Mechanical Engineer by qualification, his technical expertise in C.R. manufacturing and galvanising has helped the Company achieve substantial improvement in efficiencies.",
    qualification: "BE (Mechanical Engineering)",
    image: "/images/team/ramesh-chander-khandelwal.jpg",
  },
  {
    id: "pramod-khandelwal",
    name: "Pramod Khandelwal",
    role: "Managing Director",
    chip: "Promoter · Executive",
    bio: "Mr. Pramod Khandelwal is the Managing Director of the Company. A Chartered Accountant by qualification, he has an extensive experience in overseeing the Commercial, Financial and Marketing functions of the Company. As Managing Director, he is responsible for the Company's overall management and strategic direction, steering its day-to-day affairs in line with the Board's vision.\n\nHis rich experience and in-depth knowledge of the auto components and consumer durables markets, coupled with his ability to control and manage all financials, commercial and marketing aspects of the Company have played a pivotal role in the Company's proactive strategic decision-making and its ability to stay ahead of the competition.",
    qualification: "B.Com (Hons.), FCA",
    image: "/images/team/pramod-khandelwal.jpg",
  },
  {
    id: "rupali-aggarwal",
    name: "Rupali Aggarwal",
    role: "Non-Executive Independent Director",
    chip: "Independent Director",
    bio: "Mrs. Rupali Aggarwal is a Non-Executive Independent Director on the Board of the Company. She is a qualified Company Secretary and Law Graduate with over 15 years of diverse experience across industries such as Agriculture, Real Estate, Automotive, and Sugar Manufacturing.\n\nRenowned for her innovative thinking, she brings to the Board her expertise in corporate advisory, including company law, SEBI regulations, secretarial compliance, and Capital Markets. Her ability to effectively bridge theory and practice adds significant value to the Board's deliberations and strengthens the Company's governance framework.",
    qualification: "Company Secretary, LLB",
    image: "/images/team/rupali-aggarwal.jpg",
  },
  {
    id: "sachin-khurana",
    name: "Sachin Khurana",
    role: "Non-Executive Independent Director",
    chip: "Independent Director",
    /* "He also bring" in the source document; the agreement is corrected here
       because this is set as running copy on a public page. */
    bio: "Mr. Sachin Khurana is a Non-Executive Independent Director on the Board of the Company. As an Independent Director, he provides independent oversight of the Board's functioning, holding management accountable to sound standards of corporate governance, compliance and ethical business conduct.\n\nHe also brings sound command over compliance management services including Company Law, statutory reporting, secretarial audits, labour laws and other statutory requirements — expertise that adds significant strength to the Board's governance oversight.",
    qualification: "Company Secretary, Masters in Commerce & Law Graduate",
    image: "/images/team/sachin-khurana.jpg",
  },
  {
    id: "aanchal-gupta",
    name: "Aanchal Gupta",
    role: "Non-Executive Independent Director",
    chip: "Independent Director",
    bio: "Ms. Aanchal Gupta is a Non-Executive Independent Director on the Board of the Company. She is a seasoned professional with over 16 years of experience in finance, cost analysis, corporate governance, and risk management.\n\nAs an Independent Director, she provides objective oversight of the Company's financial and governance practices, holding management accountable to high standards of transparency, risk management and regulatory compliance. She contributed significantly to business growth, financial management, and regulatory compliance.",
    qualification: "B.Com, CMA, MBA",
    image: "/images/team/aanchal-gupta.jpg",
  },
  {
    id: "ram-awtar-sharma",
    name: "Ram Awtar Sharma",
    role: "Chief Financial Officer",
    chip: "Key Managerial Personnel",
    bio: "Mr. Ram Awtar Sharma is the Chief Financial Officer of the Company. He is a Member of the Institute of Chartered Accountants of India (ICAI), with a varied experience of more than 25 years in finance, accounting and taxation matters.\n\nAs CFO, he is responsible for overseeing compliance across all financial matters of the Company. He is also responsible for the Company's finance and accounts function, including the quarterly financial results published on the Stock Exchanges and accounts published in the Annual Report, besides supporting the Board with financial insights for strategic decision-making.",
    qualification: "ACA (Associate Chartered Accountant)",
    image: "/images/team/ram-awtar-sharma.jpg",
  },
  {
    id: "shimpy-goyal",
    name: "Shimpy Goyal",
    role: "Company Secretary & Compliance Officer",
    chip: "Key Managerial Personnel",
    bio: "Ms. Shimpy Goyal is the Company Secretary and Compliance Officer of the Company. She is a qualified Company Secretary with over 8 years of experience in corporate secretarial functions, regulatory filings, and listing compliance.\n\nHer expertise includes handling end-to-end ROC and SEBI compliances, drafting and vetting corporate documents, managing Board and shareholder meetings, ensuring statutory adherence and liaising with regulatory authorities. She has worked extensively on governance frameworks, disclosure requirements, and compliance management systems, contributing to smooth corporate operations and fostering a strong compliance culture within the organisation.",
    qualification: "Company Secretary",
    image: "/images/team/shimpy-goyal.jpg",
  },
];
