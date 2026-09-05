import Groq from "groq-sdk";
import { z } from "zod";

// ---------------------------------------------------------------------------
// The only file that knows which model provider this tool talks to.
//
// Everything above it deals in "give me an object matching this Zod schema".
// Swapping provider — the project's own context doc calls Groq a prototyping
// step towards a self-hosted evaluator — should mean editing this file and
// nothing else.
// ---------------------------------------------------------------------------

// Groq's strict structured-output mode uses constrained decoding, so the
// response is guaranteed to match the schema rather than merely asked to. Only
// some models support it (openai/gpt-oss-*, qwen/qwen3.8-27b at time of
// writing); the rest fall back to best-effort, which is why the Zod parse
// below is not optional.
export const DEFAULT_MODEL = process.env.MCQ_MODEL ?? "openai/gpt-oss-120b";

export function createClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Put it in .env, or run with --mock to exercise the pipeline without a key.",
    );
  }
  return new Groq();
}

// Groq strict mode requires every property listed in `required` and
// `additionalProperties: false` on every object. Zod 4 emits exactly that
// shape, so the schema is derived rather than hand-maintained alongside the
// Zod one — two copies would drift.
function strictJsonSchema(schema: z.ZodType, name: string) {
  const generated = z.toJSONSchema(schema) as Record<string, unknown>;
  delete generated.$schema; // Groq rejects the dialect key
  return { name, strict: true, schema: generated };
}

export interface CompleteJsonOptions<T> {
  client: Groq;
  model: string;
  system: string;
  user: string;
  schema: z.ZodType<T>;
  schemaName: string;
  maxTokens?: number;
}

const MAX_ATTEMPTS = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Groq's free tier rate-limits well before a full sweep finishes, and the
 * grader makes one call per criterion per answer — so this is the normal path,
 * not an edge case. Honours Retry-After when the API sends one, otherwise backs
 * off exponentially with jitter so parallel callers do not resynchronise.
 */
function retryDelayMs(error: unknown, attempt: number): number {
  const header = (error as { headers?: Record<string, string> })?.headers?.["retry-after"];
  const advised = header ? Number(header) * 1000 : NaN;
  if (Number.isFinite(advised) && advised > 0) return advised + 250;
  return Math.min(2 ** attempt * 1000, 30_000) + Math.random() * 500;
}

export async function completeJson<T>(opts: CompleteJsonOptions<T>): Promise<T> {
  let content: string | null | undefined;

  for (let attempt = 0; ; attempt++) {
    try {
      content = await requestOnce(opts);
      break;
    } catch (error) {
      const isRateLimit = error instanceof Groq.RateLimitError;
      if (!isRateLimit || attempt >= MAX_ATTEMPTS - 1) throw describeError(error);
      const wait = retryDelayMs(error, attempt);
      process.stderr.write(`    rate limited — retrying in ${Math.round(wait / 1000)}s\n`);
      await sleep(wait);
    }
  }

  if (!content) throw new Error("Model returned an empty response.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Model response was not valid JSON.");
  }

  // Belt and braces. Strict mode should make this unreachable, but a model
  // without strict support silently degrades to best-effort, and a malformed
  // item is worse than a failed request — it reaches a learner.
  const result = opts.schema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(
      `Model output did not match the ${opts.schemaName} schema: ${first?.path.join(".") || "(root)"} — ${first?.message}`,
    );
  }

  return result.data;
}

async function requestOnce<T>(opts: CompleteJsonOptions<T>): Promise<string | null | undefined> {
  const response = await opts.client.chat.completions.create({
    model: opts.model,
    max_tokens: opts.maxTokens ?? 16000,
    // Generation, not extraction — a little variation stops a sweep of 28
    // sub-skills producing 28 items with the same sentence rhythm. Low enough
    // that the schema still holds.
    temperature: 0.4,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: strictJsonSchema(opts.schema, opts.schemaName),
    },
  });

  const choice = response.choices[0];
  if (choice?.finish_reason === "length") {
    throw new Error(
      "Model hit the output token limit mid-object. Lower --batch-size so each response is shorter.",
    );
  }
  return choice?.message?.content;
}

function describeError(error: unknown): Error {
  if (error instanceof Groq.AuthenticationError) {
    return new Error(
      "Authentication failed. Check GROQ_API_KEY in .env, or run with --mock to try the pipeline without a key.",
    );
  }
  if (error instanceof Groq.RateLimitError) {
    return new Error(
      `Rate limited by Groq after ${MAX_ATTEMPTS} attempts. Wait a minute and re-run, or use a smaller --cases / --batch-size.`,
    );
  }
  if (error instanceof Groq.BadRequestError) {
    return new Error(
      `Groq rejected the request: ${error.message}\n` +
        `If this mentions response_format, the model may not support strict structured outputs — ` +
        `try --model openai/gpt-oss-120b.`,
    );
  }
  if (error instanceof Groq.APIConnectionError) {
    return new Error("Could not reach the Groq API. Check your network connection.");
  }
  if (error instanceof Groq.APIError) {
    return new Error(`Groq API error ${error.status}: ${error.message}`);
  }
  return error instanceof Error ? error : new Error(String(error));
}
