"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Editor,
  EditorContext,
  getAt,
  setAt,
  type UploadKind,
} from "@/lib/admin/draft";
import { setEditing } from "@/lib/admin/edit-mode";
import { specFor } from "@/lib/admin/lists";
import type { SiteContent } from "@/lib/content/types";
import FiguresDialog from "./FiguresDialog";

/**
 * The in-page editor: the live site, editable where it stands.
 *
 * Shown only to a signed-in admin, and wrapped round the whole site so the
 * sections can render from the admin's draft rather than from what is
 * published. With "Edit mode" on:
 *
 * - every outlined piece of text can be clicked and typed into;
 * - every photograph carries a "Change image" button (and "Remove", where the
 *   page has something to show without one);
 * - pointing at a slide, a person, a customer, a card or a product brings up
 *   its toolbar — move it, add another after it, delete it;
 * - the reports list takes new filings, replacement files and deletions, and
 *   an annual report can be read for the investor figures.
 *
 * Nothing is published until "Save", which writes every section that changed
 * through /api/admin/content/[section] and reloads the page.
 *
 * Typing is not pushed into the draft on every keystroke — a re-render under
 * the caret would move it — but held against its path and committed when the
 * field loses focus, or before anything that reshapes a list.
 */

const STORAGE_KEY = "mcil-edit-mode";
const SECTIONS = [
  "home",
  "about",
  "products",
  "contact",
  "company",
  "investors",
] as const satisfies readonly (keyof SiteContent)[];

type Popover = {
  path: string;
  value: string;
  top: number;
  left: number;
  multiline: boolean;
};

type ImageChip = {
  path: string;
  removes: string | null;
  empty: boolean;
  top: number;
  left: number;
  key: string;
};

type ItemBar = {
  list: string;
  index: number;
  count: number;
  label: string;
  top: number;
  /* Hung from whichever side of the entry is nearer the middle of the
     window, so it never runs off the edge. */
  left?: number;
  right?: number;
};

/* ------------------------------------------------------------ DOM helpers */

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

