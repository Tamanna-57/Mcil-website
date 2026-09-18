"use client";

import { upload } from "@vercel/blob/client";
import {
  blobPath,
  MAX_MULTIPART_THRESHOLD,
  safeName,
  type UploadKind,
} from "@/lib/admin/uploads";

/**
 * Sends a file from the admin panel to wherever this deployment keeps uploads.
 *
 * Two routes, because the constraint differs:
 *
 * * **file backend** — POST it to our own route, which writes it to disk.
 * * **blob backend** — upload straight from the browser to Blob, using a
 *   short-lived token our route signs. A serverless function may only receive
 *   a body of a few megabytes, and an annual report is routinely larger, so
 *   the file must not pass through one.
 *
 * Both return the URL to store alongside the content.
 */
export type StorageInfo = {
  kind: "file" | "blob";
  /** Blob path prefix, so a direct upload lands where the backend expects. */
  prefix: string;
};

export async function uploadFile(
  file: File,
  kind: UploadKind,
  storage: StorageInfo,
): Promise<string> {
  const safe = safeName(file.name, kind);
  if (!safe) {
    throw new Error(`Unsupported file type: ${file.name}`);
  }

  if (storage.kind === "blob") {
    const result = await upload(blobPath(storage.prefix, safe), file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload/token",
      clientPayload: kind,
      contentType: safe.contentType,
      // Large files go up in parallel parts, with failed parts retried, so a
      // 40 MB annual report over an office connection is not all-or-nothing.
      multipart: file.size > MAX_MULTIPART_THRESHOLD,
    });
    // A filing should land in the visitor's downloads rather than open in a
    // tab; `downloadUrl` is the same object served with that disposition.
    return kind === "document" ? result.downloadUrl : result.url;
  }

  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Upload failed.");
  }
  return data.url;
}
