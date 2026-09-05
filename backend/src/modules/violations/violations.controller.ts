import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./violations.service";
import { ApiError } from "../../middleware/errorHandler";

const violationTypes = [
  "phone_detected",
  "multiple_faces",
  "no_face",
  "tab_switch",
  "fullscreen_exit",
] as const;

const logSchema = z.object({
  attemptId: z.string(),
  type: z.enum(violationTypes),
});

export async function logHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = logSchema.parse(req.body);
    res.status(201).json(await service.logViolation({ ...input, requestingUserId: req.user.id }));
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function timelineHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.getTimeline(req.params.attemptId));
  } catch (err) {
    next(err);
  }
}