/** Put a held value back into a marked element that was just re-drawn. */
function writeElement(el: HTMLElement, value: string) {
  if (el.hasAttribute("data-edit-raw")) return;
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

/** A stored number stays a number when it is edited as text. */
function typed(root: unknown, path: string, value: string): unknown {
  const before = getAt(root, path);
  if (
    typeof before === "number" &&
    value.trim() !== "" &&
    !Number.isNaN(Number(value.replace(/,/g, "")))
  ) {
    return Number(value.replace(/,/g, ""));
  }
  return value;
}

/* ------------------------------------------------------------------ bar */

export default function EditBar({
  content,
  children,
}: {
  content: SiteContent;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const [draft, setDraft] = useState(content);
  const [changes, setChanges] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(
    null,
  );
  const [popover, setPopover] = useState<Popover | null>(null);
  const [chips, setChips] = useState<ImageChip[]>([]);
  const [itemBar, setItemBar] = useState<ItemBar | null>(null);
  const [figures, setFigures] = useState<{ file?: File } | null>(null);

  /* The draft is also kept in a ref, so a save or a list change straight
     after a commit reads what was just written rather than the last render. */
  const draftRef = useRef(content);
  const saved = useRef(content);
  const pending = useRef(new Map<string, string>());

  const apply = useCallback((change: (d: SiteContent) => SiteContent) => {
    const next = change(draftRef.current);
    if (next === draftRef.current) return;
    draftRef.current = next;
    setDraft(next);
    setChanges((n) => n + 1);
  }, []);

  const toastTimer = useRef(0);
  const say = useCallback((text: string, error = false) => {
    setToast({ text, error });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(
      () => setToast(null),
      error ? 5000 : 2800,
    );
  }, []);

  /* ------------------------------------------------ the draft */

  /** Push typing still held against a path into the draft. */
  const commit = useCallback(
    (only?: string) => {
      const held = [...pending.current].filter(
        ([path]) => only === undefined || path === only,
      );
      if (!held.length) return;
      for (const [path] of held) pending.current.delete(path);
      apply((d) =>
        held.reduce((acc, [path, value]) => {
          const next = typed(acc, path, value);
          return getAt(acc, path) === next ? acc : setAt(acc, path, next);
        }, d),
      );
    },
    [apply],
  );

  const listAt = (d: SiteContent, list: string) => {
    const value = getAt(d, list);
    return Array.isArray(value) ? value : [];
  };

  const editor: Editor = useMemo(
    () => ({
      on,
      draft,
      update: (path, value) => {
        pending.current.delete(path);
        commit();
        apply((d) => setAt(d, path, value));
      },
      insert: (list, index, item) => {
        commit();
        apply((d) => {
          const next = [...listAt(d, list)];
          next.splice(index, 0, item);
          return setAt(d, list, next);
        });
      },
      remove: (list, index) => {
        commit();
        apply((d) => {
          const next = [...listAt(d, list)];
          next.splice(index, 1);
          return setAt(d, list, next);
        });
      },
      move: (list, from, to) => {
        commit();
        apply((d) => {
          const next = [...listAt(d, list)];
          if (to < 0 || to >= next.length) return d;
          const [entry] = next.splice(from, 1);
          next.splice(to, 0, entry);
          return setAt(d, list, next);
        });
      },
      upload: async (file: File, kind: UploadKind) => {
        const body = new FormData();
        body.append("file", file);
        body.append("kind", kind);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (!res.ok || !data.url) {
          throw new Error(data.error || res.statusText || "Upload failed");
        }
        return data.url;
      },
      say,
      openFigures: (file?: File) => {
        commit();
        setFigures({ file });
      },
    }),
    [on, draft, apply, commit, say],
  );

  const unsaved = changes > 0;

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
        const held = pending.current.get(el.dataset.edit!);
        if (held !== undefined) writeElement(el, held);
        if (!on || isPopoverField(el)) {
          el.removeAttribute("contenteditable");
          /* Say how on hover, since a double-click is not something to
             guess. */
          if (on && isPopoverField(el)) el.title = "Double-click to edit";
          else if (el.title === "Double-click to edit")
            el.removeAttribute("title");
        } else {
          el.setAttribute("contenteditable", "plaintext-only");
          if (el.contentEditable !== "plaintext-only")
            el.contentEditable = "true";
          el.spellcheck = true;
        }
      });
    };

    prepare(document);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-edit]")) {
            prepare(node.parentElement ?? document);
          } else {
            prepare(node);
          }
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (!on) return () => observer.disconnect();

    const fieldOf = (event: Event) =>
      (event.target as HTMLElement).closest?.<HTMLElement>("[data-edit]") ??
      null;

    /* Typing: hold the new value, and mirror it into any other place the
       same text is shown (a team member's name is on the plate and the
       panel). */
    const onInput = (event: Event) => {
      const el = fieldOf(event);
      if (!el) return;
      const path = el.dataset.edit!;
      const value = readElement(el);
      pending.current.set(path, value);
      setChanges((n) => (n === 0 ? 1 : n));
      document
        .querySelectorAll<HTMLElement>(`[data-edit="${CSS.escape(path)}"]`)
        .forEach((other) => {
          if (other !== el) writeElement(other, value);
        });
    };

    /* Leaving a field puts what was typed into the draft. */
    const onFocusOut = (event: FocusEvent) => {
      const el = fieldOf(event);
      if (el) commit(el.dataset.edit!);
    };

    /* Enter ends a one-line field rather than breaking it. */
    const onKeyDown = (event: KeyboardEvent) => {
      const el = fieldOf(event);
      if (!el) return;
      if (event.key === "Enter" && !el.hasAttribute("data-edit-multiline")) {
        event.preventDefault();
        el.blur();
      }
      if (event.key === " " && el.closest("button")) event.stopPropagation();
    };

    /* Pasting brings text, never someone else's formatting. */
    const onPaste = (event: ClipboardEvent) => {
      if (!fieldOf(event)) return;
      event.preventDefault();
      const text = event.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };

    const openPopover = (el: HTMLElement) => {
      const path = el.dataset.edit!;
      const rect = el.getBoundingClientRect();
      const width = Math.min(420, window.innerWidth - 24);
      setPopover({
        path,
        value:
          pending.current.get(path) ??
          String(getAt(draftRef.current, path) ?? readElement(el)),
        top: Math.min(rect.bottom + 8, window.innerHeight - 240),
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        multiline:
          el.hasAttribute("data-edit-multiline") ||
          el.hasAttribute("data-edit-raw"),
      });
    };

    /* A click on editable text edits it rather than following a link. Text
       on a button (a stage pill, a team plate, a report tab) keeps the button
       working on a single click and is edited with a double-click instead. */
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("[data-edit-ui]")) return;
      const el = target.closest<HTMLElement>("[data-edit]");
      if (!el) return;
      if (target.closest("a")) event.preventDefault();
      if (!el.hasAttribute("data-edit-raw") || el.closest("button")) return;
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
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDoubleClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDoubleClick, true);
      document
        .querySelectorAll<HTMLElement>("[contenteditable][data-edit]")
        .forEach((el) => el.removeAttribute("contenteditable"));
    };
  }, [on, commit]);

  /* ------------------------------------------------ overlays */

  /* The image buttons and the item toolbar are laid over the page rather
     than inside it, so no overflow, overlay or stacking order on the page can
     clip or cover them. They are placed afresh as the page scrolls and the
     carousels move. */
  const hovered = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!on) {
      hovered.current = null;
      return;
    }
    let frame = 0;
    const headerBottom = () =>
      document.querySelector("header")?.getBoundingClientRect().bottom ?? 64;

    const place = () => {
      frame = 0;
      const top = Math.max(headerBottom(), 0);

      /* Images */
      const seen = new Set<string>();
      const next: ImageChip[] = [];
      document
        .querySelectorAll<HTMLElement>("[data-edit-image]")
        .forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width < 60 || rect.height < 36) return;
          if (rect.bottom < top + 30 || rect.top > window.innerHeight - 40)
            return;
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
            removes: el.dataset.editImageRemoves ?? null,
            empty: el.hasAttribute("data-edit-image-empty"),
            top: Math.max(rect.top, top) + 8,
            left: rect.left + 8,
          });
        });
      setChips(next);

      /* The toolbar of the entry last pointed at. */
      const el = hovered.current;
      if (!el || !el.isConnected) {
        setItemBar(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.bottom < top + 20 || rect.top > window.innerHeight - 60) {
        setItemBar(null);
        return;
      }
      const list = el.dataset.editItem!;
      const index = Number(el.dataset.editIndex);
      const spec = specFor(list);
      const count = (getAt(draftRef.current, list) as unknown[] | undefined)
        ?.length;
      if (!spec || count === undefined) {
        setItemBar(null);
        return;
      }
      /* Small entries (a chip, a logo) get the toolbar above them, so it
         does not sit over their neighbours; large ones inside the corner. */
      const small = rect.height < 140;
      const inset = small ? 0 : 8;
      const onLeft = rect.left + rect.width / 2 < window.innerWidth / 2;
      setItemBar({
        list,
        index,
        count,
        label: spec.label,
        top: small
          ? Math.max(rect.top - 38, top + 4)
          : Math.max(rect.top, top) + 8,
        ...(onLeft
          ? { left: Math.max(8, rect.left + inset) }
          : { right: Math.max(8, window.innerWidth - rect.right + inset) }),
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(place);
    };

    const onPoint = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target?.closest || target.closest("[data-edit-ui]")) return;
      const item = target.closest<HTMLElement>("[data-edit-item]");
      if (item && item !== hovered.current) {
        hovered.current = item;
        schedule();
      }
    };

    place();
    const timer = window.setInterval(schedule, 500);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("pointerover", onPoint, true);
    document.addEventListener("pointerdown", onPoint, true);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("pointerover", onPoint, true);
      document.removeEventListener("pointerdown", onPoint, true);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [on]);

  /* Re-place the toolbar as soon as a list changes under it. */
  useEffect(() => {
    if (!on || !hovered.current) return;
    const frame = requestAnimationFrame(() => {
      const el = hovered.current;
      if (!el?.isConnected) setItemBar(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [on, draft]);

  const fileInput = useRef<HTMLInputElement | null>(null);
  const imageTarget = useRef<string | null>(null);

  const uploadImage = async (file: File) => {
    const path = imageTarget.current;
    if (!path) return;
    say("Uploading…");
    try {
      const url = await editor.upload(file, "image");
      editor.update(path, url);
      say("Image replaced — press Save to publish it");
    } catch (err) {
      say(`Upload failed: ${(err as Error).message}`, true);
    }
  };

  const itemAction = (action: "left" | "right" | "add" | "delete") => {
    if (!itemBar) return;
    const { list, index, count, label } = itemBar;
    const spec = specFor(list);
    if (!spec) return;
    if (action === "left") editor.move(list, index, index - 1);
    if (action === "right") editor.move(list, index, index + 1);
    if (action === "add") {
      const from = (getAt(draftRef.current, list) as unknown[])[index];
      editor.insert(
        list,
        index + 1,
        spec.create(from as Record<string, unknown>),
      );
      say(`New ${label} added after this one — edit it, then Save`);
    }
    if (action === "delete") {
      if (count <= (spec.min ?? 1)) {
        say(`This needs at least one ${label} — add another first`, true);
        return;
      }
      if (!confirm(`Delete this ${label}? It goes when you press Save.`))
        return;
      editor.remove(list, index);
      hovered.current = null;
      setItemBar(null);
      say(`${label[0].toUpperCase()}${label.slice(1)} deleted — Save to publish`);
    }
  };

  /* ------------------------------------------------ saving */

  const save = async () => {
    commit();
    const next = draftRef.current;
    const changed = SECTIONS.filter(
      (s) => JSON.stringify(next[s]) !== JSON.stringify(saved.current[s]),
    );
    if (!changed.length) {
      setChanges(0);
      say("Nothing has changed");
      return;
    }
    setSaving(true);
    try {
      for (const section of changed) {
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
        saved.current = { ...saved.current, [section]: next[section] };
      }
      setChanges(0);
      say("Saved — the site is updated");
      /* A full reload rather than a refresh: typing in place has moved text
         nodes React still thinks it owns, and a fresh page is the one way to
         hand it a DOM that matches. */
      window.setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      say(`Save failed: ${(err as Error).message}`, true);
      setSaving(false);
    }
  };

  const discard = () => {
    if (!confirm("Throw away the changes you have not saved?")) return;
    pending.current.clear();
    setChanges(0);
    /* Cleared first, so the reload does not ask again. */
    window.setTimeout(() => window.location.reload(), 0);
  };

  /* Leaving with unsaved changes asks first. */
  const unsavedRef = useRef(false);
  useEffect(() => {
    unsavedRef.current = unsaved && !saving;
  }, [unsaved, saving]);
  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!unsavedRef.current) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  const signOut = async () => {
    if (unsaved && !confirm("Sign out without saving?")) return;
    unsavedRef.current = false;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };

  const toggle = () => {
    if (on && unsaved) {
      say("Save or discard your changes first", true);
      return;
    }
    setPopover(null);
    setOn(!on);
    if (!on) {
      say(
        "Click outlined text to type · point at a card, slide or person to add, move or delete it",
      );
    }
    /* Remembered for the tab, so a reload or the next page keeps it. Written
       here rather than whenever the switch changes, or the first render —
       always off — would overwrite it before it could be read back. */
    try {
      sessionStorage.setItem(STORAGE_KEY, on ? "0" : "1");
    } catch {
      /* private window: not remembered */
    }
  };

  /* ------------------------------------------------ render */

  const button =
    "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default disabled:opacity-40";
  const tool =
    "cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:cursor-default disabled:opacity-35";

  return (
    <EditorContext.Provider value={editor}>
      {children}

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
          <div
            key={chip.key}
            data-edit-ui
            className="fixed z-[70] flex items-center gap-1"
            style={{ top: chip.top, left: chip.left }}
          >
            <button
              type="button"
              onClick={() => {
                imageTarget.current = chip.path;
                fileInput.current?.click();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-steel-900 shadow-lg ring-1 ring-steel-900/15 hover:bg-white"
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
              {chip.empty ? "Add image" : "Change image"}
            </button>
            {chip.removes && !chip.empty ? (
              <button
                type="button"
                title="Remove this image"
                onClick={() => {
                  editor.update(chip.removes!, undefined);
                  say("Image removed — press Save to publish");
                }}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white shadow-lg hover:bg-red-700"
              >
                ×
              </button>
            ) : null}
          </div>
        ))}

      {on && itemBar && (
        <div
          data-edit-ui
          className="fixed z-[75] flex items-center gap-0.5 rounded-full bg-steel-900/95 p-1 whitespace-nowrap text-white shadow-xl ring-1 ring-white/15"
          style={{ top: itemBar.top, left: itemBar.left, right: itemBar.right }}
        >
          <span className="px-2 text-[10px] font-semibold tracking-[0.1em] text-white/60 uppercase tabular-nums">
            {itemBar.label} {itemBar.index + 1}/{itemBar.count}
          </span>
          <button
            type="button"
            title="Move earlier"
            disabled={itemBar.index === 0}
            onClick={() => itemAction("left")}
            className={`${tool} hover:bg-white/15`}
          >
            ◀
          </button>
          <button
            type="button"
            title="Move later"
            disabled={itemBar.index >= itemBar.count - 1}
            onClick={() => itemAction("right")}
            className={`${tool} hover:bg-white/15`}
          >
            ▶
          </button>
          <button
            type="button"
            onClick={() => itemAction("add")}
            className={`${tool} bg-emerald-600 hover:bg-emerald-500`}
          >
            + Add {itemBar.label}
          </button>
          <button
            type="button"
            onClick={() => itemAction("delete")}
            className={`${tool} bg-red-600 hover:bg-red-500`}
          >
            Delete
          </button>
        </div>
      )}

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
                editor.update(
                  popover.path,
                  typed(draftRef.current, popover.path, value),
                );
                setPopover(null);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {figures && (
        <FiguresDialog
          investors={draft.investors}
          initialFile={figures.file}
          onApply={(investors) => {
            apply((d) => ({ ...d, investors }));
            say("Investor figures updated on the page — press Save to publish");
          }}
          onClose={() => setFigures(null)}
        />
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
          onClick={toggle}
          className={`${button} flex items-center gap-2 ${on ? "bg-accent text-white" : "bg-white/10 hover:bg-white/20"}`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${on ? "bg-white" : "bg-white/40"}`}
          />
          {on ? "Editing" : "Edit mode"}
        </button>

        {on && (
          <>
            {pathname.startsWith("/investors") && (
              <button
                type="button"
                onClick={() => editor.openFigures()}
                className={`${button} bg-white/10 hover:bg-white/20`}
                title="Read the figures out of the latest annual report"
              >
                Investor figures
              </button>
            )}
            <span className="px-1 text-xs text-white/60">
              {unsaved ? "Unsaved changes" : "No changes"}
            </span>
            <button
              type="button"
              disabled={!unsaved || saving}
              onClick={discard}
              className={`${button} bg-white/10 hover:bg-white/20`}
            >
              Discard
            </button>
            <button
              type="button"
              disabled={!unsaved || saving}
              onClick={save}
              className={`${button} ${unsaved ? "bg-amber-400 text-steel-900 hover:bg-amber-300" : "bg-white text-steel-900"}`}
            >
              {saving ? "Saving…" : unsaved ? "● Save changes" : "Save"}
            </button>
          </>
        )}

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
          className={`fixed bottom-20 left-1/2 z-[90] max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-full px-4 py-2 text-center text-sm font-medium shadow-xl ${
            toast.error
              ? "bg-red-600 text-white"
              : "bg-white text-steel-900 ring-1 ring-steel-900/10"
          }`}
        >
          {toast.text}
        </div>
      )}
    </EditorContext.Provider>
  );
}
