import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { isAdmin } from "@/lib/admin/session";
import { getContent } from "@/lib/content/store";

/**
 * The public site. The admin panel sits outside this group so it does not
 * inherit the site header — it has a chrome of its own.
 *
 * Header and footer are both the layout's: every page in the group closes on
 * the same sitemap, address and legal line, rather than the footer being
 * something each page has to remember to render. The contact page used to
 * carry its own, which is why it was the only one that had one at all.
 *
 * Reading the content here costs nothing extra — `getContent()` is memoised
 * per request, so the page below shares this read. `isAdmin()` looks at the
 * session cookie, which does mean every page in the group is rendered per
 * request; they already were, bar /sustainability.
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ company }, admin] = await Promise.all([getContent(), isAdmin()]);

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter company={company} isAdmin={admin} />
    </>
  );
}
