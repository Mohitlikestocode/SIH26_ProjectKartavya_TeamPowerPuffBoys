import type { McqDraft, RawChunk } from "@/types/mcq";
import { chatCompletion } from "./sarvamClient";
import { buildMcqMessages, MCQ_JSON_SCHEMA } from "./mcqPrompt";
import { deriveCorrectOption } from "@/lib/mcq/deriveCorrectOption";

export type GenerationOutcome = { ok: true; draft: McqDraft; raw: string } | { ok: false; reason: string; raw: string };

interface RawOptionEvaluation {
  optionIndex: unknown;
  isTrueStatement: unknown;
  text: unknown;
}

interface RawModelOutput {
  question: unknown;
  isNegatedStem: unknown;
  options: unknown;
  optionEvaluations: unknown;
}

// Parses and structurally normalizes the model's JSON output into a McqDraft. The model never
// supplies `correctOption` directly — see deriveCorrectOption.ts, the single source of truth for
// turning per-option isTrueStatement values into a final answer key (shared with the admin
// edit/manual-create paths so the same rule applies everywhere).
// Never throws — failures come back as a result so the caller can log-and-retry.
export async function generateMcqDraft(chunk: RawChunk, forceAffirmative = false): Promise<GenerationOutcome> {
  let raw: string;
  try {
    raw = await chatCompletion({
      messages: buildMcqMessages(chunk.text, chunk.heading, forceAffirmative),
      responseFormat: { type: "json_schema", json_schema: { name: "mcq", schema: MCQ_JSON_SCHEMA, strict: true } },
    });
  } catch (err) {
    return { ok: false, reason: `LLM call failed: ${(err as Error).message}`, raw: "" };
  }

  let parsed: RawModelOutput;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: "Model output was not valid JSON.", raw };
  }

  if (
    typeof parsed.question !== "string" ||
    typeof parsed.isNegatedStem !== "boolean" ||
    !Array.isArray(parsed.options) ||
    parsed.options.length !== 4 ||
    !parsed.options.every((o) => typeof o === "string") ||
    !Array.isArray(parsed.optionEvaluations) ||
    parsed.optionEvaluations.length !== 4
  ) {
    return { ok: false, reason: "Model output did not match the required MCQ JSON structure.", raw };
  }

  const rawEvaluations = parsed.optionEvaluations as RawOptionEvaluation[];
  const shapeIsValid = rawEvaluations.every(
    (e, i) => e.optionIndex === i && typeof e.isTrueStatement === "boolean" && typeof e.text === "string"
  );
  if (!shapeIsValid) {
    return {
      ok: false,
      reason: "optionEvaluations were not index-aligned to options (each optionIndex must equal its array position).",
      raw,
    };
  }

  const evaluations = rawEvaluations as { optionIndex: number; isTrueStatement: boolean; text: string }[];
  const isNegatedStem = parsed.isNegatedStem as boolean;

  const derived = deriveCorrectOption(evaluations, isNegatedStem);
  if (!derived.ok) {
    return { ok: false, reason: derived.reason, raw };
  }

  const draft: McqDraft = {
    question: parsed.question as string,
    options: parsed.options as [string, string, string, string],
    isNegatedStem,
    correctOption: derived.correctOption,
    explanations: derived.explanations,
  };

  return { ok: true, draft, raw };
}
