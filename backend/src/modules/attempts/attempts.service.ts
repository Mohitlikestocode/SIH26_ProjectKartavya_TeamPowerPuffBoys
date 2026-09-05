import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import { scoreSimulationPath, type ScenarioGraph, type ScenarioPathStep } from "../simulations/simulations.service";

export interface McqAnswer {
  questionId: string;
  selectedIndex: number;
}

// Shape assumed for MCQ questions until the teammate's question-bank module
// lands — Assessment.questions is stored as loosely-typed JSON precisely so
// this assumption is isolated to this one scorer function. Adjust here (only)
// once the real contract is known: expected per-question fields are
// {id, domainTag, subSkillTag, correctIndex}.
// `explanations` is optional and passed through opaquely (same reasoning as `questions` itself)
// so the MCQ module's explanation shape isn't this module's concern to type — it's just echoed
// back in each question's result once the attempt is submitted.
export interface StubMcqQuestion {
  id: string;
  domainTag?: string;
  subSkillTag?: string;
  correctIndex?: number;
  explanations?: unknown;
}

// One question's result, captured at scoring time instead of being discarded. `selectedIndex` is
// null for a question the learner never answered.
export interface McqQuestionResult {
  questionId: string;
  selectedIndex: number | null;
  isCorrect: boolean;
  explanations?: unknown;
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

// Strips answer-revealing fields from a question while an attempt is still in_progress. Doesn't
// change what's stored — only what this one read path hands back before submission.
export function redactQuestionForDelivery(q: StubMcqQuestion) {
  const { correctIndex: _correctIndex, explanations: _explanations, ...rest } = q;
  return rest;
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

  // results/passed are already null on an in_progress attempt (only ever written at submission),
  // so the only thing that needs active redaction here is the embedded question bank's answer key.
  if (attempt.status === "in_progress" && Array.isArray(attempt.assessment.questions)) {
    return {
      ...attempt,
      assessment: {
        ...attempt.assessment,
        questions: (attempt.assessment.questions as unknown as StubMcqQuestion[]).map(redactQuestionForDelivery),
      },
    };
  }

  return attempt;
}

function scoreMcqLike(questions: unknown, answers: McqAnswer[]) {
  const qs = Array.isArray(questions) ? (questions as StubMcqQuestion[]) : [];
  const answerByQuestion = new Map(answers.map((a) => [a.questionId, a.selectedIndex]));

  const domainTotals = new Map<string, { correct: number; total: number }>();
  const subSkillTotals = new Map<string, { correct: number; total: number }>();
  const results: McqQuestionResult[] = [];

  let correctCount = 0;
  let scoredCount = 0;

  for (const q of qs) {
    if (q.correctIndex === undefined) continue; // not scorable client-side (e.g. essay) — skip
    scoredCount += 1;
    const selectedIndex = answerByQuestion.get(q.id);
    const isCorrect = selectedIndex === q.correctIndex;
    if (isCorrect) correctCount += 1;
    results.push({ questionId: q.id, selectedIndex: selectedIndex ?? null, isCorrect, explanations: q.explanations });

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

  return { score: pct(correctCount, scoredCount), perDomainScore, perSubSkillScore, results };
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
  // Fallback for any assessment type this backend still can't score itself.
  // mcq/diagnostic (scoreMcqLike) and simulation (scoreSimulationPath) both
  // score themselves — nothing currently falls through to this.
  externalScore?: { score: number; perDomainScore?: Record<string, number>; perSubSkillScore?: Record<string, number> };
}) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: opts.attemptId },
    include: { assessment: true },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.userId !== opts.requestingUserId) throw new ApiError(403, "Not your attempt");
  if (attempt.status !== "in_progress") throw new ApiError(409, `Attempt already ${attempt.status}`);

  let result: {
    score: number;
    perDomainScore: Record<string, number>;
    perSubSkillScore: Record<string, number>;
    results?: McqQuestionResult[];
  };

  if (attempt.assessment.type === "mcq" || attempt.assessment.type === "diagnostic") {
    const answers = Array.isArray(opts.answers) ? (opts.answers as McqAnswer[]) : [];
    result = scoreMcqLike(attempt.assessment.questions, answers);
  } else if (attempt.assessment.type === "simulation") {
    const path = Array.isArray(opts.answers) ? (opts.answers as ScenarioPathStep[]) : [];
    const scored = scoreSimulationPath(attempt.assessment.scenario as unknown as ScenarioGraph, path);
    result = { score: scored.score, perDomainScore: scored.perDomainScore, perSubSkillScore: scored.perSubSkillScore };
  } else if (opts.externalScore) {
    result = {
      score: opts.externalScore.score,
      perDomainScore: opts.externalScore.perDomainScore ?? {},
      perSubSkillScore: opts.externalScore.perSubSkillScore ?? {},
    };
  } else {
    throw new ApiError(400, "This assessment type requires an externally computed score");
  }

  // Null (not applicable) rather than false when there's nothing meaningful to compare against —
  // never silently mark an attempt failed just because a threshold wasn't evaluable.
  const passed =
    attempt.assessment.passingScore === null || attempt.assessment.passingScore === undefined
      ? null
      : result.score >= attempt.assessment.passingScore;

  const updated = await prisma.attempt.update({
    where: { id: opts.attemptId },
    data: {
      answers: opts.answers as never,
      score: result.score,
      perDomainScore: result.perDomainScore as never,
      perSubSkillScore: result.perSubSkillScore as never,
      results: (result.results ?? null) as never,
      passed,
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

  let result: {
    score: number;
    perDomainScore: Record<string, number>;
    perSubSkillScore: Record<string, number>;
    results?: McqQuestionResult[];
  } = { score: 0, perDomainScore: {}, perSubSkillScore: {} };
  if (
    (attempt.assessment.type === "mcq" || attempt.assessment.type === "diagnostic") &&
    Array.isArray(attempt.answers)
  ) {
    result = scoreMcqLike(attempt.assessment.questions, attempt.answers as unknown as McqAnswer[]);
  }

  const passed =
    attempt.assessment.passingScore === null || attempt.assessment.passingScore === undefined
      ? null
      : result.score >= attempt.assessment.passingScore;

  const updated = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      score: result.score,
      perDomainScore: result.perDomainScore as never,
      perSubSkillScore: result.perSubSkillScore as never,
      results: (result.results ?? null) as never,
      passed,
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
