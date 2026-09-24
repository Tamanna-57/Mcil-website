import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A filing opened for reading: the same PDF the Download button fetches, but
 * sent inline so it opens in the browser's PDF viewer instead of landing in
 * the downloads folder. The document titles on the investor page link here
 * (see `viewUrlFor`).
 *
 * The bucket copies carry `Content-Disposition: attachment`, and a browser
 * obeys that however the link is written, so the file is passed through this
 * route with the header changed rather than linked to directly.
 *
 * Only PDFs, and only from `reports/` and `uploads/` in the site's own bucket
 * — this must not become a way to fetch anything else through the site.
 */

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

function headers(name: string, extra: Record<string, string> = {}) {
  return {
    "content-type": "application/pdf",
    "content-disposition": `inline; filename="${name.replace(/"/g, "")}"`,
    "cache-control": "public, max-age=86400",
    "x-content-type-options": "nosniff",
    ...extra,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;

  const ok =
    parts.length >= 2 &&
    (parts[0] === "reports" || parts[0] === "uploads") &&
    parts.every((p) => SEGMENT.test(p) && !p.includes("..")) &&
    /\.pdf$/i.test(parts.at(-1) ?? "");
  if (!ok) return notFound();

  const key = parts.join("/");
  const name = parts.at(-1)!;

  const bucket = process.env.GCS_BUCKET;
  if (bucket) {
    const prefix = (process.env.GCS_PREFIX ?? "").replace(/^\/+|\/+$/g, "");
    const object = [prefix, key].filter(Boolean).join("/");
    const upstream = await fetch(
      `https://storage.googleapis.com/${bucket}/${object}`,
      { cache: "no-store" },
    ).catch(() => null);
    if (!upstream?.ok || !upstream.body) return notFound();

    const length = upstream.headers.get("content-length");
    return new NextResponse(upstream.body, {
      headers: headers(name, length ? { "content-length": length } : {}),
    });
  }

  // File backend: only the carried-over reports live on disk under their own
  // path; uploads there are served by /media instead.
  if (parts[0] !== "reports") return notFound();
  const dir =
    process.env.CONTENT_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), "content");
  const file = path.join(/* turbopackIgnore: true */ dir, key);
  let size: number;
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    size = info.size;
  } catch {
    return notFound();
  }
  return new NextResponse(
    Readable.toWeb(createReadStream(file)) as unknown as ReadableStream,
    { headers: headers(name, { "content-length": String(size) }) },
  );
}
