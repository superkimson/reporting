import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "editor_session";
const SESSION_VALUE = "editor-authenticated";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET n'est pas configuré.");
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export async function createEditorSession() {
  const token = `${SESSION_VALUE}.${sign(SESSION_VALUE)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

export async function destroyEditorSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isEditor(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [value, signature] = token.split(".");
  if (value !== SESSION_VALUE || !signature) return false;

  const expected = sign(SESSION_VALUE);
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkPassword(password: string): boolean {
  const expected = process.env.EDITOR_PASSWORD;
  if (!expected || password.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}
