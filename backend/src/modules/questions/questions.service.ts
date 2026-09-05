// Questions business logic — MCQ generation orchestration, admin review/edit, manual creation,
// validation, and storage.
import { prisma } from "@/config/db";
import { ApiError } from "@/middleware/errorHandler";
import { generateMcqDraft } from "@/lib/llm/generateMcq";
import { deriveCorrectOption } from "@/lib/mcq/deriveCorrectOption";
import { validateMcq } from "@/lib/validation/validateMcq";
import type { McqDraft, OptionEvaluation, OptionExplanation } from "@/types/mcq";
import type { Chunk, Prisma, Question, QuestionStatus } from "@prisma/client";

const MAX_ATTEMPTS_PER_CHUNK = 3;

async function generateForChunk(chunk: Chunk) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_CHUNK; attempt++) {
    const outcome = await generateMcqDraft({ sequence: chunk.sequence, heading: chunk.heading, text: chunk.text });

    if (!outcome.ok) {
      await prisma.generationRejection.create({
        data: { chunkId: chunk.id, reason: outcome.reason, rawOutput: outcome.raw },
      });
      continue;
    }

    const rejectionReason = validateMcq(outcome.draft, chunk.text);
    if (rejectionReason) {
      await prisma.generationRejection.create({
        data: { chunkId: chunk.id, reason: rejectionReason, rawOutput: outcome.raw },
      });
      continue;
    }

    return prisma.question.create({
      data: {
        sourceDocumentId: chunk.documentId,
        chunkId: chunk.id,
        chunkText: chunk.text,
        question: outcome.draft.question,
        options: outcome.draft.options,
        isNegatedStem: outcome.draft.isNegatedStem,
        correctOption: outcome.draft.correctOption,
        explanations: outcome.draft.explanations as unknown as Prisma.InputJsonValue,
        // domain/skill stay at their "TBD" default — a later competency-ontology module fills these in.
      },
    });
  }
  return null;
}

export async function generateQuestionsForDocument(documentId: string) {
  const document = await prisma.sourceDocument.findUnique({
    where: { id: documentId },
    include: { chunks: { orderBy: { sequence: "asc" } } },
  });
  if (!document) throw new ApiError(404, "Document not found.");
  if (document.status !== "processed") {
    throw new ApiError(409, `Document is not ready for generation (status: ${document.status}).`);
  }

  const results = { generated: 0, failedChunkIds: [] as string[] };
  for (const chunk of document.chunks) {
    const question = await generateForChunk(chunk);
    if (question) results.generated++;
    else results.failedChunkIds.push(chunk.id);
  }
  return results;
}

export interface ListQuestionsFilters {
  documentId?: string;
  chunkId?: string;
  status?: QuestionStatus;
  isNegatedStem?: boolean;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function listQuestions(filters: ListQuestionsFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));

  const where: Prisma.QuestionWhereInput = {
    sourceDocumentId: filters.documentId,
    chunkId: filters.chunkId,
    status: filters.status,
    isNegatedStem: filters.isNegatedStem,
  };

  const [data, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.question.count({ where }),
  ]);

  return { data, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getQuestion(id: string) {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) throw new ApiError(404, "Question not found.");
  return question;
}

// A stored Question's `explanations` was written by deriveCorrectOption, so it always has
// isTrueStatement — except rows created before that field existed on the wire. For those legacy
// rows we fall back to isCorrect as a best-effort stand-in (exact for non-negated stems; may be
// wrong for negated ones, since isCorrect there is the inverse of isTrueStatement). Any edit to a
// legacy row re-derives and re-stores the correct shape going forward.
function explanationsToEvaluations(explanations: OptionExplanation[]): OptionEvaluation[] {
  return explanations
    .slice()
    .sort((a, b) => a.optionIndex - b.optionIndex)
    .map((e) => ({
      optionIndex: e.optionIndex,
      isTrueStatement: e.isTrueStatement ?? e.isCorrect,
      text: e.text,
    }));
}

export interface EditQuestionInput {
  question?: string;
  options?: [string, string, string, string];
  isNegatedStem?: boolean;
  optionEvaluations?: OptionEvaluation[]; // full replace, all 4 entries
  domain?: string;
  skill?: string;
}

function serialize(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}

// Recursively sorts object keys so two structurally-identical values (e.g. an explanations array
// round-tripped through Prisma's Json column, which doesn't preserve key insertion order) compare
// equal — otherwise every edit would spuriously log an "explanations changed" entry even when only
// an unrelated field (like `skill`) actually changed.
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalize((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));
}

