import SiteHeader from "@/components/SiteHeader";

/**
 * The public site. The admin panel sits outside this group so it does not
 * inherit the site header — it has a chrome of its own.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
