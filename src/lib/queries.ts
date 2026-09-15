import "server-only";
import type { Entry, TopFiveEntry } from "@/generated/prisma/client";
import type { Platform } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function getAllEntries(): Promise<Entry[]> {
  return prisma.entry.findMany({
    orderBy: [{ platform: "asc" }, { periodDate: "desc" }],
  });
}

export async function getEntriesByPlatform(platform: Platform): Promise<Entry[]> {
  return prisma.entry.findMany({
    where: { platform },
    orderBy: { periodDate: "desc" },
  });
}

export async function getTopFiveForMonth(periodDate: Date): Promise<TopFiveEntry[]> {
  return prisma.topFiveEntry.findMany({
    where: { periodDate },
    orderBy: { position: "asc" },
  });
}

const TOP_FIVE_SLOTS = 5;

export interface TopFiveMonthSummary {
  periodDate: Date;
  count: number;
}

// Mois ayant au moins une entrée Top 5, du plus récent au plus ancien, avec le
// nombre d'emplacements remplis — alimente le menu déroulant du dashboard et
// le choix du mois affiché par défaut.
export async function getTopFiveMonthSummaries(): Promise<TopFiveMonthSummary[]> {
  const groups = await prisma.topFiveEntry.groupBy({
    by: ["periodDate"],
    _count: { _all: true },
    orderBy: { periodDate: "desc" },
  });
  return groups.map((group) => ({ periodDate: group.periodDate, count: group._count._all }));
}

// Mois affiché par défaut : le plus récent dont les 5 emplacements sont remplis
// (le mois en cours s'il est déjà complet). À défaut, le plus récent qui a au
// moins une entrée, sinon le mois en cours.
export function pickDefaultTopFiveMonth(
  summaries: TopFiveMonthSummary[],
  currentMonth: Date
): Date {
  const complete = summaries.find((summary) => summary.count >= TOP_FIVE_SLOTS);
  return complete?.periodDate ?? summaries[0]?.periodDate ?? currentMonth;
}
