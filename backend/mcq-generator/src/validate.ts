import type { Question } from "./schema";

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
