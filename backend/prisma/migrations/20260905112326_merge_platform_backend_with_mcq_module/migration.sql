-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('learner', 'trainer', 'org_admin');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('mcq', 'simulation', 'diagnostic');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('in_progress', 'submitted', 'kicked', 'expired');

-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('phone_detected', 'multiple_faces', 'no_face', 'tab_switch', 'fullscreen_exit');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "RoleName" NOT NULL DEFAULT 'learner',
    "designation" TEXT,
    "department" TEXT,
    "cadre" TEXT,
    "state" TEXT,
    "experienceYears" INTEGER,
    "targetRoleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyDomain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSkill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetRole" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cadre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TargetRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleCompetencyRequirement" (
    "id" TEXT NOT NULL,
    "targetRoleId" TEXT NOT NULL,
    "subSkillId" TEXT NOT NULL,
    "requiredLevel" INTEGER NOT NULL,

    CONSTRAINT "RoleCompetencyRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompetencyScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subSkillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'seed',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompetencyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "title" TEXT NOT NULL,
    "domainTags" TEXT[],
    "subSkillTags" TEXT[],
    "createdById" TEXT NOT NULL,
    "questions" JSONB,
    "scenario" JSONB,
    "timeLimitSeconds" INTEGER NOT NULL,
    "passingScore" INTEGER NOT NULL,
    "isProctored" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "answers" JSONB,
    "score" INTEGER,
    "perDomainScore" JSONB,
    "perSubSkillScore" JSONB,
    "status" "AttemptStatus" NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationEvent" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "type" "ViolationType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViolationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "targetAudience" TEXT,
    "joinToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "doId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'iGOT Karmayogi',
    "durationHours" INTEGER,
    "competencyTags" TEXT[],
    "description" TEXT,
    "level" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgramme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetCadre" TEXT[],
    "durationDays" INTEGER,
    "venue" TEXT,
    "batchSize" INTEGER,
    "competencyTags" TEXT[],
    "description" TEXT,
    "level" TEXT,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyDomain_name_key" ON "CompetencyDomain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubSkill_domainId_name_key" ON "SubSkill"("domainId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TargetRole_title_key" ON "TargetRole"("title");

-- CreateIndex
CREATE UNIQUE INDEX "RoleCompetencyRequirement_targetRoleId_subSkillId_key" ON "RoleCompetencyRequirement"("targetRoleId", "subSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompetencyScore_userId_subSkillId_key" ON "UserCompetencyScore"("userId", "subSkillId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_joinToken_key" ON "Session"("joinToken");

-- CreateIndex
CREATE UNIQUE INDEX "Course_doId_key" ON "Course"("doId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_targetRoleId_fkey" FOREIGN KEY ("targetRoleId") REFERENCES "TargetRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSkill" ADD CONSTRAINT "SubSkill_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "CompetencyDomain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCompetencyRequirement" ADD CONSTRAINT "RoleCompetencyRequirement_targetRoleId_fkey" FOREIGN KEY ("targetRoleId") REFERENCES "TargetRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleCompetencyRequirement" ADD CONSTRAINT "RoleCompetencyRequirement_subSkillId_fkey" FOREIGN KEY ("subSkillId") REFERENCES "SubSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompetencyScore" ADD CONSTRAINT "UserCompetencyScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompetencyScore" ADD CONSTRAINT "UserCompetencyScore_subSkillId_fkey" FOREIGN KEY ("subSkillId") REFERENCES "SubSkill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationEvent" ADD CONSTRAINT "ViolationEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

