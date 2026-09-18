import type { Metadata } from "next";
import { getContent } from "@/lib/content/store";
import Dashboard from "./Dashboard";

export const metadata: Metadata = {
  title: "Admin — Metal Coatings (India) Ltd",
  robots: { index: false, follow: false },
};

/* The panel must always show what is stored right now, never a build-time
   snapshot of it. */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return <Dashboard content={await getContent()} />;
}
