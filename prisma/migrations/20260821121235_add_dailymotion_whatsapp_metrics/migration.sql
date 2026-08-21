/*
  Warnings:

  - You are about to drop the column `engagements` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `impressions` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `watchTimeMinutes` on the `Entry` table. All the data in the column will be lost.
  - Added the required column `views` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodDate" DATETIME NOT NULL,
    "followers" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "reach" INTEGER,
    "interactions" INTEGER,
    "engagementRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Entry" ("createdAt", "engagementRate", "followers", "id", "periodDate", "periodType", "platform", "updatedAt") SELECT "createdAt", "engagementRate", "followers", "id", "periodDate", "periodType", "platform", "updatedAt" FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";
CREATE INDEX "Entry_platform_idx" ON "Entry"("platform");
CREATE INDEX "Entry_periodDate_idx" ON "Entry"("periodDate");
CREATE UNIQUE INDEX "Entry_platform_periodType_periodDate_key" ON "Entry"("platform", "periodType", "periodDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
