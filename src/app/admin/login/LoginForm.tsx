"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm({
  next,
  configured,
}: {
  next: string;
  /** False when the deployment has no ADMIN_PASSWORD set. */
  configured: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const data = (await res.json()) as { error?: string };
      setError(data.error || "Incorrect password.");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-5 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-2xl"
      >
        <h1 className="font-display text-2xl font-semibold text-steel-900">
          MCIL Admin
        </h1>
        <p className="mt-1.5 text-sm text-steel-800/75">
          Sign in to edit the site.
        </p>

        {!configured ? (
          <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900 ring-1 ring-amber-200">
            No admin password is set on this deployment. Add an{" "}
            <code className="font-mono text-[0.85em]">ADMIN_PASSWORD</code>{" "}
            environment variable and redeploy.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
          >
            {error}
          </p>
        ) : null}

        <label
          htmlFor="password"
          className="mt-6 mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-steel-800 uppercase"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          required
          disabled={!configured}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-steel-900/15 bg-white px-3 py-2.5 text-sm text-steel-900 outline-none transition-colors focus:border-brand-deep focus:ring-2 focus:ring-brand-deep/20 disabled:bg-steel-900/5"
        />

        <button
          type="submit"
          disabled={busy || !configured}
          className="mt-5 w-full cursor-pointer rounded-lg bg-steel-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <Link
          href="/"
          className="mt-6 block text-center text-xs text-steel-800/60 transition-colors hover:text-steel-900"
        >
          ← Back to the website
        </Link>
      </form>
    </main>
  );
}
