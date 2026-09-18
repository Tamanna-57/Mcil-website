import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import {
  ALL_TYPES,
  displayName,
  DOCUMENT_TYPES,
  extensionOf,
} from "@/lib/admin/uploads";
import { getBackend } from "@/lib/content/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves images and documents uploaded from the admin panel, for deployments
 * using the file backend.
 *
 * They cannot live in `public/`: Next serves that directory as it stood when
 * the site was built, so a file written there afterwards is a 404. This route
 * reads the upload directory at request time instead, which is what makes a
 * file usable the moment it is uploaded. On Vercel the Blob backend returns
 * absolute URLs and nothing reaches this route at all.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  // The name is the only thing an outside caller controls, so it has to be a
  // bare filename — no separators, no traversal, nothing but a known type.
  const safe = path.basename(name);
  const ext = extensionOf(safe);
  const type = ALL_TYPES[ext];
  if (safe !== name || !type) {
    return new NextResponse("Not found", { status: 404 });
  }

  const backend = getBackend();
  if (!backend.uploadDir) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = path.join(await backend.uploadDir(), safe);
  let size: number;
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = Readable.toWeb(
    createReadStream(file),
  ) as unknown as ReadableStream;

  const headers: Record<string, string> = {
    "content-type": type,
    "content-length": String(size),
    // The filename carries a random token, so a given URL never changes
    // content and can be cached hard.
    "cache-control": "public, max-age=31536000, immutable",
  };

  // A filing is something to keep, and it should land in the visitor's
  // downloads named the way it was uploaded rather than with our token on the
  // front. Images stay inline so they can be rendered.
  if (DOCUMENT_TYPES[ext]) {
    const clean = displayName(safe).replace(/"/g, "");
    headers["content-disposition"] = `attachment; filename="${clean}"`;
  }

  return new NextResponse(body, { headers });
}
