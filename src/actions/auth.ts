"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  checkPassword,
  createEditorSession,
  destroyEditorSession,
  isLoginRateLimited,
  recordFailedLoginAttempt,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // Vercel renseigne x-forwarded-for de façon fiable ; en local (dev) il est
  // absent, d'où le repli qui regroupe simplement toutes les requêtes locales.
  const forwardedFor = headersList.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await getClientIp();

  if (await isLoginRateLimited(ip)) {
    return { error: "Trop de tentatives. Réessaie dans quelques minutes." };
  }

  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/saisie");

  if (!checkPassword(password)) {
    await recordFailedLoginAttempt(ip);
    return { error: "Mot de passe incorrect" };
  }

  await createEditorSession();
  redirect(next.startsWith("/") ? next : "/saisie");
}

export async function logout() {
  await destroyEditorSession();
  redirect("/");
}
