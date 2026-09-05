import { z } from "zod";
import { completeJson, createClient, DEFAULT_MODEL } from "./llm";
import type { Criterion } from "./schema";

// ---------------------------------------------------------------------------
// The grader.
//
// One criterion per call, and the model must QUOTE before it judges. That is
// the whole design: "is this a good answer?" is a judgment task models are
// unreliable at, while "does this text say X?" is an entailment task they are
// good at. Forcing a quote converts the first into the second.
//
// No quote means not met, unconditionally — so credit cannot be awarded on
// general impression, and the quote is the audit trail a trainer reads.
// ---------------------------------------------------------------------------

export const VerdictSchema = z.object({
  // Empty string rather than null: Groq strict mode wants every field present
  // and typed, and "" reads the same as "found nothing" at the call site.
  quote: z.string(),
  verdict: z.enum(["met", "not_met", "contradicted"]),
  reason: z.string(),
});

export type Verdict = z.infer<typeof VerdictSchema>;

export interface GradedCriterion extends Verdict {
  key: string;
  /** True when the model cited words that do not appear in the answer. The verdict is discarded. */
  fabricatedQuote: boolean;
}

const SYSTEM = `You are marking one criterion of one written answer, for a competency diagnostic in India's official statistics system. You are not scoring the answer overall and you are not judging its style.

Work in two steps, in this order:

STEP 1 — QUOTE. Find the words in the candidate's answer that address the criterion's claim. Copy them EXACTLY as written, character for character, into "quote". Do not paraphrase, correct or tidy them. If the answer contains no words that address the claim, put an empty string in "quote".

STEP 2 — JUDGE. Considering only the words you quoted, decide:
  "met"          — the quoted words assert the claim.
  "contradicted" — the quoted words assert something incompatible with the claim.
  "not_met"      — the quoted words touch the topic but do not assert the claim.
If "quote" is empty, the verdict is "not_met".

Before deciding "met", state to yourself the strongest reason the claim is NOT met, and only choose "met" if that reason fails. Markers drift lenient; this is the correction.

Length is not evidence. A long, confident, fluent answer that never asserts the claim has not met it. A single blunt sentence that does assert it has.

"reason" is one sentence explaining the verdict, addressed to the candidate.`;

function normalise(text: string): string {
  return text.toLowerCase().replace(/[\s‐-―-]+/g, " ").replace(/[^\w\s]/g, "").trim();
}

/**
 * A quote the answer does not contain is a fabricated citation. This is the one
 * check that catches it, and it is a substring comparison — no judgment, no
 * second model call.
 */
function quoteIsReal(quote: string, answer: string): boolean {
  if (!quote.trim()) return true; // absence is honest
  return normalise(answer).includes(normalise(quote));
}

export async function gradeCriterion(opts: {
  scenario: string;
  question: string;
  answer: string;
  criterion: Criterion;
  model?: string;
}): Promise<GradedCriterion> {
  const client = createClient();

  const raw = await completeJson({
    client,
    model: opts.model ?? DEFAULT_MODEL,
    system: SYSTEM,
    user: [
      `SCENARIO:\n${opts.scenario}`,
      `QUESTION:\n${opts.question}`,
      `CRITERION:\n${opts.criterion.claim}`,
      `An answer that MEETS this criterion looks like:\n${opts.criterion.met_example}`,
      `An answer that does NOT meet it looks like:\n${opts.criterion.not_met_example}`,
      `CANDIDATE ANSWER:\n${opts.answer}`,
    ].join("\n\n---\n\n"),
    schema: VerdictSchema,
    schemaName: "criterion_verdict",
    maxTokens: 1000,
  });

  const fabricated = !quoteIsReal(raw.quote, opts.answer);

  // Two rules applied in code, not left to the model: a quote it invented is
  // worth nothing, and no quote is not met however confident the reasoning.
  const verdict: Verdict["verdict"] =
    fabricated || !raw.quote.trim() ? "not_met" : raw.verdict;

  return { key: opts.criterion.key, ...raw, verdict, fabricatedQuote: fabricated };
}
