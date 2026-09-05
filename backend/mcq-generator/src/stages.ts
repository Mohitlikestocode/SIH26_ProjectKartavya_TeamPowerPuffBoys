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
// The stage changes what a good question looks like, so it is a first-class
// input to generation — not just a different item count.
// ---------------------------------------------------------------------------

export const STAGES = ["broad", "specific"] as const;
export type Stage = (typeof STAGES)[number];

export interface StageProfile {
  purpose: string;
  itemsPerSkill: number;
  difficulty: Difficulty;
  /** Injected into the generation brief — this is what makes the two stages produce different questions. */
  intent: string;
}

export const STAGE_PROFILES: Record<Stage, StageProfile> = {
  broad: {
    purpose: "Screening sweep — many sub-skills, few items each, ranks weakest-first.",
    itemsPerSkill: 2,
    difficulty: "intermediate",
    intent: `This is a SCREENING item in a broad diagnostic that covers many sub-skills with very few items each.

Target the single most central idea in the source material for this sub-skill — the one an officer who understands the topic applies routinely, and an officer who does not gets wrong in an ordinary week of work. Avoid narrow edge cases, unusual exceptions and anything requiring a specific figure to be remembered.

The item must cleanly separate "can apply this" from "cannot". A borderline learner getting it right by luck is a worse failure here than an item being slightly too easy.`,
  },
  specific: {
    purpose: "Deep dive — few sub-skills, many items each, measures and localises the gap.",
    itemsPerSkill: 6,
    difficulty: "advanced",
    intent: `This is a DIAGNOSTIC item for a learner already flagged weak in this sub-skill by a broad screening test. The goal is no longer to find out whether they are weak — it is to find out exactly HOW.

Probe one specific, nameable failure mode. Each of the three distractors should correspond to a DIFFERENT misunderstanding — for example one confusing this concept with an adjacent one, one applying the right concept at the wrong stage of the workflow, one taking a partial action that looks complete. A learner's pattern of wrong answers across the set should point at which misconception they hold.

Across a set of items for this sub-skill, vary the failure mode probed. Do not write six items that all catch the same mistake.`,
  },
};

export function stageProfile(stage: Stage): StageProfile {
  return STAGE_PROFILES[stage];
}
