"use server";

import { redirect } from "next/navigation";
import { checkPassword, createEditorSession, destroyEditorSession } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/saisie");

  if (!checkPassword(password)) {
    return { error: "Mot de passe incorrect" };
  }

  await createEditorSession();
  redirect(next.startsWith("/") ? next : "/saisie");
}

export async function logout() {
  await destroyEditorSession();
  redirect("/");
}
