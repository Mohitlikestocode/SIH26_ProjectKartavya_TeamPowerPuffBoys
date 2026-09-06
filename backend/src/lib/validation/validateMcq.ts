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

// Phrases that only make sense as the model's own scratch-reasoning, never as an explanation of
// why an option is true/false — e.g. "Wait, the claim is..." or "Let me re-evaluate: ...". Found
// via an audit of table-sourced generations: sarvam-105b occasionally spills its reasoning into
// the `text` field of optionEvaluations instead of just stating the judgment, especially on
// questions built from dense numeric tables where it has to work harder to find the one true outlier.
const META_COMMENTARY_PATTERN = /\b(i need to|let me|wait,|revise the question|reconsider)\b/i;

// Matches "highest/lowest/higher/lower ... weight" questions (word order-agnostic — "weight" can
// come before or after the comparison word), the table-sourced pattern that produced wrong answer
// keys when the model picked an option that only looked plausible rather than checking the actual
// numbers in the passage.
const WEIGHT_COMPARISON_PATTERN = /\b(highest|lowest|higher|lower)\b.*\bweight|weight.*\b(highest|lowest|higher|lower)\b/i;
const WANTS_MAX = /highest|higher/i;

// Extracts the decimal number(s) (weights are always written with a decimal point in this source;
// S.No. and quotation counts are plain integers, so restricting to \d+\.\d+ skips right past them)
// immediately following one occurrence of `name` in `text`. A WPI table row reads like
// "<S.No.> <name> <weight>" (single-series tables, e.g. "288 Acetic acid ... 0.02452 15") or
// "<S.No.> <name> <weight 2011-12> <weight 2004-05>" (the Annex-II comparison tables, e.g.
// "37 Milk 4.43999 3.23818") — so up to 2 consecutive decimals right after the name are captured.
// Tries every occurrence of `name` in `text`, not just the first — a short name can appear
// embedded in a larger label earlier in the passage (e.g. option "Cereals" also occurring inside
// "(CEREALS+PULSES)", a section subtotal line, before the actual "CEREALS <weight> <weight>" row)
// where no table row follows. Returns the first occurrence that's actually followed by a table row.
function findWeightsAfter(text: string, name: string): number[] | null {
  const haystack = text.toLowerCase();
  const needle = name.toLowerCase();
  let from = 0;
  while (true) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) return null;
    const after = text.slice(idx + name.length, idx + name.length + 60);
    const match = after.match(/^\s*(\d+\.\d+)(?:\s+(\d+\.\d+))?/);
    if (match) return match.slice(1).filter((v): v is string => v !== undefined).map(Number);
    from = idx + 1;
  }
}

// The WPI manual's Annex-II tables consistently list weights in "Weights (2011-12) Weights
// (2004-05)" column order (verified against the source PDF) — so when a row has 2 decimals, the
// first is always the 2011-12 figure and the second the 2004-05 figure, regardless of which chunk
// it lands in (chunking may split the table away from its header, but the column order itself is
// a fixed property of this source document, not something each chunk restates).
const SERIES_COLUMN_ORDER = ["2011-12", "2004-05"] as const;

// For a plain "highest/lowest weight" question there's one weight per option — that's the value.
// On a two-column row, the question might name only ONE series ("lowest weight in the 2011-12
// series") — meaning "ignore the other column", not "compare them" — or it might name BOTH
// ("higher weight in 2011-12 compared to 2004-05"), meaning a comparison is wanted. For the
// two-series case the relevant number is a *signed delta* oriented so "higher" always means "more
// positive": if the question asks about series A "than"/"compared to" series B, the delta is
// valueOf(A) - valueOf(B). Getting the orientation from the question's own wording (rather than
// always doing column1 - column2) is what makes "higher weight in 2004-05 than in 2011-12" (a
// reversed comparison) evaluate correctly instead of being judged backwards.
function relevantValue(weights: number[], question: string): number | null {
  if (weights.length === 1) return weights[0];

  const [col2011, col2004] = weights; // fixed source-document column order, see SERIES_COLUMN_ORDER
  const mentioned = SERIES_COLUMN_ORDER.filter((year) => question.includes(year));
  if (mentioned.length === 1) return mentioned[0] === "2011-12" ? col2011 : col2004;
  if (mentioned.length !== 2) return null; // neither/both-ambiguous — can't tell which series is meant

  const firstMentioned = question.indexOf(mentioned[0]) < question.indexOf(mentioned[1]) ? mentioned[0] : mentioned[1];
  return firstMentioned === "2011-12" ? col2011 - col2004 : col2004 - col2011;
}

