"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The way in to the content editor, and back out of it.
 *
 * Signing out has to be a POST — a plain link would let any page on the
 * internet sign an admin out by embedding it — so this is the one part of the
 * footer that needs to be interactive.
 */
export default function AdminLink({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!isAdmin) {
    return (
      <Link
        href="/admin/login"
        className="text-white/50 transition-colors hover:text-white"
      >
        Admin
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/admin"
        className="text-white/50 transition-colors hover:text-white"
      >
        Edit site
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await fetch("/api/admin/logout", { method: "POST" });
          router.refresh();
          setBusy(false);
        }}
        className="cursor-pointer text-white/50 transition-colors hover:text-white disabled:opacity-50"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
    </>
  );
}
