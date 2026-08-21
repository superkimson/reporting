/*
  Warnings:

  - Added the required column `edition` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
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
INSERT INTO "new_Entry" ("createdAt", "engagementRate", "followers", "id", "interactions", "periodDate", "periodType", "platform", "reach", "updatedAt", "views") SELECT "createdAt", "engagementRate", "followers", "id", "interactions", "periodDate", "periodType", "platform", "reach", "updatedAt", "views" FROM "Entry";
DROP TABLE "Entry";
ALTER TABLE "new_Entry" RENAME TO "Entry";
CREATE INDEX "Entry_platform_idx" ON "Entry"("platform");
CREATE INDEX "Entry_edition_idx" ON "Entry"("edition");
CREATE INDEX "Entry_periodDate_idx" ON "Entry"("periodDate");
CREATE UNIQUE INDEX "Entry_platform_edition_periodType_periodDate_key" ON "Entry"("platform", "edition", "periodType", "periodDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
