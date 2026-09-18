"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { sections } from "@/lib/admin/schema";
import type { SiteContent } from "@/lib/content/types";
import { FieldList, StorageContext } from "./Fields";
import type { StorageInfo } from "./upload-client";

type Json = Record<string, unknown>;
type SectionId = (typeof sections)[number]["id"];

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/** Where each section's edits show up, so the panel can offer a look. */
const PREVIEW: Record<SectionId, string> = {
  home: "/",
  about: "/about",
  products: "/products",
  contact: "/contact",
  company: "/contact",
  investors: "/investors",
};

export default function Dashboard({
  content,
  storage,
}: {
  content: SiteContent;
  /** Which upload path this deployment uses; read by the file fields. */
  storage: StorageInfo;
}) {
  const router = useRouter();
  const [active, setActive] = useState<SectionId>("home");
  const [draft, setDraft] = useState<Record<string, Json>>(
    () => structuredClone(content) as unknown as Record<string, Json>,
  );
  const [saved, setSaved] = useState<Record<string, Json>>(
    () => structuredClone(content) as unknown as Record<string, Json>,
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const schema = useMemo(
    () => sections.find((section) => section.id === active)!,
    [active],
  );

  /** Which tabs are carrying unsaved edits, so the nav can mark them. */
  const dirty = useMemo(() => {
    const out = new Set<string>();
    for (const section of sections) {
      if (
        JSON.stringify(draft[section.id]) !== JSON.stringify(saved[section.id])
      ) {
        out.add(section.id);
      }
    }
    return out;
  }, [draft, saved]);

  const fail = useCallback(
    (message: string) => setStatus({ kind: "error", message }),
    [],
  );

  async function save() {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch(`/api/admin/content/${active}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value: draft[active] }),
      });
      const data = (await res.json()) as { value?: Json; error?: string };
      if (!res.ok || !data.value) {
        fail(data.error || "Could not save.");
        return;
      }
      setDraft((current) => ({ ...current, [active]: data.value as Json }));
      setSaved((current) => ({ ...current, [active]: data.value as Json }));
      setStatus({ kind: "saved" });
      // The public pages read the store on every request; refreshing here is
      // what makes a second tab showing /admin agree with what was just saved.
      router.refresh();
    } catch {
      fail("Could not reach the server.");
    }
  }

  async function reset() {
    if (
      !confirm(
        `Discard every saved change to “${schema.label}” and go back to the text the site ships with?`,
      )
    ) {
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const res = await fetch(`/api/admin/content/${active}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { value?: Json; error?: string };
      if (!res.ok || !data.value) {
        fail(data.error || "Could not reset.");
        return;
      }
      setDraft((current) => ({ ...current, [active]: data.value as Json }));
      setSaved((current) => ({ ...current, [active]: data.value as Json }));
      setStatus({ kind: "saved" });
      router.refresh();
    } catch {
      fail("Could not reach the server.");
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const isDirty = dirty.has(active);

  return (
    <StorageContext value={storage}>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-steel-900/10 bg-navy text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
            <div className="mr-auto">
              <p className="font-display text-lg leading-none font-semibold">
                MCIL Admin
              </p>
              <p className="mt-1 text-[11px] tracking-[0.14em] text-white/55 uppercase">
                Site content
              </p>
            </div>

            <Link
              href={PREVIEW[active]}
              target="_blank"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              View page ↗
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-5 py-8">
          <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
            {/* Section nav */}
            <nav className="lg:sticky lg:top-24 lg:self-start">
              <ul className="flex flex-wrap gap-1 lg:flex-col">
                {sections.map((section) => {
                  const current = section.id === active;
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(section.id);
                          setStatus({ kind: "idle" });
                        }}
                        aria-current={current ? "page" : undefined}
                        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                          current
                            ? "bg-steel-900 text-white"
                            : "text-steel-800 hover:bg-steel-900/6"
                        }`}
                      >
                        <span className="flex-1">{section.label}</span>
                        {dirty.has(section.id) ? (
                          <span
                            title="Unsaved changes"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Editor */}
            <div className="min-w-0">
              <div className="mb-6">
                <h1 className="font-display text-2xl font-semibold text-steel-900">
                  {schema.label}
                </h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-steel-800/80">
                  {schema.blurb}
                </p>
              </div>

              <div className="rounded-2xl bg-surface p-5 ring-1 ring-steel-900/10 sm:p-7">
                <FieldList
                  fields={schema.fields}
                  value={draft[active] ?? {}}
                  onChange={(next) =>
                    setDraft((current) => ({ ...current, [active]: next }))
                  }
                  onError={fail}
                />
              </div>

              {/* Save bar — sticks to the bottom so it is reachable from
                anywhere in a long section. */}
              <div className="sticky bottom-4 mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 shadow-lg ring-1 ring-steel-900/10">
                <button
                  type="button"
                  onClick={save}
                  disabled={!isDirty || status.kind === "saving"}
                  className="cursor-pointer rounded-lg bg-steel-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status.kind === "saving" ? "Saving…" : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-steel-800 transition-colors hover:bg-steel-900/6"
                >
                  Restore original
                </button>

                <p
                  aria-live="polite"
                  className={`ml-auto text-sm ${
                    status.kind === "error"
                      ? "text-red-700"
                      : "text-steel-800/70"
                  }`}
                >
                  {status.kind === "error"
                    ? status.message
                    : status.kind === "saved" && !isDirty
                      ? "Saved — the site is live with these changes."
                      : isDirty
                        ? "Unsaved changes"
                        : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorageContext>
  );
}