// Table-sourced numeric check: for a highest/lowest/higher/lower-weight question, pull the actual
// weight (or weight delta, for a two-series comparison) for each option straight from the source
// passage and confirm the marked-correct option really is the max (highest/higher) or min
// (lowest/lower) among them — rather than trusting the model's pick. Deliberately conservative:
// if a weight/orientation can't be confidently determined for all 4 options, this check is
// skipped rather than risking a false-positive rejection on a question it can't fully parse.
function checkWeightComparison(draft: McqDraft, sourceChunkText: string | null): string | null {
  if (sourceChunkText === null) return null;
  if (!WEIGHT_COMPARISON_PATTERN.test(draft.question)) return null;

  const values: number[] = [];
  for (const option of draft.options) {
    const weights = findWeightsAfter(sourceChunkText, option);
    if (!weights || weights.length === 0) return null; // can't confirm — don't block on an unparseable case
    const value = relevantValue(weights, draft.question);
    if (value === null) return null;
    values.push(value);
  }

  const wantsMax = WANTS_MAX.test(draft.question);
  const extreme = wantsMax ? Math.max(...values) : Math.min(...values);
  if (values[draft.correctOption] !== extreme) {
    return (
      `Marked-correct option ${draft.correctOption} does not have the ${wantsMax ? "highest" : "lowest"} ` +
      `weight found in the source passage (values: ${values.join(", ")}).`
    );
  }
  return null;
}

// Matches "which of the following is NOT a member/sub-group/category/component/part of X", and
// also the looser relational phrasings the WPI footnotes actually use for series-restructuring
// facts — "trifurcated from", "bifurcated from", "split from", "derived from", "formed from",
// "originated from" X. These two families need *different* verification strategies (see
// CURRENT_MEMBERSHIP_KEYWORDS vs RESTRUCTURING_KEYWORDS below), which is why they're kept as
// separate keyword sets even though both feed the same extraction/trigger logic.
const CURRENT_MEMBERSHIP_KEYWORDS = "member|sub-?group|subgroup|component|category";
const RESTRUCTURING_KEYWORDS = "part|trifurcated|bifurcated|split|derived|formed|originated";
const RELATION_KEYWORDS = `${CURRENT_MEMBERSHIP_KEYWORDS}|${RESTRUCTURING_KEYWORDS}`;

// Gating is deliberately loose about adjacency: a real example reads "NOT a sub-group THAT WAS
// trifurcated from..." — "not" and the relation keyword aren't adjacent, so requiring them to be
// would miss exactly the phrasing this widening exists to catch. For a short, single-sentence MCQ
// stem, "contains 'not' AND contains a relation phrase somewhere" is a safe enough proxy for "this
// is a negated relation question" without over-constraining word order.
const HAS_NOT = /\bnot\b/i;
const RELATION_PHRASE = new RegExp(`\\b(?:${RELATION_KEYWORDS})[a-z]*\\s+(?:of|from)\\b`, "i");
const RESTRUCTURING_TRIGGER = new RegExp(`\\b(?:${RESTRUCTURING_KEYWORDS})[a-z]*\\s+from\\b`, "i");

// A quoted group name (however it's introduced) is unambiguous and preferred when present — the
// WPI manual's own footnotes always quote the specific series/sub-group name they're describing,
// so a generic "first quoted phrase in the question" search finds it reliably even when it isn't
// immediately adjacent to the relation keyword (e.g. "...trifurcated from the WPI (Base 2004-05)
// series 'X'" — the quote follows "series", not "trifurcated from"). Falls back to reading the
// name as whatever runs from "of"/"from" to the end of the question when nothing is quoted.
const QUOTED_GROUP_NAME = /['"]([^'"]{3,80})['"]/;
const TRAILING_GROUP_NAME = new RegExp(`(?:${RELATION_KEYWORDS})[a-z]*\\s+(?:of|from)\\s+(?:the\\s+)?['"]?([a-z0-9 &,'()./-]{3,60}?)['"]?\\s*[?:.]?$`, "i");

