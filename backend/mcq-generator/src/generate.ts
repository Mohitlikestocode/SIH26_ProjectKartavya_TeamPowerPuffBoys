import type Groq from "groq-sdk";
import { buildFreeTextSystem, buildFreeTextUserMessage, buildSystem, buildUserMessage } from "./prompt";
import { completeJson, createClient, DEFAULT_MODEL } from "./llm";
import {
  BatchSchema,
  FreeTextBatchSchema,
  type Difficulty,
  type FreeTextItem,
  type Question,
} from "./schema";
import { mockBatch, mockFreeTextBatch } from "./mock";
import type { Stage } from "./stages";

export { DEFAULT_MODEL };

export interface GenerateOptions {
  sourceText: string;
  domain: string;
  difficulty: Difficulty;
  count: number;
  stage: Stage;
  /**
   * Items per API call. Groq has no prompt caching, so the source material is
   * re-sent on every request — larger batches mean fewer copies of the document
   * paid for, smaller batches mean shorter responses less likely to hit the
   * output limit.
   */
  batchSize: number;
  mock: boolean;
  model?: string;
  onProgress?: (message: string) => void;
}

export interface GenerateResult {
  questions: Question[];
  notes: string[];
  model: string;
}

export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const log = opts.onProgress ?? (() => {});

  if (opts.mock) {
    log("Running in --mock mode: no API call, deterministic sample output.");
    const batch = mockBatch(opts.domain, opts.difficulty, opts.count);
    return { questions: batch.questions, notes: [batch.notes], model: "mock" };
  }

  const client = createClient();
  const system = buildSystem(opts.sourceText, opts.stage);

  const questions: Question[] = [];
  const notes: string[] = [];
  let remaining = opts.count;

  while (remaining > 0) {
    const want = Math.min(remaining, opts.batchSize);
    log(`Requesting ${want} item(s) — ${questions.length}/${opts.count} done...`);

    const batch = await completeJson({
      client,
      model,
      system,
      user: buildUserMessage({
        domain: opts.domain,
        difficulty: opts.difficulty,
        count: want,
        alreadyGenerated: questions,
      }),
      schema: BatchSchema,
      schemaName: "question_batch",
    });

    if (batch.notes.trim()) notes.push(batch.notes.trim());

    if (batch.questions.length === 0) {
      // The brief tells the model to return fewer items rather than invent
      // ungrounded ones. An empty batch means it has run out of material —
      // asking again would only pressure it into padding.
      log("Model returned no further grounded items; stopping early.");
      break;
    }

    questions.push(...batch.questions);
    remaining = opts.count - questions.length;

    if (batch.questions.length < want) {
      log(`Model returned ${batch.questions.length} of ${want} — source material is thinning out; stopping early.`);
      break;
    }
  }

  return { questions: questions.slice(0, opts.count), notes, model };
}

// ---------------------------------------------------------------------------
// Written-answer items.
//
// Not batched. Stage 2 asks for one or two of these per sub-skill, so there is
// no long response to split up, and each item carries a whole rubric — asking
// for several at once measurably thins the rubrics.
// ---------------------------------------------------------------------------

export interface GenerateFreeTextOptions {
  sourceText: string;
  domain: string;
  difficulty: Difficulty;
  count: number;
  /** MCQ items already written for this sub-skill, so the written item covers different ground. */
  mcqContext: Question[];
  mock: boolean;
  model?: string;
  onProgress?: (message: string) => void;
}

export interface GenerateFreeTextResult {
  items: FreeTextItem[];
  notes: string[];
  model: string;
}

export async function generateFreeText(opts: GenerateFreeTextOptions): Promise<GenerateFreeTextResult> {
  const model = opts.model ?? DEFAULT_MODEL;
  const log = opts.onProgress ?? (() => {});

  if (opts.count < 1) return { items: [], notes: [], model: opts.mock ? "mock" : model };

  if (opts.mock) {
    const batch = mockFreeTextBatch(opts.domain, opts.difficulty, opts.count);
    return { items: batch.items, notes: [batch.notes], model: "mock" };
  }

  const client: Groq = createClient();
  const system = buildFreeTextSystem(opts.sourceText);
  const items: FreeTextItem[] = [];
  const notes: string[] = [];

  for (let i = 0; i < opts.count; i++) {
    log(`Requesting written item ${i + 1}/${opts.count}...`);

    const batch = await completeJson({
      client,
      model,
      system,
      user: buildFreeTextUserMessage({
        domain: opts.domain,
        difficulty: opts.difficulty,
        count: 1,
        mcqContext: opts.mcqContext,
        alreadyGenerated: items,
      }),
      schema: FreeTextBatchSchema,
      schemaName: "free_text_batch",
    });

    if (batch.notes.trim()) notes.push(batch.notes.trim());

    if (batch.items.length === 0) {
      log("Model returned no further grounded written items; stopping early.");
      break;
    }
    items.push(...batch.items);
  }

  return { items, notes, model };
}
