import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { buildFreeTextSystem, buildFreeTextUserMessage, buildSystem, buildUserMessage } from "./prompt";
import {
  BatchSchema,
  FreeTextBatchSchema,
  type Batch,
  type Difficulty,
  type FreeTextBatch,
  type FreeTextItem,
  type Question,
} from "./schema";
import { mockBatch, mockFreeTextBatch } from "./mock";
import type { Stage } from "./stages";

export const DEFAULT_MODEL = process.env.MCQ_MODEL ?? "claude-opus-5";

export interface GenerateOptions {
  sourceText: string;
  domain: string;
  difficulty: Difficulty;
  count: number;
  stage: Stage;
  /** Items per API call. Small batches keep each response short and let a late failure keep earlier work. */
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

  const client = new Anthropic();
  const system = buildSystem(opts.sourceText, opts.stage);

  const questions: Question[] = [];
  const notes: string[] = [];
  let remaining = opts.count;

  while (remaining > 0) {
    const want = Math.min(remaining, opts.batchSize);
    log(`Requesting ${want} item(s) — ${questions.length}/${opts.count} done...`);

    const batch = await requestBatch(client, model, system, {
      domain: opts.domain,
      difficulty: opts.difficulty,
      count: want,
      alreadyGenerated: questions,
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

async function requestBatch(
  client: Anthropic,
  model: string,
  system: Anthropic.TextBlockParam[],
  ask: { domain: string; difficulty: Difficulty; count: number; alreadyGenerated: Question[] },
): Promise<Batch> {
  try {
    const response = await client.messages.parse({
      model,
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: buildUserMessage(ask) }],
      output_config: { format: zodOutputFormat(BatchSchema) },
    });

    if (!response.parsed_output) {
      throw new Error("Model response did not parse against the question schema.");
    }

    const cached = response.usage.cache_read_input_tokens ?? 0;
    if (cached > 0) process.stderr.write(`  (${cached.toLocaleString()} input tokens served from cache)\n`);

    return response.parsed_output;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error(
        "Authentication failed. Set ANTHROPIC_API_KEY in .env, or run with --mock to try the pipeline without a key.",
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error("Rate limited by the API. Wait and re-run, or lower --batch-size.");
    }
    if (error instanceof Anthropic.BadRequestError) {
      throw new Error(`API rejected the request: ${error.message}`);
    }
    if (error instanceof Anthropic.APIError) {
      throw new Error(`API error ${error.status}: ${error.message}`);
    }
    throw error;
  }
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

  const client = new Anthropic();
  const system = buildFreeTextSystem(opts.sourceText);
  const items: FreeTextItem[] = [];
  const notes: string[] = [];

  for (let i = 0; i < opts.count; i++) {
    log(`Requesting written item ${i + 1}/${opts.count}...`);

    const batch = await requestFreeTextBatch(client, model, system, {
      domain: opts.domain,
      difficulty: opts.difficulty,
      count: 1,
      mcqContext: opts.mcqContext,
      alreadyGenerated: items,
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

async function requestFreeTextBatch(
  client: Anthropic,
  model: string,
  system: Anthropic.TextBlockParam[],
  ask: {
    domain: string;
    difficulty: Difficulty;
    count: number;
    mcqContext: Question[];
    alreadyGenerated: FreeTextItem[];
  },
): Promise<FreeTextBatch> {
  try {
    const response = await client.messages.parse({
      model,
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: buildFreeTextUserMessage(ask) }],
      output_config: { format: zodOutputFormat(FreeTextBatchSchema) },
    });

    if (!response.parsed_output) {
      throw new Error("Model response did not parse against the written-item schema.");
    }

    const cached = response.usage.cache_read_input_tokens ?? 0;
    if (cached > 0) process.stderr.write(`  (${cached.toLocaleString()} input tokens served from cache)\n`);

    return response.parsed_output;
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      throw new Error(
        "Authentication failed. Set ANTHROPIC_API_KEY in .env, or run with --mock to try the pipeline without a key.",
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw new Error("Rate limited by the API. Wait and re-run.");
    }
    if (error instanceof Anthropic.BadRequestError) {
      throw new Error(`API rejected the request: ${error.message}`);
    }
    if (error instanceof Anthropic.APIError) {
      throw new Error(`API error ${error.status}: ${error.message}`);
    }
    throw error;
  }
}
