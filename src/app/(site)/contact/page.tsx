import type { Metadata } from "next";
import ContactCard from "@/components/ContactCard";
import ContactDetails from "@/components/ContactDetails";
import SiteFooter from "@/components/SiteFooter";
import { isAdmin } from "@/lib/admin/session";
import { getContent } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Contact Us — Metal Coatings (India) Ltd",
  description:
    "Reach MCIL at the registered office in Nehru Place, New Delhi or at the works in Sector 59, Faridabad. Phone, email and enquiry form for orders and specifications.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [{ contact, company }, admin] = await Promise.all([
    getContent(),
    isAdmin(),
  ]);

  return (
    <>
      {/*
       * The map at the top of the card is a Google embed, and the first thing
       * it costs is a fresh DNS lookup and TLS handshake to three hosts it has
       * never spoken to. These go out in the document head, so the connections
       * are open by the time the iframe asks for anything. React hoists them.
       */}
      <link rel="preconnect" href="https://www.google.com" />
      <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
      <link
        rel="preconnect"
        href="https://maps.googleapis.com"
        crossOrigin=""
      />
      <link rel="dns-prefetch" href="https://khms0.googleapis.com" />
      <link rel="dns-prefetch" href="https://khms1.googleapis.com" />

      <main className="contact-ground px-5 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-[5vw] lg:pb-24">
        <div className="mx-auto w-full max-w-5xl">
          <ContactCard locations={contact.locations} />
          <ContactDetails locations={contact.locations} company={company} />
        </div>
      </main>

      <SiteFooter company={company} isAdmin={admin} />
    </>
  );
}
