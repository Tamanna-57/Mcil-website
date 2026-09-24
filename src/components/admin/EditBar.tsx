"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { setEditing } from "@/lib/admin/edit-mode";
import type { SiteContent } from "@/lib/content/types";

/**
 * The in-page editor: the live site, editable where it stands.
 *
 * Shown only to a signed-in admin. With "Edit mode" on, every element a
 * component has marked with `edit()` / `editImage()` (lib/admin/editable) can
 * be changed in place — click text and type, or use the "Change image" button
 * over a photograph. Changes collect here until "Save", which writes each
 * touched section through the same API the full editor at /admin uses.
 *
 * Edits are held against their content path rather than read back off the
 * page at save time, because much of the page re-renders under the admin's
 * hands: the process stages and the team panel swap their text as they
 * change, and a carousel remounts its words. Whenever marked elements appear,
 * any held edit for their path is put back into them.
 */

const STORAGE_KEY = "mcil-edit-mode";

type Json = Record<string, unknown> | unknown[];

type Popover = {
  path: string;
  value: string;
  top: number;
  left: number;
  multiline: boolean;
};

type ImageChip = { path: string; top: number; left: number; key: string };

/* ------------------------------------------------------------ path helpers */

function getAt(root: unknown, path: string): unknown {
  let node = root;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

function setAt(root: Json, path: string, value: unknown) {
  const keys = path.split(".");
  let node: unknown = root;
  for (const key of keys.slice(0, -1)) {
    node = (node as Record<string, unknown>)[key];
    if (node === null || typeof node !== "object") return false;
  }
  (node as Record<string, unknown>)[keys[keys.length - 1]] = value;
  return true;
}

/** What a marked element currently says, in the form it is stored. */
function readElement(el: HTMLElement): string {
  if (el.hasAttribute("data-edit-multiline")) {
    return el.innerText
      .replace(/\r/g, "")
      .split(/\n\s*\n|\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n\n");
  }
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Put a stored value back into a marked element. */
function writeElement(el: HTMLElement, value: string) {
  if (el.hasAttribute("data-edit-raw")) {
    el.textContent = value.replace(/[{}]/g, "");
    return;
  }
  if (el.hasAttribute("data-edit-multiline")) {
    if (readElement(el) === value) return;
    el.replaceChildren(
      ...value.split(/\n\s*\n/).map((para) => {
        const p = document.createElement("p");
        p.textContent = para;
        return p;
      }),
    );
    return;
  }
  if (el.textContent !== value) el.textContent = value;
}

function isPopoverField(el: HTMLElement) {
  return el.hasAttribute("data-edit-raw") || Boolean(el.closest("button"));
}

/* ------------------------------------------------------------------ bar */

export default function EditBar({ content }: { content: SiteContent }) {
  const [on, setOn] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(
    null,
  );
  const [popover, setPopover] = useState<Popover | null>(null);
  const [chips, setChips] = useState<ImageChip[]>([]);

  const pending = useRef(new Map<string, string>());
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const say = useCallback((text: string, error = false) => {
    setToast({ text, error });
    window.setTimeout(() => setToast(null), error ? 5000 : 2600);
  }, []);

  const record = useCallback((path: string, value: string) => {
    const stored = getAt(contentRef.current, path);
    if (String(stored ?? "") === value) pending.current.delete(path);
    else pending.current.set(path, value);
    setPendingCount(pending.current.size);
  }, []);

  /* Restore the switch as it was left, so moving between pages keeps it. */
  useEffect(() => {
    /* After the first paint, so the server's render (always off) hydrates
       cleanly before the switch moves. */
    const frame = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem(STORAGE_KEY) === "1") setOn(true);
      } catch {
        /* private window: starts off */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ------------------------------------------------ marking the page up */

  useEffect(() => {
    setEditing(on);
    const root = document.documentElement;
    if (on) root.setAttribute("data-editing", "");
    else root.removeAttribute("data-editing");

    const prepare = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>("[data-edit]").forEach((el) => {
        const path = el.dataset.edit!;
        const held = pending.current.get(path);
        if (held !== undefined) writeElement(el, held);
        if (!on || isPopoverField(el)) {
          el.removeAttribute("contenteditable");
          /* Say how on hover, since a double-click is not something to
             guess. */
          if (on && el.closest("button")) el.title = "Double-click to edit";
          else if (el.title === "Double-click to edit")
            el.removeAttribute("title");
        } else {
          el.setAttribute("contenteditable", "plaintext-only");
          if (el.contentEditable !== "plaintext-only")
            el.contentEditable = "true";
          el.spellcheck = true;
        }
      });
      scope
        .querySelectorAll<HTMLImageElement>("img[data-edit-image]")
        .forEach((img) => {
          const held = pending.current.get(img.dataset.editImage!);
          if (held !== undefined && img.getAttribute("src") !== held) {
            img.removeAttribute("srcset");
            img.src = held;
          }
        });
    };

    prepare(document);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-edit], img[data-edit-image]")) {
            prepare(node.parentElement ?? document);
          } else {
            prepare(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (!on) return () => observer.disconnect();

    /* Typing: hold the new value, and mirror it into any other place the
       same text is shown (a team member's name is on the plate and the
       panel). */
    const onInput = (event: Event) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-edit]",
      );
      if (!el) return;
      const path = el.dataset.edit!;
      const value = readElement(el);
      record(path, value);
      document
        .querySelectorAll<HTMLElement>(`[data-edit="${CSS.escape(path)}"]`)
        .forEach((other) => {
          if (other !== el) writeElement(other, value);
        });
    };

    /* Enter ends a one-line field rather than breaking it. */
    const onKeyDown = (event: KeyboardEvent) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-edit]",
      );
      if (!el) return;
      if (event.key === "Enter" && !el.hasAttribute("data-edit-multiline")) {
        event.preventDefault();
        el.blur();
      }
      if (event.key === " " && el.closest("button")) event.stopPropagation();
    };

    /* Pasting brings text, never someone else's formatting. */
    const onPaste = (event: ClipboardEvent) => {
      const el = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-edit]",
      );
      if (!el) return;
      event.preventDefault();
      const text = event.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };

    /* A click on editable text edits it: it does not follow the link or
       press the button the text sits in. */
    const openPopover = (el: HTMLElement) => {
      const path = el.dataset.edit!;
      const rect = el.getBoundingClientRect();
      const width = Math.min(420, window.innerWidth - 24);
      setPopover({
        path,
        value:
          pending.current.get(path) ??
          String(getAt(contentRef.current, path) ?? readElement(el)),
        top: Math.min(rect.bottom + 8, window.innerHeight - 220),
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        multiline:
          el.hasAttribute("data-edit-multiline") ||
          el.hasAttribute("data-edit-raw"),
      });
    };

    /* A click on editable text edits it rather than following a link. Text
       on a button (a stage pill, a team plate) keeps the button working on a
       single click and is edited with a double-click instead. */
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-edit-ui]")) return;
      const el = target.closest<HTMLElement>("[data-edit]");
      if (!el) return;
      if (target.closest("a")) event.preventDefault();
      if (!el.hasAttribute("data-edit-raw")) return;
      event.preventDefault();
      event.stopPropagation();
      openPopover(el);
    };

    const onDoubleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-edit-ui]")) return;
      const el = target.closest<HTMLElement>("[data-edit]");
      if (!el || !isPopoverField(el)) return;
      event.preventDefault();
      event.stopPropagation();
      openPopover(el);
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      document
        .querySelectorAll<HTMLElement>("[contenteditable][data-edit]")
        .forEach((el) => el.removeAttribute("contenteditable"));
    };
  }, [on, record]);

  /* ------------------------------------------------ image buttons */

  /* One "Change image" button over each photograph that can be seen right
     now. Worked out afresh as the page scrolls and slides change, and laid
     over the page rather than inside the photograph, so no overlay or
     stacking order on the page can cover it. */
  useEffect(() => {
    if (!on) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      const seen = new Set<string>();
      const next: ImageChip[] = [];
      document
        .querySelectorAll<HTMLElement>("[data-edit-image]")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width < 60 || rect.height < 40) return;
          if (rect.bottom < 60 || rect.top > window.innerHeight - 40) return;
          if (
            typeof el.checkVisibility === "function" &&
            !el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            })
          ) {
            return;
          }
          const path = el.dataset.editImage!;
          const key = `${path}@${Math.round(rect.left)}`;
          if (seen.has(key)) return;
          seen.add(key);
          next.push({
            path,
            key,
            top: Math.max(rect.top, 70) + 10,
            left: rect.left + 10,
          });
        });
      setChips(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };
    place();
    const timer = window.setInterval(schedule, 600);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [on]);

  const fileInput = useRef<HTMLInputElement | null>(null);
  const imageTarget = useRef<string | null>(null);

  const uploadImage = async (file: File) => {
    const path = imageTarget.current;
    if (!path) return;
    const body = new FormData();
    body.append("file", file);
    body.append("kind", "image");
    say("Uploading…");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) throw new Error(data.error || res.statusText);
      record(path, data.url);
      document
        .querySelectorAll<HTMLImageElement>(
          `img[data-edit-image="${CSS.escape(path)}"]`,
        )
        .forEach((img) => {
          img.removeAttribute("srcset");
          img.src = data.url!;
        });
      say("Image replaced — press Save to publish it");
    } catch (err) {
      say(`Upload failed: ${(err as Error).message}`, true);
    }
  };

  /* ------------------------------------------------ saving */

  const save = async () => {
    if (!pending.current.size) return;
    setSaving(true);
    const next = structuredClone(contentRef.current) as SiteContent;
    const sections = new Set<keyof SiteContent>();
    for (const [path, value] of pending.current) {
      const before = getAt(next, path);
      const typed =
        typeof before === "number" &&
        value.trim() !== "" &&
        !Number.isNaN(Number(value))
          ? Number(value)
          : value;
      if (setAt(next as unknown as Json, path, typed)) {
        sections.add(path.split(".")[0] as keyof SiteContent);
      }
    }
    try {
      for (const section of sections) {
        const res = await fetch(`/api/admin/content/${section}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: next[section] }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(data.error || res.statusText);
        }
      }
      contentRef.current = next;
      pending.current.clear();
      setPendingCount(0);
      say("Saved — the site is updated");
      /* A full reload rather than a refresh: typing in place has moved text
         nodes React still thinks it owns, and a fresh page is the one way to
         hand it a DOM that matches. */
      window.setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      say(`Save failed: ${(err as Error).message}`, true);
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!pending.current.size) return;
    if (!confirm("Throw away the changes you have not saved?")) return;
    pending.current.clear();
    setPendingCount(0);
    window.location.reload();
  };

  /* Leaving with unsaved changes asks first. */
  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!pending.current.size) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  const signOut = async () => {
    if (pending.current.size && !confirm("Sign out without saving?")) return;
    pending.current.clear();
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  /* ------------------------------------------------ render */

  const button =
    "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default disabled:opacity-40";

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void uploadImage(file);
        }}
      />

      {on &&
        chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            data-edit-ui
            onClick={() => {
              imageTarget.current = chip.path;
              fileInput.current?.click();
            }}
            className="fixed z-[70] flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-steel-900 shadow-lg ring-1 ring-steel-900/15 hover:bg-white"
            style={{ top: chip.top, left: chip.left }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="m21 16-5-5-9 8" />
            </svg>
            Change image
          </button>
        ))}

      {popover && (
        <div
          data-edit-ui
          className="fixed z-[80] w-[min(420px,calc(100vw-24px))] rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-steel-900/15"
          style={{ top: popover.top, left: popover.left }}
        >
          <textarea
            autoFocus
            rows={popover.multiline ? 6 : 2}
            value={popover.value}
            onChange={(e) => setPopover({ ...popover, value: e.target.value })}
            className="w-full resize-y rounded-lg border border-steel-900/20 p-2 text-sm text-steel-900 outline-none focus:border-brand"
          />
          {popover.path.startsWith("products.") && (
            <p className="mt-1 text-[11px] text-steel-800/70">
              Put words in {"{curly brackets}"} to underline them.
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className={`${button} text-steel-800 hover:bg-steel-900/5`}
              onClick={() => setPopover(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${button} bg-steel-900 text-white hover:bg-steel-800`}
              onClick={() => {
                const value = popover.multiline
                  ? popover.value.trim()
                  : popover.value.replace(/\s+/g, " ").trim();
                record(popover.path, value);
                document
                  .querySelectorAll<HTMLElement>(
                    `[data-edit="${CSS.escape(popover.path)}"]`,
                  )
                  .forEach((el) => writeElement(el, value));
                setPopover(null);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div
        data-edit-ui
        className="fixed bottom-4 left-1/2 z-[90] flex max-w-[calc(100vw-16px)] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-full bg-steel-900/95 px-2 py-1.5 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
      >
        <span className="px-2 text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
          MCIL Admin
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => {
            if (on && pending.current.size) {
              say("Save or discard your changes first", true);
              return;
            }
            setPopover(null);
            setOn(!on);
            /* Remembered for the tab, so a reload or the next page keeps it.
               Written here rather than whenever the switch changes, or the
               first render — always off — would overwrite it before it could
               be read back. */
            try {
              sessionStorage.setItem(STORAGE_KEY, on ? "0" : "1");
            } catch {
              /* private window: not remembered */
            }
          }}
          className={`${button} flex items-center gap-2 ${on ? "bg-accent text-white" : "bg-white/10 hover:bg-white/20"}`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${on ? "bg-white" : "bg-white/40"}`}
          />
          {on ? "Editing" : "Edit mode"}
        </button>

        {on && (
          <>
            <span className="px-1 text-xs text-white/60 tabular-nums">
              {pendingCount === 0
                ? "No changes"
                : `${pendingCount} unsaved change${pendingCount === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              disabled={!pendingCount || saving}
              onClick={discard}
              className={`${button} bg-white/10 hover:bg-white/20`}
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!pendingCount || saving}
              onClick={save}
              className={`${button} bg-white text-steel-900 hover:bg-white/90`}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        )}

        <Link
          href="/admin"
          className={`${button} text-white/75 hover:bg-white/10 hover:text-white`}
          title="Lists, reports, figures and everything else"
        >
          Full editor
        </Link>
        <button
          type="button"
          onClick={signOut}
          className={`${button} text-white/75 hover:bg-white/10 hover:text-white`}
        >
          Sign out
        </button>
      </div>

      {toast && (
        <div
          data-edit-ui
          role="status"
          className={`fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-xl ${
            toast.error
              ? "bg-red-600 text-white"
              : "bg-white text-steel-900 ring-1 ring-steel-900/10"
          }`}
        >
          {toast.text}
        </div>
      )}
    </>
  );
}
