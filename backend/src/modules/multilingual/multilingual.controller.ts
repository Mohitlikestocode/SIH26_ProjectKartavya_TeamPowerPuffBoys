import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as service from "./multilingual.service";
import { ApiError } from "../../middleware/errorHandler";

// Multilingual controllers — thin HTTP layer over multilingual.service.ts.

// sarvamClient.ts/sarvamSpeech.ts throw plain Error (matches the existing generateMcq.ts
// convention in this codebase), which the global error handler turns into an opaque
// "Internal server error" — the real reason only reaches the server console. "Not configured
// yet" is a distinct, actionable case from a genuine runtime failure, and it's the state anyone
// testing this without a Sarvam key will hit first — worth surfacing as ApiError(503, ...) so the
// client actually sees why, rather than reproducing the existing opaque-500 rough edge here too.
function toApiError(err: unknown): unknown {
  if (err instanceof Error && err.message.includes("SARVAM_ENABLED")) {
    return new ApiError(503, err.message);
  }
  return err;
}

const chatSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional()
    .default([]),
});

export async function chatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = chatSchema.parse(req.body);
    const reply = await service.chatWithAssistant(input.message, input.history);
    res.json({ reply });
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : toApiError(err));
  }
}

export async function transcribeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) throw new ApiError(400, "Missing 'audio' file in the request.");

    const result = await service.transcribe(file.buffer, file.originalname, file.mimetype);
    res.json({ transcript: result.transcript, languageCode: result.languageCode });
  } catch (err) {
    next(toApiError(err));
  }
}

const speakSchema = z.object({
  text: z.string().min(1),
  languageCode: z.string().optional(),
});

export async function speakHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = speakSchema.parse(req.body);
    const result = await service.synthesize(input.text, input.languageCode);
    res.type(result.mimeType).send(result.audio);
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : toApiError(err));
  }
}
