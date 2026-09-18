import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/** True when the request carries a valid admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}
