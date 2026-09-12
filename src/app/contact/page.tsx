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
    <main>
      {/* A short dark band: it carries the eyebrow, and it is what the fixed
          header's white type sits on before the card scrolls up under it. */}
      <section className="bg-steel-900 px-6 pt-32 pb-40 text-center sm:px-10 lg:px-[6.5vw] lg:pb-44">
        <p className="text-[11px] font-semibold tracking-[0.24em] text-brand-pale uppercase">
          [ Contact Us ]
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
          Registered office in New Delhi, works in Faridabad — and someone at
          the end of both numbers.
        </p>
      </section>

      <ContactCard />

      <ContactDetails />
    </main>
  );
}
