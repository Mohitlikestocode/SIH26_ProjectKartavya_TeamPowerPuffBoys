import type { OptionEvaluation, OptionExplanation } from "@/types/mcq";

export type DeriveResult = { ok: true; correctOption: number; explanations: OptionExplanation[] } | { ok: false; reason: string };

// Single source of truth for turning per-option isTrueStatement evaluations into a final answer
// key. Used at generation time, and re-run whenever an admin edits optionEvaluations/isNegatedStem,
// so the model and the admin are held to the exact same structural rule: for a plain stem the
// correct option is the one TRUE statement; for a negated ("NOT"/"EXCEPT") stem it's the one FALSE
// statement. Never let a caller set correctOption directly — always derive it here.
export function deriveCorrectOption(evaluations: OptionEvaluation[], isNegatedStem: boolean): DeriveResult {
  if (evaluations.length !== 4) {
    return { ok: false, reason: `Expected exactly 4 option evaluations, got ${evaluations.length}.` };
  }
  const shapeIsValid = evaluations.every(
    (e, i) => e.optionIndex === i && typeof e.isTrueStatement === "boolean" && typeof e.text === "string"
  );
  if (!shapeIsValid) {
    return { ok: false, reason: "optionEvaluations were not index-aligned (each optionIndex must equal its array position)." };
  }

  const winningValue = !isNegatedStem;
  const matches = evaluations.filter((e) => e.isTrueStatement === winningValue).map((e) => e.optionIndex);

  if (matches.length !== 1) {
    return {
      ok: false,
      reason:
        `Expected exactly one option with isTrueStatement=${winningValue} (isNegatedStem=${isNegatedStem}), ` +
        `got ${matches.length} — ambiguous or malformed correct answer.`,
    };
  }

  const correctOption = matches[0];
  const explanations: OptionExplanation[] = evaluations.map((e) => ({
    optionIndex: e.optionIndex,
    isTrueStatement: e.isTrueStatement,
    isCorrect: e.optionIndex === correctOption,
    text: e.text,
  }));

  return { ok: true, correctOption, explanations };
}
