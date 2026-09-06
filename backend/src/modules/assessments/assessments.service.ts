import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import type { AssessmentType, Assessment } from "@prisma/client";
import { redactQuestionForDelivery, type StubMcqQuestion } from "../attempts/attempts.service";

// Every read path in this module is a pre-test view — a learner can reach these before ever
// starting (or without ever starting) an attempt, so correctIndex/explanations must never appear
// here regardless of assessment or attempt status. Only the attempts module's getAttempt(), after
// submission, is allowed to reveal them (see attempts.service.ts's redactQuestionForDelivery,
// reused here rather than duplicated).
function redactAssessment<T extends Pick<Assessment, "questions">>(assessment: T): T {
  if (!Array.isArray(assessment.questions)) return assessment;
  return {
    ...assessment,
    questions: (assessment.questions as unknown as StubMcqQuestion[]).map(redactQuestionForDelivery) as never,
  };
}

export interface CreateAssessmentInput {
  type: AssessmentType;
  title: string;
  domainTags: string[];
  subSkillTags: string[];
  questions?: unknown; // owned by the MCQ module — loosely typed on purpose
  scenario?: unknown; // owned by the Simulations module (Phase 4)
  timeLimitSeconds: number;
  passingScore: number;
  isProctored?: boolean;
}

export async function createAssessment(createdById: string, input: CreateAssessmentInput) {
  return prisma.assessment.create({
    data: {
      type: input.type,
      title: input.title,
      domainTags: input.domainTags,
      subSkillTags: input.subSkillTags,
      questions: input.questions as never,
      scenario: input.scenario as never,
      timeLimitSeconds: input.timeLimitSeconds,
      passingScore: input.passingScore,
      isProctored: input.isProctored ?? false,
      createdById,
    },
  });
}

export async function getAssessment(id: string) {
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) throw new ApiError(404, "Assessment not found");
  return redactAssessment(assessment);
}

export async function listAssessments(createdById?: string) {
  const assessments = await prisma.assessment.findMany({
    where: createdById ? { createdById } : {},
    orderBy: { createdAt: "desc" },
  });
  return assessments.map(redactAssessment);
}

const DIAGNOSTIC_TITLE = "Baseline Diagnostic";

// Role-scoped onboarding diagnostics are seeded by prisma/seed/diagnostic.seed.ts — one per
// supported officer role, each 10 questions (4 role-specific Statistical + 6 shared covering the
// other three domains). This looks the seeded one up by the caller's target role and only falls
// back to the generic stub below when the officer's role has no authored diagnostic yet, so
// existing accounts pointed at the other seeded target roles keep working unchanged.
export async function getOrCreateDiagnostic(systemUserId: string, targetRoleTitle?: string | null) {
  if (targetRoleTitle) {
    const roleScoped = await prisma.assessment.findFirst({
      where: { type: "diagnostic", title: `${DIAGNOSTIC_TITLE} – ${targetRoleTitle}` },
    });
    if (roleScoped) return redactAssessment(roleScoped);
  }

  const existing = await prisma.assessment.findFirst({
    where: { title: DIAGNOSTIC_TITLE, type: "diagnostic" },
  });
  if (existing) return redactAssessment(existing);

  const domains = await prisma.competencyDomain.findMany({ include: { subSkills: true } });
  const stubQuestions = domains.flatMap((domain, di) =>
    domain.subSkills.slice(0, 2).map((subSkill, qi) => ({
      id: `stub-${di}-${qi}`,
      stem: `[Placeholder] Sample diagnostic question for ${subSkill.name} (${domain.name}) — replace once the question bank is wired.`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: 0,
      domainTag: domain.name,
      subSkillTag: subSkill.name,
      isStub: true,
    })),
  );

  const created = await prisma.assessment.create({
    data: {
      type: "diagnostic",
      title: DIAGNOSTIC_TITLE,
      domainTags: domains.map((d) => d.name),
      subSkillTags: stubQuestions.map((q) => q.subSkillTag),
      questions: stubQuestions as never,
      timeLimitSeconds: 30 * 60,
      passingScore: 40,
      createdById: systemUserId,
    },
  });
  return redactAssessment(created);
}
