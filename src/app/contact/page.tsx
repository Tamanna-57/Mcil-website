import type { Metadata } from "next";
import ContactDetails from "@/components/ContactDetails";
import ContactForm from "@/components/ContactForm";
import ContactMap from "@/components/ContactMap";

export const metadata: Metadata = {
  title: "Contact Us — Metal Coatings (India) Ltd",
  description:
    "Reach MCIL at the registered office in Nehru Place, New Delhi or at the works in Sector 59, Faridabad. Phone, email and enquiry form for orders and specifications.",
};

export default function ContactPage() {
  return (
    <main>
      <ContactMap />

      <ContactForm />

      <ContactDetails />
    </main>
  );
}
