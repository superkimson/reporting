"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isEditor } from "@/lib/auth";
import { normalizePeriodDate } from "@/lib/metrics";
import { topFiveEntrySchema } from "@/lib/validation";
import type { TopFiveEntry } from "@/generated/prisma/client";
import type { ActionResult } from "@/actions/entries";

// Enregistre (ou remplace) l'image d'un emplacement du Top 5 pour un mois donné.
export async function saveTopFiveEntry(values: {
  periodDate: string;
  position: number;
  name: string;
  views: number;
  imageData: string;
}): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = topFiveEntrySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const data = parsed.data;
  const periodDate = normalizePeriodDate(data.periodDate, "MONTHLY");

  try {
    await prisma.topFiveEntry.upsert({
      where: {
        periodDate_position: { periodDate, position: data.position },
      },
      create: {
        periodDate,
        position: data.position,
        name: data.name,
        views: data.views,
        imageData: data.imageData,
      },
      update: {
        name: data.name,
        views: data.views,
        imageData: data.imageData,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

export async function deleteTopFiveEntry(id: string): Promise<ActionResult> {
  if (!(await isEditor())) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await prisma.topFiveEntry.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// Lecture appelable depuis un composant client (le sélecteur de mois du dashboard) :
// une Server Action peut aussi bien lire qu'écrire, pas besoin d'une route API dédiée.
export async function fetchTopFiveForMonth(periodDateStr: string): Promise<TopFiveEntry[]> {
  const periodDate = normalizePeriodDate(periodDateStr, "MONTHLY");
  return prisma.topFiveEntry.findMany({
    where: { periodDate },
    orderBy: { position: "asc" },
  });
}
