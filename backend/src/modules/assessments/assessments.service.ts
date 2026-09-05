import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import type { AssessmentType } from "@prisma/client";

export interface CreateAssessmentInput {
  type: AssessmentType;
  title: string;
  domainTags: string[];
  subSkillTags: string[];
  questions?: unknown; // owned by the MCQ module — loosely typed on purpose
  scenario?: unknown; // owned by the Simulations module (Phase 4)
  timeLimitSeconds: number;
  passingScore: number;
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
      createdById,
    },
  });
}

export async function getAssessment(id: string) {
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) throw new ApiError(404, "Assessment not found");
  return assessment;
}

export async function listAssessments(createdById?: string) {
  return prisma.assessment.findMany({
    where: createdById ? { createdById } : {},
    orderBy: { createdAt: "desc" },
  });
}

const DIAGNOSTIC_TITLE = "Baseline Diagnostic";

// Pulls a balanced set of sub-skills across all 4 domains for a first-time
// user's onboarding test. Calls into the teammate's question bank by domain
// tag once it exists — for now this assembles against a clearly-labelled
// stub question set so the endpoint and downstream Attempt flow can be
// wired and tested today (see prompt.md Phase 3 item 15).
export async function getOrCreateDiagnostic(systemUserId: string) {
  const existing = await prisma.assessment.findFirst({
    where: { title: DIAGNOSTIC_TITLE, type: "diagnostic" },
  });
  if (existing) return existing;

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

  return prisma.assessment.create({
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
}
