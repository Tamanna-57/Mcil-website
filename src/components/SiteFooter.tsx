import Link from "next/link";
import { LOGO_HEIGHT, LOGO_NAME } from "@/lib/brand";
import type { SiteContent } from "@/lib/content/types";
import { navItems } from "@/lib/site-nav";
import AdminLink from "./AdminLink";

/**
 * Site footer: a sitemap, the registered-office details, and the legal line a
 * listed company is expected to carry.
 *
 * The link columns are built from `navItems` rather than a second list of
 * their own, so the footer cannot drift from the header. Destinations that do
 * not exist yet (`soon`) are left out — the header shows them greyed to signal
 * what is coming, but a footer sitemap full of dead entries just reads as
 * broken.
 */
export default function SiteFooter({
  company,
  isAdmin,
}: {
  company: SiteContent["company"];
  /** Whether this visitor is signed into the admin panel. */
  isAdmin: boolean;
}) {
  const columns = navItems
    // The contact panel is phone, email and address, which is exactly what the
    // block on the left already carries — as a column too it just reads twice.
    .filter((item) => item.id !== "contact")
    .map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      links: item.panel.links.filter((link) => link.href && !link.soon),
    }))
    .filter((column) => column.links.length > 0);

  return (
    <footer className="bg-navy text-white/75">
      {/* Sitemap */}
      <div className="mx-auto w-full max-w-6xl px-6 pt-16 pb-12 sm:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))] lg:gap-8">
          {/* Who and where */}
          <div>
            <span
              className="site-logo block"
              style={{ "--logo-h": `${LOGO_HEIGHT}px` } as React.CSSProperties}
              aria-hidden
            />
            <span className="sr-only">{LOGO_NAME}</span>

            <address className="mt-6 text-sm leading-relaxed not-italic">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-white/45 uppercase">
                Registered Office
              </p>
              <p className="mt-2">{company.registeredOffice}</p>

              <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-white/45 uppercase">
                Works
              </p>
              <p className="mt-2">{company.works}</p>

              <p className="mt-5 flex flex-col gap-1">
                <a
                  href={`tel:${company.phone.replace(/\s/g, "")}`}
                  className="w-fit transition-colors hover:text-white"
                >
                  {company.phone}
                </a>
                <a
                  href={`mailto:${company.email}`}
                  className="w-fit transition-colors hover:text-white"
                >
                  {company.email}
                </a>
              </p>
            </address>
          </div>

          {columns.map((column) => (
            <nav key={column.id} aria-label={column.label}>
              <h2 className="text-[11px] font-semibold tracking-[0.16em] text-white/45 uppercase">
                {column.href ? (
                  <Link
                    href={column.href}
                    className="transition-colors hover:text-white"
                  >
                    {column.label}
                  </Link>
                ) : (
                  column.label
                )}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link
                      href={link.href as string}
                      className="text-sm transition-colors hover:text-white"
                      {...(link.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Legal line */}
      <div className="border-t border-white/12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs leading-relaxed text-white/50">
            © {new Date().getFullYear()} {company.legalName}. All rights
            reserved.
            <span className="mt-1 block">
              CIN {company.cin} · BSE {company.bseScripCode} · ISIN{" "}
              {company.isin}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <Link
              href="/contact"
              className="text-white/50 transition-colors hover:text-white"
            >
              Contact
            </Link>
            <Link
              href="/investors"
              className="text-white/50 transition-colors hover:text-white"
            >
              Investors
            </Link>
            <AdminLink isAdmin={isAdmin} />
          </div>
        </div>
      </div>
    </footer>
  );
}
