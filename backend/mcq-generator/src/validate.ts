import type { FreeTextItem, Question } from "./schema";

// Structured outputs already guarantee the *shape* of every item. These checks
// cover the rules a JSON schema cannot express — the ones that decide whether
// an item is actually usable in front of a learner.

export interface ValidationReport {
  kept: Question[];
  /** Item-level failures. The item is dropped. */
  rejected: { question: Question; reason: string }[];
  /** Set-level observations. Nothing is dropped; a reviewing trainer should see these. */
  warnings: string[];
}

const KEYS = ["A", "B", "C", "D"] as const;

function sentenceCount(text: string): number {
  return text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length;
}

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function itemError(q: Question): string | undefined {
  const keys = q.options.map((o) => o.key);

  if (q.options.length !== 4) return `has ${q.options.length} options, expected exactly 4`;
  if (new Set(keys).size !== 4) return "has duplicate option keys";
  if (!KEYS.every((k) => keys.includes(k))) return "options are not keyed A/B/C/D";
  if (!keys.includes(q.correct_option)) return `correct_option "${q.correct_option}" is not among the options`;
  if (q.options.some((o) => !o.text.trim())) return "has an empty option";

  const distinctOptions = new Set(q.options.map((o) => normalise(o.text)));
  if (distinctOptions.size !== 4) return "has two options with the same text";

  const missingReasoning = KEYS.filter((k) => !q.explanation.distractor_reasoning[k]?.trim());
  if (missingReasoning.length > 0) {
    return `explanation is missing reasoning for option ${missingReasoning.join(", ")}`;
  }

  if (!q.scenario.trim()) return "has an empty scenario — a case-based item needs one";
  if (!q.source_grounding.trim()) return "has no source_grounding, so a trainer cannot check it against the document";

  return undefined;
}

export function validate(questions: Question[], requestedDomain: string): ValidationReport {
  const kept: Question[] = [];
  const rejected: ValidationReport["rejected"] = [];
  const warnings: string[] = [];

  const seenIds = new Set<string>();
  const seenQuestions = new Set<string>();

  for (const q of questions) {
    const error = itemError(q);
    if (error) {
      rejected.push({ question: q, reason: error });
      continue;
    }
    if (seenIds.has(q.id)) {
      rejected.push({ question: q, reason: `duplicate id "${q.id}"` });
      continue;
    }
    const fingerprint = normalise(q.question);
    if (seenQuestions.has(fingerprint)) {
      rejected.push({ question: q, reason: "duplicates an earlier question" });
      continue;
    }

    seenIds.add(q.id);
    seenQuestions.add(fingerprint);
    kept.push(q);

    const sentences = sentenceCount(q.scenario);
    if (sentences < 2) {
      warnings.push(`${q.id}: scenario is ${sentences} sentence(s) — the brief asks for 2-4, so it may be too thin to require judgement.`);
    } else if (sentences > 5) {
      warnings.push(`${q.id}: scenario runs to ${sentences} sentences — long enough that the item starts testing reading speed.`);
    }
    if (q.domain.toLowerCase() !== requestedDomain.toLowerCase()) {
      warnings.push(`${q.id}: tagged "${q.domain}" but "${requestedDomain}" was requested.`);
    }
  }

  if (kept.length >= 4) {
    const tally = new Map<string, number>();
    for (const q of kept) tally.set(q.correct_option, (tally.get(q.correct_option) ?? 0) + 1);

    const [topKey, topCount] = [...tally.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topCount / kept.length > 0.5) {
      warnings.push(
        `Answer key is skewed: ${topCount} of ${kept.length} items are "${topKey}". Shuffle option order before publishing, or a learner can score by picking one letter.`,
      );
    }
  }

  return { kept, rejected, warnings };
}

// ---------------------------------------------------------------------------
// Written-answer items.
//
// The rubric is the thing being checked here, not the prose. A weak scenario
// produces a weak item; a weak rubric produces wrong marks that look right, so
// it gets the stricter treatment.
// ---------------------------------------------------------------------------

