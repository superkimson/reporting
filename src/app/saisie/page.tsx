import { QuickEntryForm } from "@/components/quick-entry-form";

export default function SaisiePage() {
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
