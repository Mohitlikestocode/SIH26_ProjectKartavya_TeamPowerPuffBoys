// Attempts business logic — delivery (fetching in-progress state without revealing answers),
// answer submission, time-limit enforcement, and final scoring.
import { prisma } from "@/config/db";
import { ApiError } from "@/middleware/errorHandler";
import { scoreAttempt } from "@/lib/assessment/scoreAttempt";

async function loadAttemptWithAssessment(id: string, requestingUserId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      assessment: { include: { assessmentQuestions: { orderBy: { sequence: "asc" }, include: { question: true } } } },
      answers: true,
    },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found.");
  if (attempt.userId !== requestingUserId) {
    throw new ApiError(403, "This attempt does not belong to you.");
  }
  return attempt;
}

type AttemptWithAssessment = Awaited<ReturnType<typeof loadAttemptWithAssessment>>;

function sanitizeQuestionForDelivery(question: AttemptWithAssessment["assessment"]["assessmentQuestions"][number]["question"], selectedOptionIndex?: number) {
  return {
    id: question.id,
    question: question.question,
    options: question.options,
    isNegatedStem: question.isNegatedStem,
    domain: question.domain,
    skill: question.skill,
    selectedOptionIndex: selectedOptionIndex ?? null,
  };
}

function revealQuestionWithExplanations(
  question: AttemptWithAssessment["assessment"]["assessmentQuestions"][number]["question"],
  selectedOptionIndex: number | undefined,
  isCorrect: boolean
) {
  return {
    id: question.id,
    question: question.question,
    options: question.options,
    isNegatedStem: question.isNegatedStem,
    domain: question.domain,
    skill: question.skill,
    correctOption: question.correctOption,
    selectedOptionIndex: selectedOptionIndex ?? null,
    isCorrect,
    explanations: question.explanations,
  };
}

// Scores an in_progress attempt and writes the final state — shared by an explicit /submit call
// and by auto-expiry, so a time-limit cutoff produces exactly the same scored/explained result a
// manual submit would, rather than leaving the learner with a "finalized" attempt that has no score.
async function finalizeAttempt(attempt: AttemptWithAssessment, finalStatus: "submitted" | "expired") {
  const questions = attempt.assessment.assessmentQuestions.map((aq) => aq.question);
  const answersByQuestionId = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionIndex]));
  const { score, passed, scoredAnswers, breakdown } = scoreAttempt(
    questions,
    answersByQuestionId,
    attempt.assessment.passingThreshold
  );

  await prisma.$transaction([
    prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: finalStatus, completedAt: new Date(), score, passed },
    }),
    ...scoredAnswers.map((sa) =>
      prisma.attemptAnswer.updateMany({
        where: { attemptId: attempt.id, questionId: sa.questionId },
        data: { isCorrect: sa.isCorrect },
      })
    ),
  ]);

  const isCorrectByQuestionId = new Map(scoredAnswers.map((sa) => [sa.questionId, sa.isCorrect]));
  const revealedQuestions = questions.map((q) =>
    revealQuestionWithExplanations(q, answersByQuestionId.get(q.id), isCorrectByQuestionId.get(q.id) ?? false)
  );

  return {
    id: attempt.id,
    assessmentId: attempt.assessmentId,
    status: finalStatus,
    score,
    passed,
    breakdown,
    questions: revealedQuestions,
  };
}

// Time-limit enforcement (graded/final only — assessments without a timeLimitMinutes are never
// auto-expired). Called at the top of every attempt-mutating/reading endpoint so status is never
// stale by more than one request. When time is up, the attempt is scored exactly like an explicit
// submit (see finalizeAttempt) rather than just flipping status with no score.
async function expireIfTimeUp(attempt: AttemptWithAssessment, requestingUserId: string): Promise<AttemptWithAssessment> {
  if (attempt.status !== "in_progress" || attempt.assessment.timeLimitMinutes === null) return attempt;

  const deadline = new Date(attempt.startedAt.getTime() + attempt.assessment.timeLimitMinutes * 60_000);
  if (new Date() <= deadline) return attempt;

  await finalizeAttempt(attempt, "expired");
  return loadAttemptWithAssessment(attempt.id, requestingUserId);
}

export async function getAttemptState(id: string, requestingUserId: string) {
  const attempt = await expireIfTimeUp(await loadAttemptWithAssessment(id, requestingUserId), requestingUserId);
  const answersByQuestionId = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionIndex]));

  const isFinalized = attempt.status !== "in_progress";
  const questions = attempt.assessment.assessmentQuestions.map((aq) => {
    const selectedOptionIndex = answersByQuestionId.get(aq.questionId);
    if (isFinalized) {
      const answer = attempt.answers.find((a) => a.questionId === aq.questionId);
      return revealQuestionWithExplanations(aq.question, selectedOptionIndex, answer?.isCorrect ?? false);
    }
    return sanitizeQuestionForDelivery(aq.question, selectedOptionIndex);
  });

  const timeRemainingSeconds =
    attempt.status === "in_progress" && attempt.assessment.timeLimitMinutes !== null
      ? Math.max(
          0,
          Math.round(
            (attempt.startedAt.getTime() + attempt.assessment.timeLimitMinutes * 60_000 - Date.now()) / 1000
          )
        )
      : null;

  return {
    id: attempt.id,
    assessmentId: attempt.assessmentId,
    userId: attempt.userId,
    status: attempt.status,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    score: attempt.score,
    passed: attempt.passed,
    violationCount: attempt.violationCount,
    timeRemainingSeconds,
    assessment: {
      id: attempt.assessment.id,
      title: attempt.assessment.title,
      purpose: attempt.assessment.purpose,
      timeLimitMinutes: attempt.assessment.timeLimitMinutes,
      passingThreshold: attempt.assessment.passingThreshold,
    },
    questions,
  };
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionIndex: number,
  requestingUserId: string
) {
  const attempt = await expireIfTimeUp(await loadAttemptWithAssessment(attemptId, requestingUserId), requestingUserId);

  if (attempt.status !== "in_progress") {
    throw new ApiError(409, `Cannot submit an answer — attempt status is "${attempt.status}".`);
  }

  const belongsToAssessment = attempt.assessment.assessmentQuestions.some((aq) => aq.questionId === questionId);
  if (!belongsToAssessment) {
    throw new ApiError(400, "That question is not part of this attempt's assessment.");
  }

  return prisma.attemptAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, selectedOptionIndex },
    update: { selectedOptionIndex, answeredAt: new Date() },
  });
}

export async function submitAttempt(attemptId: string, requestingUserId: string) {
  const attempt = await expireIfTimeUp(await loadAttemptWithAssessment(attemptId, requestingUserId), requestingUserId);

  if (attempt.status !== "in_progress") {
    throw new ApiError(409, `Attempt is already finalized (status: "${attempt.status}").`);
  }

  return finalizeAttempt(attempt, "submitted");
}
