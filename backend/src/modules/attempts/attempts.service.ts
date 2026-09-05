import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";

export interface McqAnswer {
  questionId: string;
  selectedIndex: number;
}

// Shape assumed for MCQ questions until the teammate's question-bank module
// lands — Assessment.questions is stored as loosely-typed JSON precisely so
// this assumption is isolated to this one scorer function. Adjust here (only)
// once the real contract is known: expected per-question fields are
// {id, domainTag, subSkillTag, correctIndex}.
interface StubMcqQuestion {
  id: string;
  domainTag?: string;
  subSkillTag?: string;
  correctIndex?: number;
}

export async function startAttempt(opts: {
  assessmentId: string;
  userId: string;
  sessionId?: string | null;
}) {
  const existing = await prisma.attempt.findFirst({
    where: {
      assessmentId: opts.assessmentId,
      userId: opts.userId,
      sessionId: opts.sessionId ?? null,
      status: "in_progress",
    },
  });
  if (existing) return existing;

  return prisma.attempt.create({
    data: {
      assessmentId: opts.assessmentId,
      userId: opts.userId,
      sessionId: opts.sessionId ?? null,
      status: "in_progress",
    },
  });
}

export async function getAttempt(attemptId: string, requestingUserId: string, requestingRole: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { assessment: true, violations: true },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.userId !== requestingUserId && requestingRole === "learner") {
    throw new ApiError(403, "Not your attempt");
  }
  return attempt;
}

function scoreMcqLike(questions: unknown, answers: McqAnswer[]) {
  const qs = Array.isArray(questions) ? (questions as StubMcqQuestion[]) : [];
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));

  const domainTotals = new Map<string, { correct: number; total: number }>();
  const subSkillTotals = new Map<string, { correct: number; total: number }>();

  let correctCount = 0;
  let scoredCount = 0;

  for (const q of qs) {
    if (q.correctIndex === undefined) continue; // not scorable client-side (e.g. essay) — skip
    scoredCount += 1;
    const isCorrect = answerByQuestion.get(q.id) === q.correctIndex;
    if (isCorrect) correctCount += 1;

    if (q.domainTag) {
      const d = domainTotals.get(q.domainTag) ?? { correct: 0, total: 0 };
      d.total += 1;
      if (isCorrect) d.correct += 1;
      domainTotals.set(q.domainTag, d);
    }
    if (q.subSkillTag) {
      const s = subSkillTotals.get(q.subSkillTag) ?? { correct: 0, total: 0 };
      s.total += 1;
      if (isCorrect) s.correct += 1;
      subSkillTotals.set(q.subSkillTag, s);
    }
  }

  const pct = (c: number, t: number) => (t > 0 ? Math.round((c / t) * 100) : 0);

  const perDomainScore = Object.fromEntries(
    Array.from(domainTotals.entries()).map(([k, v]) => [k, pct(v.correct, v.total)]),
  );
  const perSubSkillScore = Object.fromEntries(
    Array.from(subSkillTotals.entries()).map(([k, v]) => [k, pct(v.correct, v.total)]),
  );

  return { score: pct(correctCount, scoredCount), perDomainScore, perSubSkillScore };
}

// Blends a fresh attempt score into the running UserCompetencyScore per
// sub-skill (simple 50/50 blend with any existing level) so the competency
// engine's gap map reflects real performance, not just seed data.
async function feedCompetencyScores(userId: string, perSubSkillScore: Record<string, number>) {
  for (const [subSkillName, newLevel] of Object.entries(perSubSkillScore)) {
    const subSkill = await prisma.subSkill.findFirst({ where: { name: subSkillName } });
    if (!subSkill) continue;

    const existing = await prisma.userCompetencyScore.findUnique({
      where: { userId_subSkillId: { userId, subSkillId: subSkill.id } },
    });
    const blended = existing ? Math.round((existing.level + newLevel) / 2) : newLevel;

    await prisma.userCompetencyScore.upsert({
      where: { userId_subSkillId: { userId, subSkillId: subSkill.id } },
      update: { level: blended, source: "attempt" },
      create: { userId, subSkillId: subSkill.id, level: blended, source: "attempt" },
    });
  }
}

export async function submitAttempt(opts: {
  attemptId: string;
  requestingUserId: string;
  answers: unknown;
  // Fallback for assessment types this backend can't score itself yet
  // (e.g. simulations before Phase 4 lands) — caller-supplied score is
  // trusted only when the assessment has no scorable questions.
  externalScore?: { score: number; perDomainScore?: Record<string, number>; perSubSkillScore?: Record<string, number> };
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: opts.attemptId },
    include: { assessment: true },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.userId !== opts.requestingUserId) throw new ApiError(403, "Not your attempt");
  if (attempt.status !== "in_progress") throw new ApiError(409, `Attempt already ${attempt.status}`);

  let result: { score: number; perDomainScore: Record<string, number>; perSubSkillScore: Record<string, number> };

  if (attempt.assessment.type === "mcq" || attempt.assessment.type === "diagnostic") {
    const answers = Array.isArray(opts.answers) ? (opts.answers as McqAnswer[]) : [];
    result = scoreMcqLike(attempt.assessment.questions, answers);
  } else if (opts.externalScore) {
    result = {
      score: opts.externalScore.score,
      perDomainScore: opts.externalScore.perDomainScore ?? {},
      perSubSkillScore: opts.externalScore.perSubSkillScore ?? {},
    };
  } else {
    throw new ApiError(400, "This assessment type requires an externally computed score");
  }

  const updated = await prisma.attempt.update({
    where: { id: opts.attemptId },
    data: {
      answers: opts.answers as never,
      score: result.score,
      perDomainScore: result.perDomainScore as never,
      perSubSkillScore: result.perSubSkillScore as never,
      status: "submitted",
      submittedAt: new Date(),
    },
  });

  await feedCompetencyScores(attempt.userId, result.perSubSkillScore);

  return updated;
}

// Called by the violations module on a 3rd violation — forces submission of
// whatever answers exist so far and marks the attempt kicked, not submitted.
export async function forceKick(attemptId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { assessment: true },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.status !== "in_progress") return attempt;

  let result = { score: 0, perDomainScore: {}, perSubSkillScore: {} };
  if (
    (attempt.assessment.type === "mcq" || attempt.assessment.type === "diagnostic") &&
    Array.isArray(attempt.answers)
  ) {
    result = scoreMcqLike(attempt.assessment.questions, attempt.answers as unknown as McqAnswer[]);
  }

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      score: result.score,
      perDomainScore: result.perDomainScore as never,
      perSubSkillScore: result.perSubSkillScore as never,
      status: "kicked",
      submittedAt: new Date(),
    },
  });

  await feedCompetencyScores(attempt.userId, result.perSubSkillScore);

  return updated;
}

export async function listAttemptsForSession(sessionId: string) {
  return prisma.attempt.findMany({
    where: { sessionId },
    include: { user: true, violations: true },
    orderBy: { startedAt: "desc" },
  });
}
