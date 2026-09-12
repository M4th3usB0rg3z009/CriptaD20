-- CreateTable
CREATE TABLE "character_sheet_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_sheet_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_sheets" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "character_sheet_templates_campaignId_idx" ON "character_sheet_templates"("campaignId");

-- CreateIndex
CREATE INDEX "character_sheet_templates_createdById_idx" ON "character_sheet_templates"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "character_sheets_characterId_key" ON "character_sheets"("characterId");

-- CreateIndex
CREATE INDEX "character_sheets_templateId_idx" ON "character_sheets"("templateId");

-- AddForeignKey
ALTER TABLE "character_sheet_templates" ADD CONSTRAINT "character_sheet_templates_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheet_templates" ADD CONSTRAINT "character_sheet_templates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_sheets" ADD CONSTRAINT "character_sheets_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "character_sheet_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
