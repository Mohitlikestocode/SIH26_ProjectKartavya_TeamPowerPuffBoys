import type { Difficulty } from "./schema";

// ---------------------------------------------------------------------------
// The two stages are the whole point of this tool.
//
// STAGE 1 (broad)     — screen every sub-skill the learner's target role
//                       requires, with very few items each. Its job is to
//                       RANK sub-skills weakest-first, not to measure them.
//                       Two items can only score 0, 50 or 100, which is far
//                       too coarse to hand anyone as a competency level.
//
// STAGE 2 (specific)  — re-test only the sub-skills stage 1 flagged, with
//                       enough items to MEASURE them. This is where a real
//                       number comes from, and where the wrong answers start
//                       telling you *which* misunderstanding a learner has.
//
// Stage 2 additionally carries free-text items. The split of labour matters:
// the MCQs produce the score, deterministically and defensibly; the written
// answers produce the diagnosis and the labelled data. Neither depends on the
// other being trustworthy — a model's reading of a paragraph never sets a
// competency number.
//
// The stage changes what a good question looks like, so it is a first-class
// input to generation — not just a different item count.
// ---------------------------------------------------------------------------

export const STAGES = ["broad", "specific"] as const;
export type Stage = (typeof STAGES)[number];

export interface StageProfile {
  purpose: string;
  itemsPerSkill: number;
  /** Written-answer items per sub-skill. Zero for the screening stage — it has to score instantly. */
  freeTextPerSkill: number;
  difficulty: Difficulty;
  /** Injected into the generation brief — this is what makes the two stages produce different questions. */
  intent: string;
}

export const STAGE_PROFILES: Record<Stage, StageProfile> = {
  broad: {
    purpose: "Screening sweep — many sub-skills, few items each, ranks weakest-first.",
    itemsPerSkill: 2,
    freeTextPerSkill: 0,
    difficulty: "intermediate",
    intent: `This is a SCREENING item in a broad diagnostic that covers many sub-skills with very few items each.

Target the single most central idea in the source material for this sub-skill — the one an officer who understands the topic applies routinely, and an officer who does not gets wrong in an ordinary week of work. Avoid narrow edge cases, unusual exceptions and anything requiring a specific figure to be remembered.

The item must cleanly separate "can apply this" from "cannot". A borderline learner getting it right by luck is a worse failure here than an item being slightly too easy.`,
  },
  specific: {
    purpose: "Deep dive — few sub-skills, many items each, measures and localises the gap.",
    // 4 + 2, not 6 + 1. Four MCQ still give five distinguishable score levels,
    // which is ample for a gap the recommendation engine only uses to rank
    // courses — the ordering barely moves on a 15-point difference. The second
    // written item buys something the MCQs cannot: a misconception nobody
    // thought to write an option for. Same sitting length either way, since a
    // written answer costs roughly six MCQs of a candidate's time.
    itemsPerSkill: 4,
    freeTextPerSkill: 2,
    difficulty: "advanced",
    intent: `This is a DIAGNOSTIC item for a learner already flagged weak in this sub-skill by a broad screening test. The goal is no longer to find out whether they are weak — it is to find out exactly HOW.

Probe one specific, nameable failure mode. Each of the three distractors should correspond to a DIFFERENT misunderstanding — for example one confusing this concept with an adjacent one, one applying the right concept at the wrong stage of the workflow, one taking a partial action that looks complete. A learner's pattern of wrong answers across the set should point at which misconception they hold.

Across a set of items for this sub-skill, vary the failure mode probed. Do not write six items that all catch the same mistake.`,
  },
};

// The brief for written-answer items. Separate from `intent` above because a
// free-text item is not a question with the options removed — its whole value
// is the rubric, and a rubric that can be satisfied by vocabulary rather than
// reasoning is worse than no rubric at all.
export const FREE_TEXT_INTENT = `You are writing a WRITTEN-ANSWER diagnostic item for a learner already flagged weak in this sub-skill, together with the rubric a grader will use to mark it.

The rubric is the important part. It will be applied mechanically: for each criterion, a grader must quote the words in the learner's answer that establish the claim, and award nothing if no such words exist. Write criteria that survive that treatment.

Each criterion is a CLAIM the answer must make, not a term it must contain:
- Wrong: "mentions non-response bias" — a learner who writes the phrase without understanding it passes.
- Right: "distinguishes frame error from non-response, and states that weighting adjustments do not fix the former" — this cannot be satisfied without engaging.

Wherever you can, tie the claim to a specific detail of the scenario you wrote ("connects the four-year-old register to the units that are missing entirely"). A candidate who has memorised terminology cannot satisfy a criterion anchored to particulars.

For every criterion supply:
- met_example: a sentence a competent officer might write that clearly satisfies the claim.
- not_met_example: a sentence that sounds relevant and confident but does NOT satisfy it — ideally one expressing a real misconception, not an empty statement. This is what stops a grader drifting lenient.

Write 3 to 5 criteria. Fewer than 3 cannot localise a misconception; more than 5 makes marking noisy and slow.

Also supply reference_answer: what a strong answer contains, in prose. This is shown to the learner afterwards, so write it to teach, not to justify a mark.

Ground every criterion in the source material. If the material will not support a rubric of at least 3 real criteria for this sub-skill, return fewer items and say so in notes.`;

export function stageProfile(stage: Stage): StageProfile {
  return STAGE_PROFILES[stage];
}
