import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/session";
import { getBackend } from "@/lib/content/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extensions the site is willing to serve as an image. */
const ALLOWED = new Map<string, string>([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
]);

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Build the stored filename: the original name, flattened to something safe
 * for a URL, with a short random token in front so two uploads of "photo.jpg"
 * never overwrite each other.
 */
function safeName(original: string): string | null {
  const dot = original.lastIndexOf(".");
  if (dot < 0) return null;
  const ext = original.slice(dot).toLowerCase();
  if (!ALLOWED.has(ext)) return null;

  const stem = original
    .slice(0, dot)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const token = crypto.randomUUID().slice(0, 8);
  return `${token}-${stem || "image"}${ext}`;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "That image is over the 8 MB limit." },
      { status: 413 },
    );
  }

  const filename = safeName(file.name);
  if (!filename) {
    return NextResponse.json(
      {
        error: `Unsupported image type. Use ${[...ALLOWED.keys()].join(", ")}.`,
      },
      { status: 400 },
    );
  }

  try {
    const url = await getBackend().saveImage(file, filename);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[admin] upload failed:", err);
    return NextResponse.json(
      { error: "Could not save the image. See the server log." },
      { status: 500 },
    );
  }
}
