-- AlterEnum
ALTER TYPE "QuestionStatus" ADD VALUE 'rejected';

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isNegatedStem" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "sourceDocumentId" DROP NOT NULL,
ALTER COLUMN "chunkId" DROP NOT NULL,
ALTER COLUMN "chunkText" DROP NOT NULL;

-- CreateTable
CREATE TABLE "QuestionEditLog" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "editedBy" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "QuestionEditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionEditLog_questionId_idx" ON "QuestionEditLog"("questionId");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE INDEX "Question_isNegatedStem_idx" ON "Question"("isNegatedStem");

-- AddForeignKey
ALTER TABLE "QuestionEditLog" ADD CONSTRAINT "QuestionEditLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

