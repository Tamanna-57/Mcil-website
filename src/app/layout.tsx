import type { Metadata } from "next";
import { Josefin_Sans, Montserrat } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

/* Display face: thin, geometric, high-waisted. Carries the large headlines
   and the counter figures, always at light weight with open tracking. */
const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
});

/* Everything else — nav, buttons, chips, labels, body copy. */

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metal Coatings (India) Ltd — Cold Rolled & HRPO Steel Strips",
  description:
    "MCIL manufactures cold rolled steel strips, coils and HRPO steel for auto components, white goods, electrical equipment and power transmission.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${josefin.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
