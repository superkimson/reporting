"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeEngagementRate, normalizePeriodDate } from "@/lib/metrics";
import { entryFormSchema, type EntryFormValues } from "@/lib/validation";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function revalidateAffectedPaths(platform: string) {
  revalidatePath("/");
  revalidatePath("/saisie");
  revalidatePath(`/${platform.toLowerCase()}`);
}

// Crée ou met à jour (upsert) une saisie pour un réseau + une période donnée.
// L'unicité [platform, periodType, periodDate] permet de corriger une saisie existante
// simplement en la re-soumettant, sans créer de doublon.
export async function createEntry(values: EntryFormValues): Promise<ActionResult> {
  const parsed = entryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const data = parsed.data;
  const engagementRate = computeEngagementRate(data.engagements, data.impressions);
  const periodDate = normalizePeriodDate(data.periodDate, data.periodType);

  try {
    await prisma.entry.upsert({
      where: {
        platform_periodType_periodDate: {
          platform: data.platform,
          periodType: data.periodType,
          periodDate,
        },
      },
      create: {
        platform: data.platform,
        periodType: data.periodType,
        periodDate,
        followers: data.followers,
        impressions: data.impressions,
        engagements: data.engagements,
        engagementRate,
        watchTimeMinutes: data.watchTimeMinutes ?? null,
      },
      update: {
        followers: data.followers,
        impressions: data.impressions,
        engagements: data.engagements,
        engagementRate,
        watchTimeMinutes: data.watchTimeMinutes ?? null,
      },
    });

    revalidateAffectedPaths(data.platform);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  try {
    const entry = await prisma.entry.delete({ where: { id } });
    revalidateAffectedPaths(entry.platform);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}
