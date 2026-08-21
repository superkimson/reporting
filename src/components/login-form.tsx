"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" autoFocus required />
        {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
