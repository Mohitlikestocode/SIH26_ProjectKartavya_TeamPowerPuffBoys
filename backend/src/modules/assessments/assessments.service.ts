// Assessments business logic — assembly (selecting questions into a test) and attempt creation.
import { prisma } from "@/config/db";
import { ApiError } from "@/middleware/errorHandler";
import { randomSample, balancedDomainSample } from "@/lib/assessment/assembleQuestions";
import type { Assessment, AssessmentPurpose, Attempt, Prisma } from "@prisma/client";

export interface AssembleAssessmentInput {
  purpose: AssessmentPurpose;
  title: string;
  questionCount: number;
  domain?: string;
  skill?: string;
  sourceDocumentId?: string;
  timeLimitMinutes?: number;
  passingThreshold?: number;
  createdBy?: string;
}

// Question-eligibility rule for this phase: draft + approved, excluding rejected. This is a
// deliberate testing-stage choice (the approved bank is still small) — NOT necessarily the final
// production rule. Tighten to `status: "approved"` only once the approved bank is large enough.
const ELIGIBLE_STATUSES: Prisma.QuestionWhereInput["status"] = { in: ["draft", "approved"] };

export async function assembleAssessment(input: AssembleAssessmentInput): Promise<Assessment> {
  if (input.purpose === "graded" && (input.passingThreshold === undefined || input.timeLimitMinutes === undefined)) {
    throw new ApiError(400, "Graded assessments require both passingThreshold and timeLimitMinutes.");
  }

  const where: Prisma.QuestionWhereInput = {
    status: ELIGIBLE_STATUSES,
    domain: input.domain,
    skill: input.skill,
    sourceDocumentId: input.sourceDocumentId,
  };

  const eligible = await prisma.question.findMany({ where });
  if (eligible.length === 0) {
    throw new ApiError(422, "No eligible questions (draft or approved, excluding rejected) match the given criteria.");
  }

  const selected =
    input.purpose === "diagnostic"
      ? balancedDomainSample(eligible, input.questionCount)
      : randomSample(eligible, input.questionCount);

  const criteria = {
    domain: input.domain ?? null,
    skill: input.skill ?? null,
    sourceDocumentId: input.sourceDocumentId ?? null,
  };

  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.create({
      data: {
        purpose: input.purpose,
        title: input.title,
        questionCount: input.questionCount,
        timeLimitMinutes: input.timeLimitMinutes,
        passingThreshold: input.passingThreshold,
        criteria,
        createdBy: input.createdBy,
      },
    });

    await tx.assessmentQuestion.createMany({
      data: selected.map((q, i) => ({ assessmentId: assessment.id, questionId: q.id, sequence: i })),
    });

    return assessment;
  });
}

export async function getAssessment(id: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { assessmentQuestions: { orderBy: { sequence: "asc" }, include: { question: true } } },
  });
  if (!assessment) throw new ApiError(404, "Assessment not found.");
  return assessment;
}

export async function startAttempt(assessmentId: string, userId: string): Promise<Attempt> {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw new ApiError(404, "Assessment not found.");

  const existing = await prisma.attempt.findFirst({
    where: { assessmentId, userId, status: "in_progress" },
  });
  if (existing) return existing;

  return prisma.attempt.create({ data: { assessmentId, userId } });
}
