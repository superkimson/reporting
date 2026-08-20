import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { Platform, PeriodType } from "../src/generated/prisma/enums";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const MONTHS_OF_HISTORY = 12;

// Point de départ (abonnés) et taux de croissance mensuel moyen par réseau.
const STARTING_POINTS: Record<
  Platform,
  { followers: number; growth: number; reach: number; engagementRate: number }
> = {
  INSTAGRAM: { followers: 5200, growth: 0.035, reach: 12, engagementRate: 3.2 },
  FACEBOOK: { followers: 6100, growth: 0.015, reach: 5, engagementRate: 1.5 },
  YOUTUBE: { followers: 890, growth: 0.06, reach: 25, engagementRate: 5.5 },
  TIKTOK: { followers: 2100, growth: 0.09, reach: 40, engagementRate: 7.0 },
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function firstOfMonth(monthsAgo: number): Date {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  return date;
}

async function main() {
  console.log("Suppression des données existantes...");
  await prisma.entry.deleteMany();

  console.log("Génération des données de démonstration...");

  for (const platform of Object.values(Platform)) {
    const config = STARTING_POINTS[platform];
    let followers = config.followers;

    // On part du mois le plus ancien vers le plus récent pour simuler une croissance progressive.
    for (let i = MONTHS_OF_HISTORY - 1; i >= 0; i--) {
      const monthlyNoise = randomBetween(-0.02, 0.03);
      followers = Math.round(followers * (1 + config.growth + monthlyNoise));

      const impressions = Math.round(
        followers * config.reach * randomBetween(0.8, 1.3)
      );
      const engagements = Math.round(
        impressions * (config.engagementRate / 100) * randomBetween(0.85, 1.2)
      );
      const engagementRate = (engagements / impressions) * 100;

      const watchTimeMinutes =
        platform === "YOUTUBE" || platform === "TIKTOK"
          ? Math.round(impressions * randomBetween(0.4, 0.9))
          : null;

      await prisma.entry.create({
        data: {
          platform,
          periodType: PeriodType.MONTHLY,
          periodDate: firstOfMonth(i),
          followers,
          impressions,
          engagements,
          engagementRate,
          watchTimeMinutes,
        },
      });
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
