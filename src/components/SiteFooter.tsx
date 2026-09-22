import Link from "next/link";
import { LOGO_HEIGHT, LOGO_LINE, LOGO_NAME } from "@/lib/brand";
import type { SiteContent } from "@/lib/content/types";
import { navItems } from "@/lib/site-nav";
import AdminLink from "./AdminLink";

/** Small caps heading over each column of the footer. */
const COLUMN_HEAD =
  "text-[10px] font-semibold tracking-[0.22em] text-white/40 uppercase";

/**
 * Site footer: the mark and how to reach the company, the sections, both
 * addresses, and the listing details a company on the BSE is expected to
 * carry, over one row of four columns.
 *
 * It was a short brand block on the left and a single line of section links
 * pushed over to the right, which left the middle of a wide screen empty and
 * crammed CIN, scrip code and ISIN into the legal line as an aside. The same
 * material is set out in columns here: nothing new has been added, it is
 * simply given the width it needs, so the footer fills its row rather than
 * bracketing a gap, and the legal line is left to say only what it is for.
 *
 * The sections come from `navItems`, so the column cannot drift from the
 * header. Items with no page of their own are skipped — the header's drop
 * panels are where the rest of the sitemap lives.
 */
export default function SiteFooter({
  company,
  isAdmin,
}: {
  company: SiteContent["company"];
  /** Whether this visitor is signed into the admin panel. */
  isAdmin: boolean;
}) {
  const sections = navItems.filter((item) => item.href);

  return (
    <footer className="bg-navy text-white/70">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 lg:py-14">
        {/* Four columns on a wide screen, set 4 / 2 / 3 / 3 so each one is as
            wide as what it holds: an address needs the room a list of section
            names does not. */}
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Who, and how to reach them */}
          <div className="lg:col-span-4">
            <div className="flex w-fit flex-col items-center gap-1">
              <span
                className="site-logo block"
                style={
                  { "--logo-h": `${LOGO_HEIGHT}px` } as React.CSSProperties
                }
                aria-hidden
              />
              <span className="site-wordmark block" aria-hidden>
                {LOGO_LINE}
              </span>
              <span className="sr-only">{LOGO_NAME}</span>
            </div>

            <p className="mt-6 max-w-[22rem] text-[13px] leading-relaxed">
              Cold rolled steel strips, coils and HRPO, rolled at Faridabad.
              Promoted by the {company.promoters}, {company.incorporated}.
            </p>

            <div className="mt-5 flex flex-col items-start gap-1 text-[13px]">
              <a
                href={`tel:${company.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-white"
              >
                {company.phone}
              </a>
              <a
                href={`mailto:${company.email}`}
                className="transition-colors hover:text-white"
              >
                {company.email}
              </a>
            </div>
          </div>

          {/* One link per section; the header's panels carry the rest. */}
          <nav aria-labelledby="footer-sections" className="lg:col-span-2">
            <h2 id="footer-sections" className={COLUMN_HEAD}>
              Sections
            </h2>
            <ul className="mt-4 space-y-2 text-[13px]">
              {sections.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href as string}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Both addresses, each with the number that answers there. The
              contact page sets them out properly; this is the reminder. */}
          <div className="lg:col-span-3">
            <h2 className={COLUMN_HEAD}>Where we are</h2>
            <address className="mt-4 space-y-4 text-[13px] leading-relaxed not-italic">
              <div>
                <p className="text-white/40">Registered office</p>
                <p className="mt-1">{company.registeredOffice}</p>
              </div>
              <div>
                <p className="text-white/40">Works</p>
                <p className="mt-1">{company.works}</p>
                <p className="mt-1">
                  <a
                    href={`tel:${company.worksPhone.split("/")[0].replace(/\s/g, "")}`}
                    className="transition-colors hover:text-white"
                  >
                    {company.worksPhone}
                  </a>
                </p>
              </div>
            </address>
          </div>

          {/* The listing details, which used to be squeezed into the legal
              line. Labelled, they can actually be read off and used. */}
          <div className="lg:col-span-3">
            <h2 className={COLUMN_HEAD}>Listed</h2>
            <dl className="mt-4 space-y-3 text-[13px]">
              <div>
                <dt className="text-white/40">BSE scrip code</dt>
                <dd className="mt-1 text-white/75">
                  {company.bseScripCode}
                  <span className="px-2 text-white/25">·</span>
                  {company.bseScripId}
                </dd>
              </div>
              <div>
                <dt className="text-white/40">ISIN</dt>
                <dd className="mt-1 text-white/75">{company.isin}</dd>
              </div>
              <div>
                <dt className="text-white/40">CIN</dt>
                <dd className="mt-1 break-words text-white/75">
                  {company.cin}
                </dd>
              </div>
            </dl>

            <Link
              href="/investors"
              className="mt-5 inline-flex items-center gap-2 text-[13px] text-white/75 transition-colors hover:text-white"
            >
              Investor relations
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Legal line */}
      <div className="border-t border-white/12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>
            © {new Date().getFullYear()} {company.legalName}. All rights
            reserved.
          </p>

          <div className="flex items-center gap-4">
            <AdminLink isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </footer>
  );
}
