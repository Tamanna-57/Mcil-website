import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { extensionOf } from "@/lib/admin/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The filings carried over from the old mcil.net, at `/reports/<sub>/<file>`.
 *
 * The files sit under `reports/` in the site's bucket, copied there once by
 * `tools/old-reports/copy-to-bucket.sh`. The document rows link here rather
 * than at the bucket so that they do not have to know its name: with
 * `GCS_BUCKET` set this sends the visitor on to the public object, and on the
 * file backend it serves `CONTENT_DIR/reports/` instead, so the library can be
 * tried out on a laptop.
 */

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".html": "text/html; charset=utf-8",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;

  // Two plain segments — a sub-category and a filename — and nothing that
  // could climb out of the reports folder.
  const ok =
    parts.length === 2 &&
    parts.every((p) => /^[a-z0-9][a-z0-9.-]*$/.test(p) && !p.includes(".."));
  const type = TYPES[extensionOf(parts.at(-1) ?? "")];
  if (!ok || !type) return new NextResponse("Not found", { status: 404 });

  const key = ["reports", ...parts].join("/");

  const bucket = process.env.GCS_BUCKET;
  if (bucket) {
    const prefix = (process.env.GCS_PREFIX ?? "").replace(/^\/+|\/+$/g, "");
    const object = [prefix, key].filter(Boolean).join("/");
    // Temporary, so a browser that has followed it once still asks again
    // should the bucket ever move.
    return NextResponse.redirect(
      `https://storage.googleapis.com/${bucket}/${object}`,
      307,
    );
  }

  // Resolved at request time, so the build must not try to trace it.
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
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(
    Readable.toWeb(createReadStream(file)) as unknown as ReadableStream,
    {
      headers: {
        "content-type": type,
        "content-length": String(size),
        "content-disposition": `attachment; filename="${parts[1]}"`,
      },
    },
  );
}
