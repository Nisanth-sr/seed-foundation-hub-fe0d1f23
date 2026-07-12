import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

const COOKIE_NAME = "seed-admin-session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  return timingSafeEqual(password, expected);
}

export async function createAdminSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, v: 1 });
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${bytesToBase64(new TextEncoder().encode(payload))}.${bytesToBase64(new Uint8Array(sig))}`;
}

export async function validateAdminSessionToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return false;
    const payloadBytes = base64ToBytes(payloadB64);
    const payload = new TextDecoder().decode(payloadBytes);
    const data = JSON.parse(payload) as { exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now()) return false;
    const key = await getHmacKey();
    return crypto.subtle.verify("HMAC", key, base64ToBytes(sigB64), payloadBytes);
  } catch {
    return false;
  }
}

export function readAdminCookie(): string | null {
  const header = getRequestHeader("cookie");
  if (!header) return null;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq) === COOKIE_NAME) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

function cookieFlags(maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `HttpOnly; SameSite=Lax; Path=/${secure}; Max-Age=${maxAge}`;
}

export function setAdminCookie(token: string): void {
  setResponseHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieFlags(Math.floor(SESSION_TTL_MS / 1000))}`);
}

export function clearAdminCookie(): void {
  setResponseHeader("Set-Cookie", `${COOKIE_NAME}=; ${cookieFlags(0)}`);
}

export async function requireAdminSession(): Promise<void> {
  const valid = await validateAdminSessionToken(readAdminCookie());
  if (!valid) throw new Error("Unauthorized");
}
