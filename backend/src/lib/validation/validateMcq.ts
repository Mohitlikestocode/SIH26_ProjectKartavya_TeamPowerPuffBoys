import type { McqDraft } from "@/types/mcq";

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "of", "to", "in", "on", "for", "and", "or",
  "with", "as", "by", "this", "that", "it", "be", "at", "from", "which", "not", "can", "may",
]);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

function tokenize(text: string): Set<string> {
  return new Set(normalize(text).split(" ").filter((w) => w.length > 3 && !STOPWORDS.has(w)));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) if (b.has(word)) intersection++;
  const union = a.size + b.size - intersection;
  return intersection / union;
}

const DUPLICATE_SIMILARITY_THRESHOLD = 0.8;

/**
 * Shared validation layer — the single path run after generation, after an admin edit, and after
 * manual question creation (see src/modules/questions/questions.service.ts). Returns a rejection
 * reason string, or null if the draft passes. This is Phase 1: heuristics over the generated
 * text, not a second LLM judge call.
 *
 * Alignment between `correctOption` and `explanations` is no longer checked with regex/sentiment
 * matching over free text — deriveCorrectOption.ts derives `correctOption` directly from the
 * per-option isTrueStatement values (model output or admin edit), so a swapped/self-inconsistent
 * answer key can't be produced in the first place. What's checked here is just a cheap structural
 * sanity check on that derivation (defense-in-depth, not the primary guarantee).
 *
 * `sourceChunkText` is null for manually-created questions (no source chunk) — the
 * implausible-distractor check, which needs source-passage vocabulary, is skipped in that case
 * rather than penalizing a manual question for having no chunk to compare against.
 */
export function validateMcq(draft: McqDraft, sourceChunkText: string | null): string | null {
  const { question, options, correctOption, explanations } = draft;

  if (options.some((o) => /^(true|false)$/i.test(o.trim()))) {
    return "Question uses a True/False style option, which is disallowed.";
  }

  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      const a = normalize(options[i]);
      const b = normalize(options[j]);
      if (a === b) return `Options ${i} and ${j} are duplicates.`;
      if (jaccardSimilarity(tokenize(options[i]), tokenize(options[j])) >= DUPLICATE_SIMILARITY_THRESHOLD) {
        return `Options ${i} and ${j} are near-duplicates.`;
      }
    }
  }

  // Implausible distractor: shares no vocabulary at all with the source passage, the question,
  // or any other option — i.e. it looks unrelated to the topic rather than a plausible near-miss.
  // Skipped entirely for manual questions (sourceChunkText === null): there's no passage to compare against.
  const chunkVocab = sourceChunkText === null ? null : tokenize(sourceChunkText);
  const questionVocab = tokenize(question);
  for (let i = 0; i < options.length; i++) {
    if (i === correctOption) continue;
    const optionVocab = tokenize(options[i]);
    if (optionVocab.size === 0) continue; // very short options (e.g. numbers) can't be judged this way
    const relatedToChunk = chunkVocab === null ? true : jaccardSimilarity(optionVocab, chunkVocab) > 0;
    const relatedToQuestion = jaccardSimilarity(optionVocab, questionVocab) > 0;
    const relatedToOtherOptions = options.some(
      (other, j) => j !== i && j !== correctOption && jaccardSimilarity(optionVocab, tokenize(other)) > 0
    );
    if (!relatedToChunk && !relatedToQuestion && !relatedToOtherOptions) {
      return `Option ${i} is an implausible distractor unrelated to the source passage.`;
    }
  }

  const correctCount = explanations.filter((e) => e.isCorrect).length;
  if (correctCount !== 1) {
    return `Expected exactly one option marked correct, found ${correctCount} — inconsistent answer key.`;
  }
  const correctEntry = explanations.find((e) => e.optionIndex === correctOption);
  if (!correctEntry || !correctEntry.isCorrect) {
    return "correctOption does not match the option marked correct in explanations — inconsistent answer key.";
  }

  return null;
}