export async function editQuestion(id: string, input: EditQuestionInput, editedBy: string): Promise<Question> {
  const existing = await getQuestion(id);

  const newQuestionText = input.question ?? existing.question;
  const newOptions = input.options ?? (existing.options as [string, string, string, string]);
  const newIsNegatedStem = input.isNegatedStem ?? existing.isNegatedStem;
  const evaluations = input.optionEvaluations ?? explanationsToEvaluations(existing.explanations as unknown as OptionExplanation[]);

  const derived = deriveCorrectOption(evaluations, newIsNegatedStem);
  if (!derived.ok) {
    throw new ApiError(422, `Edit rejected — answer key would become inconsistent: ${derived.reason}`);
  }

  const draft: McqDraft = {
    question: newQuestionText,
    options: newOptions,
    isNegatedStem: newIsNegatedStem,
    correctOption: derived.correctOption,
    explanations: derived.explanations,
  };

  const rejectionReason = validateMcq(draft, existing.chunkText);
  if (rejectionReason) {
    throw new ApiError(422, `Edit rejected by validation: ${rejectionReason}`);
  }

  const newDomain = input.domain ?? existing.domain;
  const newSkill = input.skill ?? existing.skill;

  const editLogs: Prisma.QuestionEditLogCreateManyInput[] = [];
  const trackChange = (fieldChanged: string, oldValue: unknown, newValue: unknown) => {
    if (!valuesEqual(oldValue, newValue)) {
      editLogs.push({ questionId: id, editedBy, fieldChanged, oldValue: serialize(oldValue), newValue: serialize(newValue) });
    }
  };

  trackChange("question", existing.question, draft.question);
  trackChange("options", existing.options, draft.options);
  trackChange("isNegatedStem", existing.isNegatedStem, draft.isNegatedStem);
  trackChange("correctOption", existing.correctOption, draft.correctOption);
  trackChange("explanations", existing.explanations, draft.explanations);
  trackChange("domain", existing.domain, newDomain);
  trackChange("skill", existing.skill, newSkill);

  const [updated] = await prisma.$transaction([
    prisma.question.update({
      where: { id },
      data: {
        question: draft.question,
        options: draft.options,
        isNegatedStem: draft.isNegatedStem,
        correctOption: draft.correctOption,
        explanations: draft.explanations as unknown as Prisma.InputJsonValue,
        domain: newDomain,
        skill: newSkill,
      },
    }),
    ...editLogs.map((log) => prisma.questionEditLog.create({ data: log })),
  ]);

  return updated;
}

export interface CreateManualQuestionInput {
  question: string;
  options: [string, string, string, string];
  isNegatedStem: boolean;
  optionEvaluations: OptionEvaluation[]; // all 4 entries
  domain?: string;
  skill?: string;
  approve?: boolean;
}

export async function createManualQuestion(input: CreateManualQuestionInput, createdBy: string): Promise<Question> {
  const derived = deriveCorrectOption(input.optionEvaluations, input.isNegatedStem);
  if (!derived.ok) {
    throw new ApiError(422, `Question rejected — inconsistent answer key: ${derived.reason}`);
  }

  const draft: McqDraft = {
    question: input.question,
    options: input.options,
    isNegatedStem: input.isNegatedStem,
    correctOption: derived.correctOption,
    explanations: derived.explanations,
  };

  // No source chunk for a manual question — the implausible-distractor check is skipped.
  const rejectionReason = validateMcq(draft, null);
  if (rejectionReason) {
    throw new ApiError(422, `Question rejected by validation: ${rejectionReason}`);
  }

  const status: QuestionStatus = input.approve ? "approved" : "draft";

  const created = await prisma.question.create({
    data: {
      sourceDocumentId: null,
      chunkId: null,
      chunkText: null,
      question: draft.question,
      options: draft.options,
      isNegatedStem: draft.isNegatedStem,
      correctOption: draft.correctOption,
      explanations: draft.explanations as unknown as Prisma.InputJsonValue,
      domain: input.domain ?? "TBD",
      skill: input.skill ?? "TBD",
      status,
    },
  });

  await prisma.questionEditLog.create({
    data: {
      questionId: created.id,
      editedBy: createdBy,
      fieldChanged: "created",
      oldValue: null,
      newValue: `Manually created (status: ${status})`,
    },
  });

  return created;
}

export async function setQuestionStatus(
  id: string,
  status: Extract<QuestionStatus, "approved" | "rejected">,
  editedBy: string,
  reason?: string
): Promise<Question> {
  const existing = await getQuestion(id);

  const [updated] = await prisma.$transaction([
    prisma.question.update({ where: { id }, data: { status } }),
    prisma.questionEditLog.create({
      data: {
        questionId: id,
        editedBy,
        fieldChanged: "status",
        oldValue: existing.status,
        newValue: reason ? `${status} (reason: ${reason})` : status,
      },
    }),
  ]);

  return updated;
}
