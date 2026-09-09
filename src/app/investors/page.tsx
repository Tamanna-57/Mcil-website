import type { Metadata } from "next";
import InvestorHero from "@/components/InvestorHero";

export const metadata: Metadata = {
  title: "Investors — Metal Coatings (India) Ltd",
  description:
    "MCIL investor relations: financials, stock exchange compliance, letters sent to the stock exchange, and policies, codes and unclaimed dividend records.",
};

export default function InvestorsPage() {
  return (
    <main>
      <InvestorHero />

      {/* The four document categories published on mcil.net/investors.aspx.
          These land as full sections in the next pass. */}
      <section className="bg-white px-6 py-24 sm:px-10 lg:px-[6.5vw]">
        <p className="font-display text-xs tracking-[0.2em] text-accent uppercase">
          Investor Relations
        </p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight font-light text-steel-900 sm:text-4xl">
          Financials, compliance filings, exchange correspondence and governance
          policies.
        </h2>
      </section>
    </main>
  );
}
