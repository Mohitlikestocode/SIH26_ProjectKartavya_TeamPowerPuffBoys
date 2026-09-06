import type { Question } from "@prisma/client";

// The one confirmed contract for Assessment.questions[] (see ../../../MCQ_CONTRACT_PROPOSAL.md and
// attempts.service.ts's StubMcqQuestion/scoreMcqLike): {id, stem, options, correctIndex, domainTag,
// subSkillTag, explanations?}. This is the adapter both PR authors flagged as missing between that
// contract and the real Question bank row shape (question/options/correctOption/domain/skill).
// `explanations` is carried through opaquely (same reasoning as attempts.service.ts's
// StubMcqQuestion) so it survives redactQuestionForDelivery pre-submission and comes back out in
// McqQuestionResult post-submission, exactly like every other MCQ path.
export interface AssessmentQuestion {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  domainTag: string;
  subSkillTag: string;
  explanations: unknown;
}

export function toAssessmentQuestions(questions: Question[]): AssessmentQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    stem: q.question,
    options: q.options,
    correctIndex: q.correctOption,
    domainTag: q.domain,
    subSkillTag: q.skill,
    explanations: q.explanations,
  }));
}
