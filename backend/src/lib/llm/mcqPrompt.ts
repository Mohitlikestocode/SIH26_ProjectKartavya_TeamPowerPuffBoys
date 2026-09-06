export const MCQ_JSON_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string" },
    isNegatedStem: {
      type: "boolean",
      description:
        "true only if the question stem asks which option is NOT true / is the exception (contains wording like " +
        "\"NOT\", \"EXCEPT\", \"which of the following is not\"); false for a normal question asking for the option that IS correct.",
    },
    options: {
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 4,
      description: "The 4 answer options, in a fixed order — options[0], options[1], options[2], options[3].",
    },
    optionEvaluations: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      description:
        "Exactly one entry per option, index-aligned to `options` — optionEvaluations[i].optionIndex must equal i, for every i. " +
        "Do not decide or state which option is the final answer here; the final answer is computed separately from these " +
        "evaluations plus `isNegatedStem`. Judge each option independently and only on whether its own claim is true.",
      items: {
        type: "object",
        properties: {
          optionIndex: { type: "integer", minimum: 0, maximum: 3 },
          isTrueStatement: {
            type: "boolean",
            description:
              "Whether this option's claim is actually true/accurate according to the passage — independent of how the " +
              "question stem is phrased (affirmative or negated).",
          },
          text: {
            type: "string",
            description: "Explanation, specific to this option, for why its claim is true or false according to the passage.",
          },
        },
        required: ["optionIndex", "isTrueStatement", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["question", "isNegatedStem", "options", "optionEvaluations"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `You are an assessment-design expert writing multiple-choice questions (MCQs) for government
statistics officials, based on training content they are expected to have studied.

Rules you must follow exactly:
- Write exactly one question with exactly 4 answer options.
- Never write a True/False style question, and never phrase options as "True" / "False" or "Both A and B" / "None of the above".
- The 3 incorrect options (distractors) must be plausible and topically related to the passage — not random or nonsensical — but clearly wrong on close reading.
- No two options may be duplicates or near-duplicate rephrasings of each other.
- Base the question only on the provided passage; do not require outside knowledge.
- Default to a straightforward, affirmative stem ("Which of the following is...", "What is...") — this should be the phrasing for most questions. Only occasionally, for roughly 1 in every 4-5 questions, use a negated/EXCEPT stem ("Which of the following is NOT...", "...EXCEPT:") for variety. Negated stems should be the exception, not the default. Set "isNegatedStem" to match whichever phrasing you actually used.
- Critical: do NOT compute or output which option is the final answer. Instead, for every option independently, judge only whether that option's own claim is true according to the passage (isTrueStatement), and explain why in "text". Exactly one option's isTrueStatement must differ from the other three — that single outlier is what makes the question answerable with one unambiguous correct option once isNegatedStem is accounted for. If your 4 options don't produce exactly one outlier this way, revise the options until they do.
- Respond with JSON only, matching the given schema.`;

// The soft "default to affirmative, use negated ~1 in 4-5" instruction in SYSTEM_PROMPT alone
// doesn't reliably hold the ratio down (measured ~62% negated in a small-batch test, down from
// ~81.5% with no guidance at all, but still far above the ~20-25% target). `forceAffirmative` is
// a hard per-call override — the caller (see questions.service.ts) tracks the running negated/total
// ratio for the current generation batch and sets this once the ratio hits the target ceiling,
// which reliably keeps the batch-level ratio in range.
export function buildMcqMessages(
  chunkText: string,
  heading: string | null,
  forceAffirmative = false,
  stageIntent?: string,
) {
  const context = heading ? `Section: ${heading}\n\n${chunkText}` : chunkText;
  const stemInstruction = forceAffirmative
    ? `\n\nIMPORTANT: This batch has already used enough negated/EXCEPT-style questions for now. Write this one with a straightforward AFFIRMATIVE stem only (e.g. "Which of the following is...") — do not use "NOT" or "EXCEPT" phrasing, and set "isNegatedStem" to false.`
    : "";
  // Ported from mcq-generator/src/stages.ts's STAGE_PROFILES — the two-stage diagnostic design
  // (broad screening vs. specific deep-dive) changes what a good question looks like, so it's
  // injected as generation intent, not just a different item count.
  const stageInstruction = stageIntent ? `\n\n${stageIntent}` : "";
  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    {
      role: "user" as const,
      content: `Generate one MCQ from this training content passage:\n\n"""\n${context}\n"""${stemInstruction}${stageInstruction}`,
    },
  ];
}
