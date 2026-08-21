import Link from "next/link";

import { QuickEntryForm } from "@/components/quick-entry-form";
import { buttonVariants } from "@/components/ui/button";
import { isEditor } from "@/lib/auth";

export default async function SaisiePage() {
  const authorized = await isEditor();

  if (!authorized) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Saisie rapide</h1>
        <p className="text-muted-foreground">
          Cette page est réservée aux personnes autorisées à modifier les données.
        </p>
        <Link href="/login?next=/saisie" className={buttonVariants()}>
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saisie rapide</h1>
        <p className="text-muted-foreground">
          Sélectionne un réseau, renseigne les métriques de la période et enchaîne sur le
          suivant en un clic.
        </p>
      </div>

      <QuickEntryForm />
    </div>
  );
}
