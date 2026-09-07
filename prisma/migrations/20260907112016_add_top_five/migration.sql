-- CreateTable
CREATE TABLE "TopFiveEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "periodDate" DATETIME NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "imageData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "TopFiveEntry_periodDate_idx" ON "TopFiveEntry"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "TopFiveEntry_periodDate_position_key" ON "TopFiveEntry"("periodDate", "position");
