import { ONTOLOGY } from "./ontology";
import type { Difficulty, FreeTextItem, Question } from "./schema";
import { FREE_TEXT_INTENT, stageProfile, type Stage } from "./stages";

// The generator brief. Two deliberate differences from the original draft:
//
//  1. The competency tag list is the backend's seeded ontology, not a
//     free-standing list — see ontology.ts for why a stray tag is worse than
//     a wrong one.
//  2. There is no OUTPUT FORMAT section. The JSON shape is enforced by
//     structured outputs (see generate.ts), so restating it in prose only
//     gives the model a second, drifting copy to disagree with.
const RULES = `You are an assessment-generation engine for a government capacity-building platform (Official Statistics domain, MoSPI/iGOT Karmayogi ecosystem). You generate CASE-BASED multiple choice questions from provided source material.

RULES FOR EACH QUESTION:
- Write a realistic 2-4 sentence WORK SCENARIO a government statistical officer would plausibly face — not a textbook definition restated as a question.
- The scenario must require APPLYING a concept from the source material, not just recalling it. Test judgment and next-step reasoning, not memorization.
- Provide exactly 4 options. Exactly one is correct.
- The 3 distractors must represent PLAUSIBLE real-world mistakes: a common misapplication of the concept, an outdated practice, or a partially-correct-but-incomplete action. Never random or obviously silly options.
- Do NOT introduce facts, numbers, or procedures that are not grounded in the source material. If the source material is insufficient to ground a scenario, return FEWER questions and say so in "notes" rather than inventing ungrounded content. Returning 3 well-grounded questions instead of 10 padded ones is the correct behaviour, not a failure.
- Every item is case-based, so "cognitive_level" is "application" or "analysis" — never recall.
- "explanation.correct" says in 2-3 sentences why the correct answer is right. "explanation.distractor_reasoning" carries an entry for all four keys: for the correct option, restate briefly why it is right; for each distractor, name the specific mistake a learner makes by choosing it. This text is shown to the learner after they answer.
- "source_grounding" points at the part of the source material the item draws from (a section heading, a defined term, a procedure) so a reviewing trainer can check it in one look.
- Vary which key is correct across a set. Do not let the answer settle on one letter.
- "id" is a short unique slug, e.g. "samp-rotational-panel-01".

COMPETENCY TAGS. The "domain" field takes the SUB-SKILL NAME ONLY — "Sampling", not
"Statistical: Sampling" and not "Statistical". The grouping below is context for you,
not a format to copy:
${Object.entries(ONTOLOGY)
  .map(([domain, subSkills]) => `  ${domain}: ${subSkills.join(", ")}`)
  .join("\n")}`;

// One system string rather than separate cacheable blocks. Groq has no
// prompt-caching API, so the source material is re-sent with every request —
// which makes --batch-size a cost lever, not just a reliability one.
export function buildSystem(sourceText: string, stage: Stage): string {
  return [
    RULES,
    `STAGE — ${stage.toUpperCase()}\n\n${stageProfile(stage).intent}`,
    `SOURCE_CONTENT:\n\n${sourceText}`,
  ].join("\n\n---\n\n");
}

export function buildUserMessage(opts: {
  domain: string;
  difficulty: Difficulty;
  count: number;
  alreadyGenerated: Question[];
}): string {
  const lines = [
    `COMPETENCY_DOMAIN: ${opts.domain}`,
    `DIFFICULTY: ${opts.difficulty}`,
    `NUM_QUESTIONS: ${opts.count}`,
  ];

  if (opts.alreadyGenerated.length > 0) {
    lines.push(
      "",
      "These items already exist for this sub-skill. Cover different material and different failure modes — do not restate them with new wording:",
      ...opts.alreadyGenerated.map((q) => `- ${q.question}`),
    );
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Written-answer items.
//
// The RULES block above is about writing four options and three plausible
// wrong ones — none of which applies here. So free-text generation gets its
// own brief rather than an MCQ brief with caveats bolted on.
// ---------------------------------------------------------------------------

export function buildFreeTextSystem(sourceText: string): string {
  return [FREE_TEXT_INTENT, `SOURCE_CONTENT:\n\n${sourceText}`].join("\n\n---\n\n");
}

export function buildFreeTextUserMessage(opts: {
  domain: string;
  difficulty: Difficulty;
  count: number;
  /** MCQ items already written for this sub-skill — their misconceptions are reusable as not_met examples. */
  mcqContext: Question[];
  alreadyGenerated: FreeTextItem[];
}): string {
  const lines = [
    `COMPETENCY_DOMAIN: ${opts.domain}`,
    `DIFFICULTY: ${opts.difficulty}`,
    `NUM_ITEMS: ${opts.count}`,
  ];

  if (opts.mcqContext.length > 0) {
    lines.push(
      "",
      "Multiple-choice items already exist for this sub-skill, covering these situations:",
      ...opts.mcqContext.map((q) => `- ${q.question}`),
      "",
      "Choose a different situation for the written item — it should reach material the multiple-choice items do not, since a written answer can test reasoning they cannot.",
    );
  }

  if (opts.alreadyGenerated.length > 0) {
    lines.push(
      "",
      "These written items already exist. Cover different ground:",
      ...opts.alreadyGenerated.map((i) => `- ${i.question}`),
    );
  }

  return lines.join("\n");
}
