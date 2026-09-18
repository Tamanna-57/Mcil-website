import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/session";
import {
  allowedFor,
  extensionList,
  extensionOf,
  maxBytesFor,
  type UploadKind,
} from "@/lib/admin/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Issues a short-lived token so the browser can upload straight to Blob.
 *
 * A serverless function may only receive a request body of a few megabytes, so
 * posting an annual report through one fails on size alone. Going direct means
 * the file never passes through a function: this route only checks that the
 * caller is a signed-in admin and that the name is one we allow, then signs a
 * token scoped to that single upload.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured on this deployment." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const kind: UploadKind =
          clientPayload === "document" ? "document" : "image";
        const contentType = allowedFor(kind)[extensionOf(pathname)];
        if (!contentType) {
          throw new Error(`Unsupported file type. Use ${extensionList(kind)}.`);
        }
        return {
          allowedContentTypes: [contentType],
          maximumSizeInBytes: maxBytesFor(kind),
          // The client already namespaced and tokenised the name; keeping it
          // verbatim is what lets the download be named properly later.
          addRandomSuffix: false,
        };
      },
      // Nothing to record on completion — the URL goes into the content only
      // when the admin saves the section they were editing.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not start the upload.";
    console.error("[admin] client upload token failed:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
