/**
 * The single shared admin login.
 *
 * There are no per-user accounts: whoever knows the password edits the site,
 * which is what a two-or-three-person office actually wants. This module is a
 * deliberately thin seam — if the login ever becomes per-user or moves to an
 * identity provider, only this file and the login route change; everything
 * else keeps calling `isAdminRequest`.
 *
 * Environment:
 * * `ADMIN_PASSWORD`       — the shared password. **Required.** With it unset
 *                            the admin panel refuses every login rather than
 *                            falling back to a guessable default.
 * * `ADMIN_SESSION_SECRET` — key the session cookie is signed with. Optional;
 *                            defaults to the password, which means changing
 *                            the password also signs everyone out.
 *
 * Everything here runs on Web Crypto only, so `middleware.ts` can call it on
 * the edge runtime.
 */

export const SESSION_COOKIE = "mcil_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // seven days

export function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  return password && password.length > 0 ? password : null;
}

/** True when the deployment has no password configured — logins are refused. */
export function isAdminDisabled(): boolean {
  return getAdminPassword() === null;
}

function getSigningSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

const encoder = new TextEncoder();

/** Length-independent equality, so a comparison cannot be timed. */
function safeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  // Fold the length difference in rather than returning early on it.
  let diff = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

export function checkPassword(candidate: unknown): boolean {
  const expected = getAdminPassword();
  if (expected === null) return false;
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  return safeEqual(candidate, expected);
}

async function sign(payload: string): Promise<string> {
  const secret = getSigningSecret();
  if (!secret) throw new Error("No admin signing secret configured");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(mac))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Mint a session token that expires `SESSION_MAX_AGE` from now. */
export async function createSessionToken(): Promise<string> {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token || getSigningSecret() === null) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [scope, expires, signature] = parts;
  if (scope !== "admin") return false;

  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return safeEqual(signature, await sign(`${scope}.${expires}`));
}

/** The cookie attributes a session is set with, shared by login and logout. */
export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
