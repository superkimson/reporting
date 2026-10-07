"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isEditor } from "@/lib/auth";
import { formatMonthLabel, normalizePeriodDate } from "@/lib/metrics";
import { PLATFORMS } from "@/lib/platforms";
import { entryFormSchema, type EntryFormValues } from "@/lib/validation";
import type { Edition, Platform } from "@/generated/prisma/enums";

export interface ActionResult {
  success: boolean;
  error?: string;
  /** Pour createEntry : true si une saisie existante a été remplacée. */
  updated?: boolean;
}

function revalidateAffectedPaths(platform: string) {
  revalidatePath("/");
  revalidatePath("/saisie");
  revalidatePath(`/${platform.toLowerCase()}`);
}

// Crée ou met à jour (upsert) une saisie pour un réseau + une période donnée.
// L'unicité [platform, edition, periodType, periodDate] permet de corriger une
// saisie existante simplement en la re-soumettant, sans créer de doublon.
export async function createEntry(values: EntryFormValues): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = entryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const data = parsed.data;
  const periodDate = normalizePeriodDate(data.periodDate, data.periodType);
  const where = {
    platform_edition_periodType_periodDate: {
      platform: data.platform,
      edition: data.edition,
      periodType: data.periodType,
      periodDate,
    },
  };

  try {
    const existing = await prisma.entry.findUnique({ where, select: { id: true } });

    await prisma.entry.upsert({
      where,
      create: {
        platform: data.platform,
        edition: data.edition,
        periodType: data.periodType,
        periodDate,
        followers: data.followers,
        views: data.views,
        reach: data.reach ?? null,
      },
      update: {
        followers: data.followers,
        views: data.views,
        reach: data.reach ?? null,
      },
    });

    revalidateAffectedPaths(data.platform);
    return { success: true, updated: existing !== null };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

// Modifie une saisie existante identifiée par son id. Contrairement à
// createEntry, la période (et l'édition) peuvent changer : on corrige ainsi une
// saisie faite sur le mauvais mois sans passer par suppression + re-création.
export async function updateEntry(id: string, values: EntryFormValues): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = entryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const data = parsed.data;
  const periodDate = normalizePeriodDate(data.periodDate, data.periodType);

  try {
    const current = await prisma.entry.findUnique({ where: { id } });
    if (!current) {
      return { success: false, error: "Cette saisie n'existe plus" };
    }

    // Une autre saisie occupe déjà la cible : on refuse plutôt que d'écraser
    // en silence — l'utilisateur peut la modifier ou la supprimer d'abord.
    const conflict = await prisma.entry.findUnique({
      where: {
        platform_edition_periodType_periodDate: {
          platform: data.platform,
          edition: data.edition,
          periodType: data.periodType,
          periodDate,
        },
      },
      select: { id: true },
    });
    if (conflict && conflict.id !== id) {
      return {
        success: false,
        error: `Une saisie existe déjà pour ${PLATFORMS[data.platform].label} ${data.edition} en ${formatMonthLabel(periodDate)}`,
      };
    }

    await prisma.entry.update({
      where: { id },
      data: {
        platform: data.platform,
        edition: data.edition,
        periodType: data.periodType,
        periodDate,
        followers: data.followers,
        views: data.views,
        reach: data.reach ?? null,
      },
    });

    revalidateAffectedPaths(current.platform);
    if (current.platform !== data.platform) revalidateAffectedPaths(data.platform);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la modification" };
  }
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    const entry = await prisma.entry.delete({ where: { id } });
    revalidateAffectedPaths(entry.platform);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export interface ExistingEntrySummary {
  id: string;
  followers: number;
  views: number;
  reach: number | null;
}

// Saisie mensuelle déjà enregistrée pour ce réseau / édition / mois, s'il y en
// a une — permet au formulaire de saisie rapide de prévenir avant d'écraser.
export async function findExistingEntry(
  platform: Platform,
  edition: Edition,
  month: string
): Promise<ExistingEntrySummary | null> {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(month)) return null;

  const entry = await prisma.entry.findUnique({
    where: {
      platform_edition_periodType_periodDate: {
        platform,
        edition,
        periodType: "MONTHLY",
        periodDate: normalizePeriodDate(month, "MONTHLY"),
      },
    },
    select: { id: true, followers: true, views: true, reach: true },
  });
  return entry;
}
