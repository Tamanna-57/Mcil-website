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
  return (
    <LoginForm
      next={next && next.startsWith("/admin") ? next : "/admin"}
      configured={!isAdminDisabled()}
    />
  );
}