// Words that indicate the trailing-fallback regex over-captured a generic qualifier clause
// ("...category of manufactured wood products LISTED IN THE PASSAGE?") rather than a real,
// specific group name — there's nothing to look up if the "name" is really just "listed in the
// passage". A quoted name never has this problem, since quoting only wraps the actual name.
const GENERIC_QUALIFIER_WORDS = /\b(listed|mentioned|shown|described|given|provided|passage|table|following)\b/i;

function extractGroupName(question: string): { groupName: string; isRestructuring: boolean } | null {
  if (!HAS_NOT.test(question) || !RELATION_PHRASE.test(question)) return null;
  const isRestructuring = RESTRUCTURING_TRIGGER.test(question);
  const quoted = question.match(QUOTED_GROUP_NAME)?.[1]?.trim();
  if (quoted) return { groupName: quoted, isRestructuring };
  const trailing = question.match(TRAILING_GROUP_NAME)?.[1]?.trim();
  if (trailing && !GENERIC_QUALIFIER_WORDS.test(trailing)) return { groupName: trailing, isRestructuring };
  return null;
}

// Lines that introduce X's *current* children read like "X: a, b, c" / "X includes a, b, c" /
// "X comprises a, b and c" — as distinct from a footnote sentence about a historical/ancestor
// category, which reads like "<the sub-group> X ... is part of / was part of / erstwhile ...".
// Only applied to the "current membership" family: for the "restructuring" family (trifurcated
// from, part of, etc.) this exact kind of sentence — "X ... is part of Y in the WPI (Base 2004-05)
// series" — IS the primary fact being asked about, not a misleading footnote to discard, so
// filtering it out there would throw away the only sentence that could ever confirm the answer.
const HISTORICAL_MARKERS = /\b(erstwhile|historical|previously|earlier series|was part of|is part of|prior to|before the|base 200)/i;

