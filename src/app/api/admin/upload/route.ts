import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/session";
import {
  extensionList,
  maxBytesFor,
  safeName,
  type UploadKind,
} from "@/lib/admin/uploads";
import { getBackend } from "@/lib/content/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Takes an upload and hands back the URL to store alongside the content.
 *
 * This is the path the file backend uses. Deployments on Blob upload straight
 * from the browser instead (see ./token), because a serverless platform caps
 * how large a request body a function may receive and an annual report is
 * routinely over that cap.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  const kind: UploadKind =
    form?.get("kind") === "document" ? "document" : "image";

  const limit = maxBytesFor(kind);
  if (file.size > limit) {
    return NextResponse.json(
      {
        error: `That file is over the ${Math.round(limit / 1024 / 1024)} MB limit.`,
      },
      { status: 413 },
    );
  }

  const safe = safeName(file.name, kind);
  if (!safe) {
    return NextResponse.json(
      { error: `Unsupported file type. Use ${extensionList(kind)}.` },
      { status: 400 },
    );
  }

  try {
    const url = await getBackend().saveFile(file, safe, kind);
    return NextResponse.json({ url, name: file.name });
  } catch (err) {
    console.error("[admin] upload failed:", err);
    return NextResponse.json(
      { error: "Could not save the file. See the server log." },
      { status: 500 },
    );
  }
}
