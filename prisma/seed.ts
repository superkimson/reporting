import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { Platform, Edition, PeriodType } from "../src/generated/prisma/enums";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

interface MonthEntry {
  month: string; // "YYYY-MM"
  followers: number;
  views: number;
  reach?: number;
  interactions?: number;
}

// Historique réel (nov. 2025 → juil. 2026). Les mois sans donnée (ex: mai 2026,
// pas de collecte) sont simplement absents plutôt que mis à 0.
// WhatsApp et Dailymotion démarrent à zéro en août 2026 : pas d'historique encore.
const REAL_DATA: Partial<Record<Platform, Record<Edition, MonthEntry[]>>> = {
  INSTAGRAM: {
    MA: [
      { month: "2025-11", followers: 11900, views: 275300, reach: 166000, interactions: 9200 },
      { month: "2025-12", followers: 12900, views: 307500, reach: 168000, interactions: 8400 },
      { month: "2026-01", followers: 13400, views: 266000, reach: 96600, interactions: 5600 },
      { month: "2026-02", followers: 13700, views: 142000, reach: 64500, interactions: 3700 },
      { month: "2026-03", followers: 14000, views: 197000, reach: 62500, interactions: 5100 },
      { month: "2026-04", followers: 14300, views: 316100 },
      { month: "2026-06", followers: 14700, views: 690000 },
      { month: "2026-07", followers: 15900, views: 1200000 },
    ],
    AG: [
      { month: "2025-11", followers: 4865, views: 92800, reach: 37800, interactions: 916 },
      { month: "2025-12", followers: 4947, views: 100000, reach: 43500, interactions: 1100 },
      { month: "2026-01", followers: 5500, views: 272000, reach: 183000, interactions: 2800 },
      { month: "2026-02", followers: 5800, views: 192000, reach: 91000, interactions: 2900 },
      { month: "2026-03", followers: 6000, views: 192000, reach: 65700, interactions: 2200 },
      { month: "2026-04", followers: 6300, views: 209100 },
      { month: "2026-06", followers: 6900, views: 355000 },
      { month: "2026-07", followers: 7000, views: 305000 },
    ],
  },
  FACEBOOK: {
    MA: [
      { month: "2025-11", followers: 94600, views: 2000000, reach: 663000, interactions: 10300 },
      { month: "2025-12", followers: 100000, views: 2500000, reach: 810000, interactions: 14700 },
      { month: "2026-01", followers: 100200, views: 2400000, reach: 855000, interactions: 14500 },
      { month: "2026-02", followers: 104200, views: 1400000, reach: 556000, interactions: 11700 },
      { month: "2026-03", followers: 108000, views: 2600000, reach: 1500000, interactions: 23000 },
      { month: "2026-04", followers: 109400, views: 2000000 },
      { month: "2026-06", followers: 109800, views: 3500000 },
      { month: "2026-07", followers: 110000, views: 2000000 },
    ],
    AG: [
      { month: "2025-11", followers: 29000, views: 968300, reach: 241200, interactions: 1200 },
      { month: "2025-12", followers: 29000, views: 938700, reach: 200000, interactions: 996 },
      { month: "2026-01", followers: 29100, views: 1800000, reach: 596000, interactions: 3300 },
      { month: "2026-02", followers: 29000, views: 543000, reach: 226000, interactions: 1900 },
      { month: "2026-03", followers: 29000, views: 320000, reach: 113000, interactions: 1200 },
      { month: "2026-04", followers: 29600, views: 783200 },
      { month: "2026-06", followers: 29800, views: 2200000 },
      { month: "2026-07", followers: 30000, views: 2100000 },
    ],
  },
  TIKTOK: {
    MA: [
      { month: "2025-11", followers: 8000, views: 781000 },
      { month: "2025-12", followers: 9000, views: 170000 },
      { month: "2026-01", followers: 10100, views: 304000 },
      { month: "2026-02", followers: 10700, views: 248000 },
      { month: "2026-03", followers: 11900, views: 203000 },
      { month: "2026-04", followers: 19200, views: 855000 },
      { month: "2026-06", followers: 22700, views: 128000 },
      { month: "2026-07", followers: 22800, views: 98900 },
    ],
    AG: [
      { month: "2025-11", followers: 1000, views: 19000 },
      { month: "2025-12", followers: 1100, views: 81000 },
      { month: "2026-01", followers: 1100, views: 93000 },
      { month: "2026-02", followers: 1200, views: 56000 },
      { month: "2026-03", followers: 1200, views: 30000 },
      { month: "2026-04", followers: 1300, views: 100000 },
      { month: "2026-06", followers: 1500, views: 65000 },
      { month: "2026-07", followers: 1500, views: 47000 },
    ],
  },
  YOUTUBE: {
    MA: [
      { month: "2026-01", followers: 22000, views: 613000 },
      { month: "2026-02", followers: 23000, views: 375000 },
      { month: "2026-03", followers: 24000, views: 294000 },
      { month: "2026-04", followers: 25500, views: 326600 },
      { month: "2026-06", followers: 26000, views: 219000 },
      { month: "2026-07", followers: 26500, views: 297900 },
    ],
    AG: [
      { month: "2026-01", followers: 8900, views: 664000 },
      { month: "2026-02", followers: 9500, views: 31000 },
      { month: "2026-03", followers: 10900, views: 290000 },
      { month: "2026-04", followers: 11700, views: 398400 },
      { month: "2026-06", followers: 13000, views: 214000 },
      { month: "2026-07", followers: 14000, views: 263000 },
    ],
  },
};

function firstOfMonth(monthKey: string): Date {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

async function main() {
  console.log("Suppression des données existantes...");
  await prisma.entry.deleteMany();

  console.log("Import des données réelles...");

  for (const platform of Object.values(Platform)) {
    const platformData = REAL_DATA[platform];
    if (!platformData) continue; // WhatsApp, Dailymotion : pas encore d'historique.

    for (const edition of Object.values(Edition)) {
      for (const row of platformData[edition]) {
        const engagementRate =
          row.interactions !== undefined ? (row.interactions / row.views) * 100 : null;

        await prisma.entry.create({
          data: {
            platform,
            edition,
            periodType: PeriodType.MONTHLY,
            periodDate: firstOfMonth(row.month),
            followers: row.followers,
            views: row.views,
            reach: row.reach ?? null,
            interactions: row.interactions ?? null,
            engagementRate,
          },
        });
      }
    }
  }

  const count = await prisma.entry.count();
  console.log(`Terminé : ${count} entrées créées.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
