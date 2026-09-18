import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdminDisabled,
  sessionCookieOptions,
} from "@/lib/admin/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (isAdminDisabled()) {
    return NextResponse.json(
      {
        error:
          "The admin panel is not configured. Set ADMIN_PASSWORD on the deployment and try again.",
      },
      { status: 503 },
    );
  }

  let password: unknown;
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    password = ((await request.json().catch(() => ({}))) as { password?: unknown })
      .password;
  } else {
    password = (await request.formData()).get("password");
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    await createSessionToken(),
    sessionCookieOptions(SESSION_MAX_AGE),
  );
  return response;
}
