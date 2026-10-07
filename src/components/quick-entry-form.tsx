"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EditionToggle } from "@/components/edition-toggle";
import { createEntry, findExistingEntry } from "@/actions/entries";
import { entryFormSchema, type EntryFormInput, type EntryFormValues } from "@/lib/validation";
import { PLATFORM_LIST } from "@/lib/platforms";
import { EDITION_LIST } from "@/lib/editions";
import {
  formatMonthLabel,
  formatNumber,
  parseNumberInput,
  toMonthInputValue,
} from "@/lib/metrics";
import type { Platform, Edition } from "@/generated/prisma/enums";

function reformatNumericInput(event: React.FocusEvent<HTMLInputElement>) {
  const parsed = parseNumberInput(event.target.value);
  if (Number.isFinite(parsed)) {
    event.target.value = formatNumber(parsed);
  }
}

function currentMonthValue() {
  return toMonthInputValue(new Date());
}

function defaultValuesFor(platform: Platform, edition: Edition, month: string): EntryFormInput {
  return {
    platform,
    edition,
    periodType: "MONTHLY",
    periodDate: month,
    followers: 0,
    views: 0,
  };
}

export function QuickEntryForm() {
  const [activeTab, setActiveTab] = useState<Platform>(PLATFORM_LIST[0].id);
  const [edition, setEdition] = useState<Edition>(EDITION_LIST[0].id);
  // Mois partagé entre tous les réseaux : on saisit généralement les 6 réseaux
  // pour le même mois d'affilée, inutile de le re-choisir à chaque onglet.
  const [month, setMonth] = useState(currentMonthValue);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6">
        <div className="space-y-2">
          <Label>Édition</Label>
          <EditionToggle edition={edition} onChange={setEdition} />
          <p className="text-xs text-muted-foreground">
            {EDITION_LIST.find((e) => e.id === edition)?.label} — bascule ici pour saisir
            l&apos;autre édition sur les mêmes réseaux.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entry-month">Mois</Label>
          <Input
            id="entry-month"
            type="month"
            className="w-48"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            S&apos;applique à tous les réseaux ci-dessous.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Platform)}>
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          {PLATFORM_LIST.map((config) => {
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={config.id}
                value={config.id}
                title={config.label}
                aria-label={config.label}
                className="px-3 data-active:bg-muted"
              >
                <Icon style={{ color: config.color }} className="size-4 shrink-0" />
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PLATFORM_LIST.map((config) => (
          <TabsContent key={config.id} value={config.id} className="mt-6">
            <PlatformForm
              platform={config.id}
              edition={edition}
              month={month}
              onSaved={() => {
                const currentIndex = PLATFORM_LIST.findIndex((p) => p.id === config.id);
                const next = PLATFORM_LIST[(currentIndex + 1) % PLATFORM_LIST.length];
                setActiveTab(next.id);
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface ExistingSummary {
  followers: number;
  views: number;
}

function PlatformForm({
  platform,
  edition,
  month,
  onSaved,
}: {
  platform: Platform;
  edition: Edition;
  month: string;
  onSaved: () => void;
}) {
  const config = PLATFORM_LIST.find((p) => p.id === platform)!;
  // Saisie déjà en base pour ce réseau / édition / mois : affichée en avertissement
  // et pré-remplie dans les champs, puisque "Enregistrer" la remplacera.
  const [existingForMonth, setExisting] = useState<ExistingSummary | null>(null);
  const existing = month ? existingForMonth : null;
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormInput, unknown, EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: defaultValuesFor(platform, edition, month),
  });

  useEffect(() => {
    if (!month) return;
    let cancelled = false;
    findExistingEntry(platform, edition, month).then((entry) => {
      if (cancelled) return;
      setExisting(entry ? { followers: entry.followers, views: entry.views } : null);
      setValue("followers", formatNumber(entry?.followers ?? 0));
      setValue("views", formatNumber(entry?.views ?? 0));
    });
    return () => {
      cancelled = true;
    };
  }, [platform, edition, month, setValue]);

  async function onSubmit(values: EntryFormValues) {
    // platform/edition/mois viennent des props (ils changent après le montage
    // du formulaire), pas des valeurs par défaut figées de useForm.
    if (!month) {
      toast.error("Choisis un mois avant d'enregistrer");
      return;
    }
    const result = await createEntry({ ...values, platform, edition, periodDate: month });
    if (result.success) {
      toast.success(
        result.updated
          ? `Statistiques ${config.label} (${edition}) mises à jour pour ${formatMonthLabel(values.periodDate)}`
          : `Statistiques ${config.label} (${edition}) enregistrées`
      );
      setExisting({ followers: values.followers, views: values.views });
      onSaved();
    } else {
      toast.error(result.error ?? "Une erreur est survenue");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      {existing && (
        <p
          role="status"
          className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-foreground"
        >
          Une saisie existe déjà pour {formatMonthLabel(month)} ({formatNumber(existing.followers)}{" "}
          {config.followersLabel.toLowerCase()}, {formatNumber(existing.views)}{" "}
          {config.viewsLabel.toLowerCase()}). Enregistrer la remplacera.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <div className="min-w-32 flex-1 space-y-2">
          <Label htmlFor="followers">{config.followersLabel}</Label>
          <Input
            id="followers"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            {...register("followers", { onBlur: reformatNumericInput })}
          />
          {errors.followers && (
            <p className="text-xs text-destructive">{errors.followers.message}</p>
          )}
        </div>

        <div className="min-w-32 flex-1 space-y-2">
          <Label htmlFor="views">{config.viewsLabel}</Label>
          <Input
            id="views"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            {...register("views", { onBlur: reformatNumericInput })}
          />
          {errors.views && <p className="text-xs text-destructive">{errors.views.message}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="gap-2 border-transparent hover:opacity-90"
        style={{ backgroundColor: config.color, color: config.contrastColor }}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : existing ? (
          <RefreshCw className="size-4" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {existing ? "Mettre à jour & Suivant" : "Enregistrer & Suivant"}
      </Button>
    </form>
  );
}
