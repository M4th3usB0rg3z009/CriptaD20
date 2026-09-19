-- CreateTable
CREATE TABLE "dice_rolls" (
    "id" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "dice" JSONB NOT NULL,
    "modifier" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dice_rolls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dice_rolls_sessionId_idx" ON "dice_rolls"("sessionId");

-- CreateIndex
CREATE INDEX "dice_rolls_userId_idx" ON "dice_rolls"("userId");

-- CreateIndex
CREATE INDEX "dice_rolls_createdAt_idx" ON "dice_rolls"("createdAt");

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dice_rolls" ADD CONSTRAINT "dice_rolls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
