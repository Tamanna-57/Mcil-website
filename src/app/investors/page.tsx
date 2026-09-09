import type { Metadata } from "next";
import InvestorHero from "@/components/InvestorHero";
import InvestorHighlights from "@/components/InvestorHighlights";
import InvestorPerformance from "@/components/InvestorPerformance";

export const metadata: Metadata = {
  title: "Investors — Metal Coatings (India) Ltd",
  description:
    "MCIL investor relations: financials, stock exchange compliance, letters sent to the stock exchange, and policies, codes and unclaimed dividend records.",
};

export default function InvestorsPage() {
  return (
    <main>
      <InvestorHero />

      <InvestorHighlights />

      <InvestorPerformance />
    </main>
  );
}
