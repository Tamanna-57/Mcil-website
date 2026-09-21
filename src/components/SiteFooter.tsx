import Link from "next/link";
import { LOGO_HEIGHT, LOGO_LINE, LOGO_NAME } from "@/lib/brand";
import type { SiteContent } from "@/lib/content/types";
import { navItems } from "@/lib/site-nav";
import AdminLink from "./AdminLink";

/**
 * Site footer: the mark, where the company is, one row of sections, and the
 * legal line a listed company is expected to carry.
 *
 * It was a five-column sitemap repeating every link in the header's drop
 * panels, which ran to about 780px — a screenful of footer under every page.
 * The panels are one hover away at the top of the page, so the footer keeps
 * only the top-level destinations, on a single row.
 *
 * Those come from `navItems`, so the row cannot drift from the header. Items
 * with no page of their own are skipped.
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
      <div className="mx-auto w-full max-w-6xl px-6 py-8 sm:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* Who and where */}
          <div className="lg:max-w-[21rem]">
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

            {/* Both addresses on one line each: the contact page sets them out
                properly, and this is the reminder, not the record. */}
            <address className="mt-5 space-y-1 text-[13px] leading-relaxed not-italic">
              <p>
                <span className="text-white/40">Office</span>{" "}
                {company.registeredOffice}
              </p>
              <p>
                <span className="text-white/40">Works</span> {company.works}
              </p>
              <p className="pt-1">
                <a
                  href={`tel:${company.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {company.phone}
                </a>
                <span className="px-2 text-white/25">·</span>
                <a
                  href={`mailto:${company.email}`}
                  className="transition-colors hover:text-white"
                >
                  {company.email}
                </a>
              </p>
            </address>
          </div>

          {/* One row of sections; the header's panels carry the rest. */}
          <nav aria-label="Sections">
            <ul className="flex flex-wrap gap-x-5 gap-y-2.5 text-[13px] lg:justify-end">
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
        </div>
      </div>

      {/* Legal line */}
      <div className="border-t border-white/12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-white/45 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName}
            <span className="px-2 text-white/25">·</span>
            CIN {company.cin}
            <span className="px-2 text-white/25">·</span>
            BSE {company.bseScripCode}
            <span className="px-2 text-white/25">·</span>
            ISIN {company.isin}
          </p>

          <AdminLink isAdmin={isAdmin} />
        </div>
      </div>
    </footer>
  );
}
