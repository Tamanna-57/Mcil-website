/**
 * What the admin panel accepts as an upload, and what it names it.
 *
 * Shared by every upload path — the server route the file backend posts to,
 * the client-token route Blob uploads go through, and the route that serves
 * files back — so there is one answer to "is this allowed" rather than three
 * that can drift.
 */

/** Pictures. Rendered inline wherever they are used. */
export const IMAGE_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Filings and reports. Offered as a download rather than rendered. */
export const DOCUMENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
};

export const ALL_TYPES: Record<string, string> = {
  ...IMAGE_TYPES,
  ...DOCUMENT_TYPES,
};

export type UploadKind = "image" | "document";

export function allowedFor(kind: UploadKind): Record<string, string> {
  return kind === "image" ? IMAGE_TYPES : DOCUMENT_TYPES;
}

/** Human list for an error message, e.g. ".pdf, .doc, .docx". */
export function extensionList(kind: UploadKind): string {
  return Object.keys(allowedFor(kind)).join(", ");
}

/**
 * How large an upload may be. Annual reports run well past the 8 MB that is
 * plenty for a photograph, so documents get their own ceiling.
 */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES =
  Number(process.env.MAX_DOCUMENT_MB || 50) * 1024 * 1024;

export function maxBytesFor(kind: UploadKind): number {
  return kind === "image" ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
}

export function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot < 0 ? "" : filename.slice(dot).toLowerCase();
}

export type SafeName = {
  /** Short random token that makes this upload unique. */
  token: string;
  /** The original name, flattened to something URL-safe. */
  name: string;
  contentType: string;
};

/**
 * Work out what to store an upload as. The original name is flattened to
 * something URL-safe and paired with a short random token, so two uploads of
 * "annual-report.pdf" never overwrite each other. Returns null when the
 * extension is not one we accept.
 *
 * Where the token goes differs by backend, and both arrangements exist so that
 * what a visitor downloads is named the way it was uploaded:
 * `flatName` puts it in front (the serving route strips it again), while
 * `blobPath` puts it in a directory, which leaves the filename itself clean —
 * Blob serves files directly and names the download after the path.
 */
export function safeName(original: string, kind: UploadKind): SafeName | null {
  const ext = extensionOf(original);
  const contentType = allowedFor(kind)[ext];
  if (!contentType) return null;

  const stem = original
    .slice(0, original.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return {
    token: crypto.randomUUID().replace(/-/g, "").slice(0, 8),
    name: `${stem || kind}${ext}`,
    contentType,
  };
}

/** The filename the file backend stores an upload under. */
export function flatName(safe: SafeName): string {
  return `${safe.token}-${safe.name}`;
}

/** The Blob pathname an upload is stored at. */
export function blobPath(prefix: string, safe: SafeName): string {
  return `${prefix}/uploads/${safe.token}/${safe.name}`;
}

/** The name a visitor should see, i.e. a stored name minus any token. */
export function displayName(filename: string): string {
  return filename.replace(/^[0-9a-f]{8}-/, "");
}

/** Above this, a Blob upload is split into parts and uploaded in parallel. */
export const MAX_MULTIPART_THRESHOLD = 8 * 1024 * 1024;
