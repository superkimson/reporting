import "server-only";
import type { Entry } from "@/generated/prisma/client";
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