// The source PDF uses curly quotes (“ ”) around quoted names in the passage, while a question's
// own quoted group name (written by the model) uses straight quotes — so a name extracted from
// the question and searched for verbatim in the passage needs both sides' quote characters
// stripped first, or a name like `Manufacture of X` never matches `Manufacture of "X"` even though
// they're the same phrase.
// ‘/’/“/” are the curly quote marks (‘ ’ “ ”) the source PDF text uses —
// written as explicit \u escapes, not literal characters, so this can't silently degrade to ASCII
// lookalikes depending on editor/encoding behavior.
function stripQuotes(s: string): string {
  return s.replace(/[‘’“”"'`]/g, "");
}

function checkNotMemberOf(draft: McqDraft, sourceChunkText: string | null): string | null {
  const extracted = extractGroupName(draft.question);
  if (!extracted) return null; // not this question shape — check doesn't apply
  if (sourceChunkText === null) return "Cannot verify a 'NOT a member/part of X' question with no source passage to check X's listed children against.";

  const { groupName, isRestructuring } = extracted;
  const cleanGroupName = stripQuotes(groupName).toLowerCase();
  const claimedNonMember = stripQuotes(draft.options[draft.correctOption]).toLowerCase();
  const label = isRestructuring ? "NOT part of/derived from" : "NOT a member of";

  // Find every passage sentence that mentions the group name, split on sentence boundaries so a
  // footnote sentence about a historical/ancestor category doesn't get merged with the sentence
  // that actually lists X's current children.
  const sentences = stripQuotes(sourceChunkText)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.toLowerCase().includes(cleanGroupName));
  if (sentences.length === 0) {
    return `Ambiguous "${label} ${groupName}" question — the group name doesn't appear in the source passage to verify against.`;
  }

  const candidateSentences = isRestructuring ? sentences : sentences.filter((s) => !HISTORICAL_MARKERS.test(s));
  if (candidateSentences.length === 0) {
    return (
      `Ambiguous "${label} ${groupName}" question — the only passage mentions of "${groupName}" are ` +
      `historical/footnote references, not a clear current listing of its members to verify against.`
    );
  }

  const memberIsListed = candidateSentences.some((s) => s.toLowerCase().includes(claimedNonMember));
  if (memberIsListed) {
    return (
      `Marked-correct option "${draft.options[draft.correctOption]}" is claimed "${label}" "${groupName}", but it appears ` +
      `in the passage's own description of ${groupName}'s members — likely confused with an unrelated reference.`
    );
  }
  return null;
}

// Detects a "correct" answer that's just a near-verbatim restatement of an entity the question
// itself quotes (e.g. Q: "...a sub-group under 'Manufacture of non-ferrous metals'?" A: "Manufacture
// of non-ferrous metals incl. precious metals") — a Major-Group-vs-sub-group scoping confusion
// where the model answered "the group itself" instead of an actual child of it. Deliberately scoped
// to the quoted-entity case rather than a blanket question/option similarity check: ordinary
// correct answers legitimately share vocabulary with their stem (topic words, series names), so a
// generic stem-vs-option similarity threshold would misfire constantly. Requiring that (a) the
// stem quotes a specific entity and (b) the correct option contains nearly all of that entity's
// words verbatim is a much narrower, safer signal specific to this scoping-confusion pattern.
function checkAnswerEchoesQuotedStemEntity(draft: McqDraft): string | null {
  const quoted = draft.question.match(QUOTED_GROUP_NAME)?.[1]?.trim();
  if (!quoted) return null;
  const quotedTokens = tokenize(quoted);
  if (quotedTokens.size < 2) return null; // too short to be a meaningful entity name

  const correctOption = draft.options[draft.correctOption];
  const optionTokens = tokenize(correctOption);
  const overlap = [...quotedTokens].filter((t) => optionTokens.has(t)).length;
  if (overlap / quotedTokens.size >= 0.9) {
    return (
      `Marked-correct option "${correctOption}" is a near-duplicate of "${quoted}", the entity quoted in the question's ` +
      `own stem — likely a scoping confusion (answering with the group itself rather than one of its members).`
    );
  }
  return null;
}

// Flags an option whose text contains an ALL-CAPS run of 3+ words that duplicates wording already
// present elsewhere in the same option (case-insensitively) — the fingerprint of a template/prompt
// artifact where a generation-time prefix (e.g. "Manufacture of ...") got wrapped around an
// already-capitalized source-passage label, producing garbage like `Manufacture of "MANUFACTURE OF
// BASIC METALS"`. Requires BOTH signals (an all-caps run AND a repeated word-pair) so it only fires
// on genuine self-duplication, not on options that legitimately quote an all-caps passage label once.
const ALL_CAPS_RUN = /\b[A-Z]{2,}(?:[\s,&'.-]+[A-Z]{2,}){2,}\b/;

function findGarbledOption(options: readonly string[]): number | null {
  for (let i = 0; i < options.length; i++) {
    if (!ALL_CAPS_RUN.test(options[i])) continue;
    const words = options[i].toLowerCase().match(/[a-z0-9]+/g) ?? [];
    const seenBigrams = new Set<string>();
    for (let w = 0; w < words.length - 1; w++) {
      const bigram = `${words[w]} ${words[w + 1]}`;
      if (seenBigrams.has(bigram)) return i;
      seenBigrams.add(bigram);
    }
  }
  return null;
}

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

  if (explanations.some((e) => META_COMMENTARY_PATTERN.test(e.text))) {
    return "An explanation contains leaked model reasoning/meta-commentary (e.g. \"wait,\", \"let me\") rather than a clean justification.";
  }

  const weightRejection = checkWeightComparison(draft, sourceChunkText);
  if (weightRejection) return weightRejection;

  const notMemberRejection = checkNotMemberOf(draft, sourceChunkText);
  if (notMemberRejection) return notMemberRejection;

  const echoRejection = checkAnswerEchoesQuotedStemEntity(draft);
  if (echoRejection) return echoRejection;

  const garbledIndex = findGarbledOption(options);
  if (garbledIndex !== null) {
    return `Option ${garbledIndex} contains a duplicated/garbled phrase (likely a template-formatting artifact): "${options[garbledIndex]}".`;
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
