import type { Metadata } from "next";
import InvestorHero from "@/components/InvestorHero";
import InvestorHighlights from "@/components/InvestorHighlights";
import InvestorPerformance from "@/components/InvestorPerformance";
import InvestorReports from "@/components/InvestorReports";
import { getContent } from "@/lib/content/store";

export const metadata: Metadata = {
  title: "Investors — Metal Coatings (India) Ltd",
  description:
    "MCIL investor relations: financials, stock exchange compliance, letters sent to the stock exchange, and policies, codes and unclaimed dividend records.",
};

export const dynamic = "force-dynamic";

export default async function InvestorsPage() {
  const { investors } = await getContent();

  return (
    <main>
      <InvestorHero slides={investors.slides} />

      <InvestorHighlights
        heading={investors.highlights.heading}
        items={investors.highlights.items}
      />

      <InvestorPerformance
        title={investors.performance.title}
        standfirst={investors.performance.standfirst}
        metrics={investors.performance.metrics}
      />

      <InvestorReports
        heading={investors.reports.heading}
        categories={investors.reports.categories}
      />
    </main>
  );
}
