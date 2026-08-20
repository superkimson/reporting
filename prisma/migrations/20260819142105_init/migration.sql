-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "periodType" TEXT NOT NULL,
    "periodDate" DATETIME NOT NULL,
    "followers" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "engagements" INTEGER NOT NULL,
    "engagementRate" REAL,
    "watchTimeMinutes" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Entry_platform_idx" ON "Entry"("platform");

-- CreateIndex
CREATE INDEX "Entry_periodDate_idx" ON "Entry"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_platform_periodType_periodDate_key" ON "Entry"("platform", "periodType", "periodDate");
