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

// Mois distincts ayant au moins une entrée Top 5, du plus récent au plus ancien
// — alimente le menu déroulant "revoir les tops passés" du dashboard.
export async function getTopFiveMonths(): Promise<Date[]> {
  const entries = await prisma.topFiveEntry.findMany({
    distinct: ["periodDate"],
    orderBy: { periodDate: "desc" },
    select: { periodDate: true },
  });
  return entries.map((e) => e.periodDate);
}
