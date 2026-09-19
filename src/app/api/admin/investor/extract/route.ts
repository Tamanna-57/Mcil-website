import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/session";
import { MAX_DOCUMENT_BYTES } from "@/lib/admin/uploads";
import { extractFigures } from "@/lib/investor/extract";
import { readPdfText } from "@/lib/investor/pdf-text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Reads an annual report and hands back the figures it could find.
 *
 * Nothing is saved here. The response is a proposal: the admin panel shows
 * each figure with the line it came from, the person doing the import corrects
 * whatever the parser got wrong, and only then does the ordinary content save
 * publish it. That separation is the whole point — a label-matching parser
 * over a designed PDF will sometimes be wrong, and the wrong number must not
 * be able to reach the investor page without someone having looked at it.
 *
 * The file is parsed straight from the request body and never stored. Attaching
 * the report as a download is a separate, deliberate step through the existing
 * upload route.
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

  if (file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json(
      {
        error: `That file is over the ${Math.round(MAX_DOCUMENT_BYTES / 1024 / 1024)} MB limit.`,
      },
      { status: 413 },
    );
  }

  if (!/\.pdf$/i.test(file.name)) {
    return NextResponse.json(
      { error: "Figures can only be read from a PDF." },
      { status: 400 },
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { text, pageCount } = await readPdfText(bytes);

    if (!text.trim()) {
      return NextResponse.json(
        {
          error:
            "No text could be read from that PDF — it is most likely a scan. Type the figures in by hand.",
        },
        { status: 422 },
      );
    }

    const extraction = extractFigures(text, pageCount);
    return NextResponse.json({ extraction, name: file.name });
  } catch (err) {
    console.error("[admin] report extraction failed:", err);
    return NextResponse.json(
      { error: "Could not read that PDF. See the server log." },
      { status: 500 },
    );
  }
}
