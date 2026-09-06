import { env } from "@/config/env";

// Speech endpoints are Sarvam-native REST, at the API root — unlike chatCompletion()/chatText()
// in sarvamClient.ts, which hit an OpenAI-compatible path under env.sarvamBaseUrl (".../v1").
// Hardcoded rather than derived from sarvamBaseUrl so changing the chat base (e.g. a proxy, a
// different API version) can never silently redirect speech calls too.
const STT_URL = "https://api.sarvam.ai/speech-to-text";
const TTS_URL = "https://api.sarvam.ai/text-to-speech";

function requireEnabled() {
  if (!env.sarvamEnabled) {
    throw new Error("Sarvam speech calls are disabled (set SARVAM_ENABLED=true and SARVAM_API_KEY to enable voice).");
  }
}

function authHeaders(): Record<string, string> {
  // Docs specify api-subscription-key; Authorization is sent too for consistency with
  // sarvamClient.ts and because it costs nothing if the API only reads one of the two.
  return {
    "api-subscription-key": env.sarvamApiKey,
    Authorization: `Bearer ${env.sarvamApiKey}`,
  };
}

export interface TranscribeResult {
  transcript: string;
  languageCode: string | null;
}

/**
 * Speech-to-text via Sarvam's Saaras model. `languageCode` in BCP-47 form (e.g. "hi-IN"), or
 * omitted to let Sarvam auto-detect — the assistant doesn't know what language a voice note is
 * in before transcribing it, so auto-detect is the normal case here.
 */
export async function transcribeAudio(opts: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  languageCode?: string;
}): Promise<TranscribeResult> {
  requireEnabled();

  const form = new FormData();
  form.append("file", new Blob([opts.buffer], { type: opts.mimeType }), opts.filename);
  form.append("model", "saaras:v3");
  form.append("language_code", opts.languageCode ?? "unknown");

  const res = await fetch(STT_URL, { method: "POST", headers: authHeaders(), body: form });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sarvam speech-to-text failed: ${res.status} ${res.statusText} — ${body}`);
  }

  const data = (await res.json()) as { transcript?: string; language_code?: string | null };
  if (!data.transcript?.trim()) throw new Error("Sarvam speech-to-text returned no transcript — audio may be silent or unclear.");

  return { transcript: data.transcript, languageCode: data.language_code ?? null };
}

export interface SynthesizeResult {
  audio: Buffer;
  mimeType: string;
}

// bulbul:v2 was Sarvam's default when this was written; it was deprecated shortly after (confirmed
// live — Sarvam now rejects it with 400 "please use bulbul:v3 instead"). v3's limit is 2500 chars.
const MAX_TTS_CHARS = 2500;

/**
 * Text-to-speech via Sarvam's Bulbul model. Unlike STT, TTS has no auto-detect — the target
 * language must be named explicitly, so the caller passes through whatever language the
 * conversation is actually in (the language the user typed or spoke in), defaulting to Indian
 * English when nothing else is known.
 */
export async function synthesizeSpeech(text: string, languageCode = "en-IN"): Promise<SynthesizeResult> {
  requireEnabled();

  const trimmed = text.trim().slice(0, MAX_TTS_CHARS);
  if (!trimmed) throw new Error("Cannot synthesize empty text.");

  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      text: trimmed,
      language_code: languageCode,
      model: "bulbul:v3",
      output_audio_codec: "wav",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sarvam text-to-speech failed: ${res.status} ${res.statusText} — ${body}`);
  }

  const data = (await res.json()) as { audios?: string[] };
  const base64 = data.audios?.[0];
  if (!base64) throw new Error("Sarvam text-to-speech returned no audio.");

  return { audio: Buffer.from(base64, "base64"), mimeType: "audio/wav" };
}
