import { z } from "zod";
import type { Competency } from "./ontology";
import type { Stage } from "./stages";

export const DIFFICULTIES = ["foundational", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const OptionSchema = z.object({
  key: z.enum(["A", "B", "C", "D"]),
  text: z.string(),
});

export const QuestionSchema = z.object({
  id: z.string(),
  domain: z.string(),
  difficulty: z.enum(DIFFICULTIES),
  // "recall" is deliberately absent: the brief requires every case-based item
  // to test application or analysis, so the schema makes recall unrepresentable
  // rather than asking the model nicely and checking afterwards.
  cognitive_level: z.enum(["application", "analysis"]),
  scenario: z.string(),
  question: z.string(),
  options: z.array(OptionSchema),
  correct_option: z.enum(["A", "B", "C", "D"]),
  explanation: z.object({
    correct: z.string(),
    distractor_reasoning: z.object({
      A: z.string(),
      B: z.string(),
      C: z.string(),
      D: z.string(),
    }),
  }),
  source_grounding: z.string(),
});

export const BatchSchema = z.object({
  questions: z.array(QuestionSchema),
  notes: z.string(),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Batch = z.infer<typeof BatchSchema>;

export const CriterionSchema = z.object({
  key: z.string(),
  /** A claim the answer must make. Not a term it must contain — see FREE_TEXT_INTENT. */
  claim: z.string(),
  met_example: z.string(),
  not_met_example: z.string(),
  source_grounding: z.string(),
});

export const FreeTextItemSchema = z.object({
  id: z.string(),
  domain: z.string(),
  difficulty: z.enum(DIFFICULTIES),
  scenario: z.string(),
  question: z.string(),
  /** Shown to the learner after they answer. Written to teach, not to justify a mark. */
  reference_answer: z.string(),
  criteria: z.array(CriterionSchema),
});

export const FreeTextBatchSchema = z.object({
  items: z.array(FreeTextItemSchema),
  notes: z.string(),
});

export type Criterion = z.infer<typeof CriterionSchema>;
export type FreeTextItem = z.infer<typeof FreeTextItemSchema>;
export type FreeTextBatch = z.infer<typeof FreeTextBatchSchema>;

/** What lands in the output file: the model's item plus the resolved backend labels. */
export interface TaggedQuestion extends Question {
  kind: "mcq";
  competency: Competency;
  stage: Stage;
}

export interface TaggedFreeTextItem extends FreeTextItem {
  kind: "free_text";
  competency: Competency;
  stage: Stage;
}

/** One file per sub-skill, per stage. */
export interface SkillBankFile {
  meta: {
    generated_at: string;
    model: string;
    stage: Stage;
    source_file: string;
    requested_tag: string;
    domain_tag: string;
    sub_skill_tag: string;
    difficulty: Difficulty;
    requested_count: number;
    returned_count: number;
    free_text_requested: number;
    free_text_returned: number;
  };
  questions: TaggedQuestion[];
  /** Written-answer items. Empty for the broad stage. */
  free_text: TaggedFreeTextItem[];
  notes: string;
  warnings: string[];
}

/** Written alongside the per-skill files so a reader sees the whole sweep at once. */
export interface BankIndex {
  generated_at: string;
  model: string;
  stage: Stage;
  stage_purpose: string;
  source_file: string;
  difficulty: Difficulty;
  items_per_skill: number;
  free_text_per_skill: number;
  total_items: number;
  total_free_text_items: number;
  skills: {
    requested_tag: string;
    domain_tag: string;
    sub_skill_tag: string;
    resolution: Competency["resolution"];
    file: string;
    requested: number;
    returned: number;
    free_text_returned: number;
    warnings: string[];
  }[];
}
