import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/auth";

/**
 * Gate for everything behind the admin login.
 *
 * The check happens here as well as in each route handler. The proxy is
 * what stops an unauthenticated browser ever rendering the dashboard shell;
 * the per-route check is what actually protects the data, because routing
 * is a separate concern and a route must not depend on one having run.
 */
export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const signedIn = await verifySessionToken(token);

  // The login page itself is open; a signed-in admin is sent on to the panel.
  if (pathname === "/admin/login") {
    if (!signedIn) return NextResponse.next();
    const next = request.nextUrl.searchParams.get("next") || "/admin";
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (signedIn) return NextResponse.next();

  const login = new URL("/admin/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
