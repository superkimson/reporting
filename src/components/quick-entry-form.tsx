"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createEntry } from "@/actions/entries";
import { entryFormSchema, type EntryFormValues } from "@/lib/validation";
import { PLATFORM_LIST } from "@/lib/platforms";
import type { Platform } from "@/generated/prisma/enums";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultValuesFor(platform: Platform): EntryFormValues {
  const hasFullMetrics = PLATFORM_LIST.find((p) => p.id === platform)!.hasFullMetrics;
  return {
    platform,
    periodType: "MONTHLY",
    periodDate: todayIsoDate(),
    followers: 0,
    views: 0,
    reach: hasFullMetrics ? 0 : undefined,
    interactions: hasFullMetrics ? 0 : undefined,
  };
}

export function QuickEntryForm() {
  const [activeTab, setActiveTab] = useState<Platform>(PLATFORM_LIST[0].id);

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as Platform)}
    >
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
            onSaved={() => {
              const currentIndex = PLATFORM_LIST.findIndex((p) => p.id === config.id);
              const next = PLATFORM_LIST[(currentIndex + 1) % PLATFORM_LIST.length];
              setActiveTab(next.id);
            }}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function PlatformForm({
  platform,
  onSaved,
}: {
  platform: Platform;
  onSaved: () => void;
}) {
  const config = PLATFORM_LIST.find((p) => p.id === platform)!;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: defaultValuesFor(platform),
  });

  async function onSubmit(values: EntryFormValues) {
    const result = await createEntry(values);
    if (result.success) {
      toast.success(`Statistiques ${config.label} enregistrées`);
      reset(defaultValuesFor(platform));
      onSaved();
    } else {
      toast.error(result.error ?? "Une erreur est survenue");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <div className="max-w-48 space-y-2">
        <Label htmlFor="periodDate">Date</Label>
        <Input id="periodDate" type="date" {...register("periodDate")} />
        {errors.periodDate && (
          <p className="text-xs text-destructive">{errors.periodDate.message}</p>
        )}
      </div>

      <div className={config.hasFullMetrics ? "flex flex-wrap gap-4" : "flex gap-4"}>
        <div className="min-w-32 flex-1 space-y-2">
          <Label htmlFor="followers">{config.followersLabel}</Label>
          <Input id="followers" type="number" min={0} {...register("followers")} />
          {errors.followers && (
            <p className="text-xs text-destructive">{errors.followers.message}</p>
          )}
        </div>

        <div className="min-w-32 flex-1 space-y-2">
          <Label htmlFor="views">{config.viewsLabel}</Label>
          <Input id="views" type="number" min={0} {...register("views")} />
          {errors.views && <p className="text-xs text-destructive">{errors.views.message}</p>}
        </div>

        {config.hasFullMetrics && (
          <>
            <div className="min-w-32 flex-1 space-y-2">
              <Label htmlFor="reach">{config.reachLabel}</Label>
              <Input id="reach" type="number" min={0} {...register("reach")} />
              {errors.reach && (
                <p className="text-xs text-destructive">{errors.reach.message}</p>
              )}
            </div>

            <div className="min-w-32 flex-1 space-y-2">
              <Label htmlFor="interactions">{config.interactionsLabel}</Label>
              <Input id="interactions" type="number" min={0} {...register("interactions")} />
              {errors.interactions && (
                <p className="text-xs text-destructive">{errors.interactions.message}</p>
              )}
            </div>
          </>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        Enregistrer & Suivant
      </Button>
    </form>
  );
}