export interface FreeTextValidationReport {
  kept: FreeTextItem[];
  rejected: { item: FreeTextItem; reason: string }[];
  warnings: string[];
}

const MIN_CRITERIA = 3;
const MAX_CRITERIA = 5;

// A claim short enough to be a keyword is short enough to be gamed. This is a
// heuristic, not a proof — it flags for review rather than rejecting.
const SHORT_CLAIM_CHARS = 45;
const KEYWORD_SHAPED = /^\s*(mentions?|names?|refers?\s+to|uses?\s+the\s+term|includes?\s+the\s+word)\b/i;

function freeTextItemError(item: FreeTextItem): string | undefined {
  if (!item.scenario.trim()) return "has an empty scenario";
  if (!item.question.trim()) return "has an empty question";
  if (!item.reference_answer.trim()) {
    return "has no reference_answer, so there is nothing to show the learner and nothing to grade against";
  }

  if (item.criteria.length < MIN_CRITERIA) {
    return `has ${item.criteria.length} criteria, fewer than the ${MIN_CRITERIA} needed to localise a misconception`;
  }
  if (item.criteria.length > MAX_CRITERIA) {
    return `has ${item.criteria.length} criteria, more than the ${MAX_CRITERIA} that can be marked reliably`;
  }

  const keys = item.criteria.map((c) => c.key);
  if (new Set(keys).size !== keys.length) return "has duplicate criterion keys";

  for (const c of item.criteria) {
    if (!c.claim.trim()) return `criterion ${c.key} has an empty claim`;
    if (!c.met_example.trim()) return `criterion ${c.key} has no met_example`;
    if (!c.not_met_example.trim()) return `criterion ${c.key} has no not_met_example`;
    if (normalise(c.met_example) === normalise(c.not_met_example)) {
      return `criterion ${c.key} has identical met and not_met examples, so it cannot discriminate`;
    }
  }

  const claims = item.criteria.map((c) => normalise(c.claim));
  if (new Set(claims).size !== claims.length) return "has two criteria with the same claim";

  return undefined;
}

export function validateFreeText(items: FreeTextItem[], requestedDomain: string): FreeTextValidationReport {
  const kept: FreeTextItem[] = [];
  const rejected: FreeTextValidationReport["rejected"] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  for (const item of items) {
    const error = freeTextItemError(item);
    if (error) {
      rejected.push({ item, reason: error });
      continue;
    }
    if (seenIds.has(item.id)) {
      rejected.push({ item, reason: `duplicate id "${item.id}"` });
      continue;
    }

    seenIds.add(item.id);
    kept.push(item);

    // Gameability. A criterion satisfied by vocabulary rather than reasoning
    // marks a bluffer correct, which is the failure this whole format exists
    // to avoid — so it is surfaced for human review rather than dropped.
    for (const c of item.criteria) {
      if (KEYWORD_SHAPED.test(c.claim)) {
        warnings.push(
          `${item.id}/${c.key}: claim is phrased as "mentions X" — satisfiable by using the words without understanding them. Reword as a claim the answer must make.`,
        );
      } else if (c.claim.trim().length < SHORT_CLAIM_CHARS) {
        warnings.push(
          `${item.id}/${c.key}: claim is only ${c.claim.trim().length} characters — likely too thin to require reasoning. Check it cannot be satisfied by vocabulary alone.`,
        );
      }
      if (!c.source_grounding.trim()) {
        warnings.push(`${item.id}/${c.key}: no source_grounding, so a trainer cannot check the claim against the document.`);
      }
    }

    const sentences = sentenceCount(item.scenario);
    if (sentences < 2) {
      warnings.push(`${item.id}: scenario is ${sentences} sentence(s) — likely too thin to require judgement.`);
    }
    if (item.domain.toLowerCase() !== requestedDomain.toLowerCase()) {
      warnings.push(`${item.id}: tagged "${item.domain}" but "${requestedDomain}" was requested.`);
    }
  }

  return { kept, rejected, warnings };
}
