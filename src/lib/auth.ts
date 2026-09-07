import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 5;

// Anti-bruteforce sur /login : 5 essais échoués / 15 min / IP. Stocké en base
// (pas en mémoire, qui ne survivrait pas d'une invocation serverless à l'autre)
// — pas de service de rate-limiting dédié à mettre en place.
export async function isLoginRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MS);
  await prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: since } } });
  const count = await prisma.loginAttempt.count({ where: { ip, createdAt: { gte: since } } });
  return count >= LOGIN_ATTEMPT_LIMIT;
}

export async function recordFailedLoginAttempt(ip: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { ip } });
}
