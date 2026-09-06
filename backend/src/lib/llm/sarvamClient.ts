import { env } from "@/config/env";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface JsonSchemaResponseFormat {
  type: "json_schema";
  json_schema: { name: string; schema: Record<string, unknown>; strict?: boolean };
}

export interface ChatCompletionParams {
  messages: ChatMessage[];
  responseFormat: JsonSchemaResponseFormat;
  temperature?: number;
  maxTokens?: number;
}

// Sarvam's chat-completions API is OpenAI-compatible: POST /v1/chat/completions, bearer auth,
// choices[0].message.content holds the assistant text. See docs.sarvam.ai/api-reference/chat.
//
// sarvam-105b has "thinking" mode ON by default (reasoning_effort defaults to "medium"), which
// spends part of max_tokens on a separate reasoning_content field before writing the actual
// answer. With a small/default max_tokens this can exhaust the budget on reasoning and return
// finish_reason="length" with content=null. We don't want chain-of-thought for a deterministic
// structured-JSON task anyway, so reasoning is explicitly disabled (reasoning_effort: null) per
// docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview, rather than just raising
// max_tokens and hoping reasoning doesn't eat it again.
export async function chatCompletion({
  messages,
  responseFormat,
  temperature = 0.4,
  maxTokens = 2048,
}: ChatCompletionParams): Promise<string> {
  if (!env.sarvamEnabled) {
    throw new Error("Sarvam LLM calls are disabled (set SARVAM_ENABLED=true and SARVAM_API_KEY to enable generation).");
  }

  const res = await fetch(`${env.sarvamBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.sarvamApiKey}`,
      "api-subscription-key": env.sarvamApiKey,
    },
    body: JSON.stringify({
      model: env.sarvamModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      reasoning_effort: null,
      response_format: responseFormat,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sarvam chat completion failed: ${res.status} ${res.statusText} — ${body}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Sarvam chat completion returned no content.");
  return content;
}

export interface ChatTextParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

// Same endpoint as chatCompletion(), without response_format — for open-ended conversational
// replies (the assistant chatbot) rather than the structured-JSON extraction chatCompletion()
// is built for. Kept separate rather than making responseFormat optional on chatCompletion() so
// neither caller's contract changes: generateMcq.ts still gets a schema-guaranteed response,
// and this one gets plain text.
export async function chatText({ messages, temperature = 0.5, maxTokens = 600 }: ChatTextParams): Promise<string> {
  if (!env.sarvamEnabled) {
    throw new Error("Sarvam LLM calls are disabled (set SARVAM_ENABLED=true and SARVAM_API_KEY to enable the assistant).");
  }

  const res = await fetch(`${env.sarvamBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.sarvamApiKey}`,
      "api-subscription-key": env.sarvamApiKey,
    },
    body: JSON.stringify({
      model: env.sarvamModel,
      messages,
      temperature,
      max_tokens: maxTokens,
      // Chat replies should be direct, not preceded by hidden chain-of-thought eating the token
      // budget — same reasoning as chatCompletion() above.
      reasoning_effort: null,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sarvam chat completion failed: ${res.status} ${res.statusText} — ${body}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Sarvam chat completion returned no content.");
  return content;
}
