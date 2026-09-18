import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/session";
import { isContentSection } from "@/lib/content/defaults";
import { getContent, resetSection, saveSection } from "@/lib/content/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ section: string }> };

/** Middleware gates the pages; the data is gated here, on every method. */
async function guard() {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "Not signed in." }, { status: 401 });
}

async function resolve({ params }: Params) {
  const { section } = await params;
  if (!isContentSection(section)) {
    return {
      section: null,
      error: NextResponse.json(
        { error: `Unknown content section: ${section}` },
        { status: 404 },
      ),
    } as const;
  }
  return { section, error: null } as const;
}

export async function GET(request: Request, ctx: Params) {
  const denied = await guard();
  if (denied) return denied;

  const { section, error } = await resolve(ctx);
  if (error) return error;

  const content = await getContent();
  return NextResponse.json({ section, value: content[section] });
}

/** Replace a whole section with the body's `value`. */
export async function PUT(request: Request, ctx: Params) {
  const denied = await guard();
  if (denied) return denied;

  const { section, error } = await resolve(ctx);
  if (error) return error;

  const body = (await request.json().catch(() => null)) as {
    value?: unknown;
  } | null;
  if (!body || body.value === undefined) {
    return NextResponse.json(
      { error: "Request body must be {\"value\": ...}" },
      { status: 400 },
    );
  }

  try {
    const content = await saveSection(section, body.value);
    return NextResponse.json({ section, value: content[section] });
  } catch (err) {
    console.error("[admin] save failed:", err);
    return NextResponse.json(
      { error: "Could not save. See the server log for details." },
      { status: 500 },
    );
  }
}

/** Drop the override, restoring what the repo ships with. */
export async function DELETE(request: Request, ctx: Params) {
  const denied = await guard();
  if (denied) return denied;

  const { section, error } = await resolve(ctx);
  if (error) return error;

  try {
    const content = await resetSection(section);
    return NextResponse.json({ section, value: content[section] });
  } catch (err) {
    console.error("[admin] reset failed:", err);
    return NextResponse.json({ error: "Could not reset." }, { status: 500 });
  }
}
