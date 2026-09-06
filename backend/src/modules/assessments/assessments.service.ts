import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import type { AssessmentType, Assessment } from "@prisma/client";
import { redactQuestionForDelivery, type StubMcqQuestion } from "../attempts/attempts.service";
import { balancedDomainSample } from "../../lib/assessment/assembleQuestions";
import { toAssessmentQuestions } from "../../lib/assessment/toAssessmentQuestions";
import { CURATED_ROLE_SKILL, SHARED_DIAGNOSTIC_SKILLS } from "../../lib/assessment/curatedDiagnostics";

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

<<<<<<< HEAD
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
=======
// Assembles a designation-specific baseline diagnostic (4 role-specific Statistical questions +
// the 6 shared Technical/Digital Governance/Behavioural ones — see
// prisma/seed/diagnosticQuestions.seed.ts) when the requesting learner's target role is one of
// the curated set, cached per role by title so it's built once. Falls through to the old
// generic-stub diagnostic (unchanged) for any role without curated content yet, or when no target
// role is set.
async function getOrCreateCuratedDiagnostic(systemUserId: string, targetRoleId: string) {
  const role = await prisma.targetRole.findUnique({ where: { id: targetRoleId } });
  const primarySkill = role ? CURATED_ROLE_SKILL[role.title] : undefined;
  if (!role || !primarySkill) return null;

  const title = `${DIAGNOSTIC_TITLE} — ${role.title}`;
  const existing = await prisma.assessment.findFirst({ where: { title, type: "diagnostic" } });
  if (existing) return redactAssessment(existing);

  const [roleQuestions, sharedQuestions] = await Promise.all([
    prisma.question.findMany({
      where: { status: "approved", skill: primarySkill },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
    Promise.all(
      SHARED_DIAGNOSTIC_SKILLS.map((skill) =>
        prisma.question.findFirst({ where: { status: "approved", skill }, orderBy: { createdAt: "asc" } }),
      ),
    ),
  ]);
  const curated = [...roleQuestions, ...sharedQuestions.filter((q): q is NonNullable<typeof q> => q !== null)];
  // Curated content not seeded yet (e.g. a fresh DB before `npm run seed`) — fall through to the
  // generic stub rather than creating a broken, question-less diagnostic under this role's title.
  if (curated.length === 0) return null;

  const questions = toAssessmentQuestions(curated);
  const created = await prisma.assessment.create({
    data: {
      type: "diagnostic",
      title,
      domainTags: Array.from(new Set(curated.map((q) => q.domain))),
      subSkillTags: Array.from(new Set(curated.map((q) => q.skill))),
      questions: questions as never,
      timeLimitSeconds: 20 * 60,
      passingScore: 40,
      createdById: systemUserId,
    },
  });
  return redactAssessment(created);
}

// Pulls a balanced set of sub-skills across all 4 domains for a first-time
// user's onboarding test. Calls into the teammate's question bank by domain
// tag once it exists — for now this assembles against a clearly-labelled
// stub question set so the endpoint and downstream Attempt flow can be
// wired and tested today (see prompt.md Phase 3 item 15).
export async function getOrCreateDiagnostic(systemUserId: string, targetRoleId?: string | null) {
  if (targetRoleId) {
    const curated = await getOrCreateCuratedDiagnostic(systemUserId, targetRoleId);
    if (curated) return curated;
>>>>>>> origin/main
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

export interface AssembleMcqAssessmentInput {
  title: string;
  targetRoleId?: string;
  domainTags?: string[];
  subSkillTags?: string[];
  count: number;
  timeLimitSeconds: number;
  passingScore: number;
  isProctored?: boolean;
}

// Trainer-facing "build a general MCQ test from the bank" endpoint. When targetRoleId is given,
// the sub-skills required for that designation (RoleCompetencyRequirement) drive question
// selection — this is the designation -> general-competency-test tie-in that nothing wired
// before. Falls back to whatever explicit domainTags/subSkillTags the trainer passed, or the
// whole approved bank if neither is given.
export async function assembleMcqAssessment(createdById: string, input: AssembleMcqAssessmentInput) {
  let subSkillTags = input.subSkillTags ?? [];

  if (input.targetRoleId) {
    const requirements = await prisma.roleCompetencyRequirement.findMany({
      where: { targetRoleId: input.targetRoleId },
      include: { subSkill: true },
    });
    if (requirements.length === 0) {
      throw new ApiError(404, "No competency requirements found for this target role");
    }
    subSkillTags = Array.from(new Set([...subSkillTags, ...requirements.map((r) => r.subSkill.name)]));
  }

  const domainTags = input.domainTags ?? [];
  if (subSkillTags.length === 0 && domainTags.length === 0) {
    throw new ApiError(400, "Provide targetRoleId, subSkillTags, or domainTags to select questions from the bank");
  }

  const eligible = await prisma.question.findMany({
    where: {
      status: "approved",
      ...(domainTags.length > 0 ? { domain: { in: domainTags } } : {}),
      ...(subSkillTags.length > 0 ? { skill: { in: subSkillTags } } : {}),
    },
  });
  if (eligible.length === 0) {
    throw new ApiError(409, "No approved questions in the bank match the requested domains/sub-skills yet");
  }

  const sampled = balancedDomainSample(eligible, input.count);
  const questions = toAssessmentQuestions(sampled);

  return createAssessment(createdById, {
    type: "mcq",
    title: input.title,
    domainTags: domainTags.length > 0 ? domainTags : Array.from(new Set(sampled.map((q) => q.domain))),
    subSkillTags: subSkillTags.length > 0 ? subSkillTags : Array.from(new Set(sampled.map((q) => q.skill))),
    questions,
    timeLimitSeconds: input.timeLimitSeconds,
    passingScore: input.passingScore,
    isProctored: input.isProctored,
  });
}
