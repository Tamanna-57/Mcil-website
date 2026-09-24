import type { Metadata } from "next";
import { isAdminDisabled } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign In — Metal Coatings (India) Ltd",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  /* Signing in lands on the site itself, with the edit bar, unless the
     visitor was on their way to a particular page. Only a path on this site
     is followed — never "//elsewhere". */
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <LoginForm
      next={safeNext}
      configured={!isAdminDisabled()}
    />
  );
}
