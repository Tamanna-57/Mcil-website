import type { Metadata } from "next";
import ContactCard from "@/components/ContactCard";
import ContactDetails from "@/components/ContactDetails";

export const metadata: Metadata = {
  title: "Contact Us — Metal Coatings (India) Ltd",
  description:
    "Reach MCIL at the registered office in Nehru Place, New Delhi or at the works in Sector 59, Faridabad. Phone, email and enquiry form for orders and specifications.",
};

export default function ContactPage() {
  return (
    <main className="contact-ground px-5 pt-24 pb-16 sm:px-8 sm:pt-28 lg:px-[5vw] lg:pb-24">
      <div className="mx-auto w-full max-w-5xl">
        <ContactCard />
        <ContactDetails />
      </div>
    </main>
  );
}
