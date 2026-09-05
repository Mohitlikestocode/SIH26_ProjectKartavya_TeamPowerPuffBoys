import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as service from "./violations.service";
import { ApiError } from "@/middleware/errorHandler";

// Mirrors ViolationEventDTO.type from src/types/domains.ts.
const logSchema = z.object({
  attemptId: z.string().min(1),
  type: z.enum(["phone_detected", "multiple_faces", "no_face", "tab_switch", "fullscreen_exit"]),
});

export async function log(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const attempt = await service.logViolation(parsed.data.attemptId, parsed.data.type, req.userId!);
    res.status(201).json(attempt);
  } catch (err) {
    next(err);
  }
}
