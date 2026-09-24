"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "@/lib/content/types";

/**
 * The content a signed-in admin is editing, shared with the page.
 *
 * The edit bar holds a draft of the whole site and the sections render from
 * it, so adding a slide, deleting a report or replacing a photograph shows on
 * the page at once — and nothing is published until Save. For the public there
 * is no editor: `useDraft` hands back exactly what the page passed in.
 */

export type UploadKind = "image" | "document";

export type Editor = {
  /** Edit mode is switched on. */
  on: boolean;
  draft: SiteContent;
  /** Set the value at a path. `undefined` removes the key. */
  update: (path: string, value: unknown) => void;
  insert: (list: string, index: number, item: unknown) => void;
  remove: (list: string, index: number) => void;
  move: (list: string, from: number, to: number) => void;
  /** Store a file and return its URL. Throws with a readable message. */
  upload: (file: File, kind: UploadKind) => Promise<string>;
  say: (text: string, error?: boolean) => void;
  /** The annual-report import, optionally starting on a file already chosen. */
  openFigures: (file?: File) => void;
};

export const EditorContext = createContext<Editor | null>(null);

/** The editor, when a signed-in admin is on the page; otherwise null. */
export function useEditor(): Editor | null {
  return useContext(EditorContext);
}

/** The editor, only while edit mode is on. */
export function useEditingEditor(): Editor | null {
  const editor = useContext(EditorContext);
  return editor?.on ? editor : null;
}

/**
 * What the page should show at `path`: the admin's draft when there is one,
 * otherwise `fallback` — the value the server rendered the page with.
 */
export function useDraft<T>(path: string, fallback: T): T {
  const editor = useContext(EditorContext);
  if (!editor) return fallback;
  const value = getAt(editor.draft, path);
  return value === undefined ? fallback : (value as T);
}

/* ------------------------------------------------------------ path helpers */

export function getAt(root: unknown, path: string): unknown {
  let node = root;
  for (const key of path.split(".")) {
    if (node === null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/**
 * A copy of `root` with `value` at `path`, copying only the objects on the way
 * down. `undefined` deletes the key (or, in an array, the entry).
 */
export function setAt<T>(root: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const step = (node: unknown, i: number): unknown => {
    const key = keys[i];
    const last = i === keys.length - 1;
    if (Array.isArray(node)) {
      const copy = [...node];
      const at = Number(key);
      if (last) {
        if (value === undefined) copy.splice(at, 1);
        else copy[at] = value;
      } else {
        copy[at] = step(copy[at], i + 1);
      }
      return copy;
    }
    const copy = { ...((node ?? {}) as Record<string, unknown>) };
    if (last) {
      if (value === undefined) delete copy[key];
      else copy[key] = value;
    } else {
      copy[key] = step(copy[key], i + 1);
    }
    return copy;
  };
  return step(root, 0) as T;
}
