import "server-only";

import { cache } from "react";
import {
  CONTENT_SECTIONS,
  defaultContent,
  type ContentSection,
} from "./defaults";
import { getBackend } from "./storage";
import type { SiteContent, SiteContentOverrides } from "./types";

/**
 * Reading and writing the site's editable content.
 *
 * `getContent()` is what every page calls: it returns the shipped defaults with
 * whatever an admin has saved merged over the top. `saveSection()` is what the
 * admin panel calls, and it stores *only* the overrides — the defaults are
 * never copied into the store, so a section nobody has edited keeps tracking
 * the repo, and clearing an override restores the original copy exactly.
 *
 * Objects merge key by key; arrays replace wholesale. Arrays here are ordered
 * lists an admin curates (slides, team members, report rows), and a merge that
 * tried to be clever about them would make deleting the third of four items
 * impossible.
 */

type Json = Record<string, unknown>;

function isPlainObject(value: unknown): value is Json {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== null &&
    !(value instanceof Date)
  );
}

function merge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (Array.isArray(override)) return override as T;
  if (!isPlainObject(override)) return override as T;
  if (!isPlainObject(base)) return override as T;

  const out: Json = { ...base };
  for (const [key, value] of Object.entries(override)) {
    out[key] = merge((base as Json)[key], value);
  }
  return out as T;
}

/* --------------------------------------------------------------- caching */

/**
 * Reads are memoized per request, not across them.
 *
 * `cache()` gives one store read per request however many components ask for
 * the content, which is what keeps a page that renders five sections from
 * doing five round trips. It deliberately does not survive the request: an
 * admin who saves and reloads has to see their own change, and a cache that
 * outlived the request could not guarantee that — a route handler and a page
 * are separate bundles, so clearing a module-level cache from the save route
 * would not reach the one the page reads through.
 *
 * `CONTENT_CACHE_MS` opts a busy deployment into holding the last read for
 * that many milliseconds anyway. It trades exactly that guarantee away: an
 * edit can take up to this long to appear. Leave it unset unless page reads
 * are measurably a problem.
 */
const CACHE_MS = Number(process.env.CONTENT_CACHE_MS ?? 0);

type CacheEntry = { at: number; overrides: SiteContentOverrides };
let held: CacheEntry | null = null;

export function clearContentCache() {
  held = null;
}

async function readOverrides(): Promise<SiteContentOverrides> {
  if (CACHE_MS > 0 && held && Date.now() - held.at < CACHE_MS) {
    return held.overrides;
  }
  let overrides: SiteContentOverrides = {};
  try {
    const doc = await getBackend().read();
    if (isPlainObject(doc.data)) {
      overrides = doc.data as SiteContentOverrides;
    }
  } catch (error) {
    // A store that is unreachable or holding malformed JSON must not take the
    // public site down with it — fall back to the copy in the repo and say so
    // in the server log.
    console.error("[content] could not read saved content:", error);
  }
  held = { at: Date.now(), overrides };
  return overrides;
}

/* ------------------------------------------------------------------ reads */

export const getOverrides = cache(readOverrides);

/** The shipped defaults with saved edits merged over them. */
export async function getContent(): Promise<SiteContent> {
  return merge(defaultContent, await getOverrides());
}

/* ----------------------------------------------------------------- writes */

/**
 * Replace one top-level section with `value`, storing it as an override.
 * Returns the merged content so a caller can reflect the result straight back.
 */
export async function saveSection(
  section: ContentSection,
  value: unknown,
): Promise<SiteContent> {
  const overrides = { ...(await readOverrides()) };
  (overrides as Json)[section] = value;
  await getBackend().write(overrides);
  clearContentCache();
  return merge(defaultContent, overrides);
}

/** Drop a section's override, restoring the copy the repo ships with. */
export async function resetSection(
  section: ContentSection,
): Promise<SiteContent> {
  const overrides = { ...(await readOverrides()) } as Json;
  delete overrides[section];
  await getBackend().write(overrides);
  clearContentCache();
  return merge(defaultContent, overrides as SiteContentOverrides);
}

/** Drop every override at once. */
export async function resetAll(): Promise<SiteContent> {
  await getBackend().write({});
  clearContentCache();
  return defaultContent;
}

export { CONTENT_SECTIONS, defaultContent };
export type { ContentSection };
