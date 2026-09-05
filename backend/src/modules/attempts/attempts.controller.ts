import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./attempts.service";
import { ApiError } from "../../middleware/errorHandler";

const startSchema = z.object({
  assessmentId: z.string(),
});

const submitSchema = z.object({
  answers: z.unknown(),
  externalScore: z
    .object({
      score: z.number().min(0).max(100),
      perDomainScore: z.record(z.number()).optional(),
      perSubSkillScore: z.record(z.number()).optional(),
    })
    .optional(),
});

export async function startHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const { assessmentId } = startSchema.parse(req.body);
    res.status(201).json(await service.startAttempt({ assessmentId, userId: req.user.id }));
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function getHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getAttempt(req.params.id, req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
}

export async function submitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = submitSchema.parse(req.body);
    res.json(
      await service.submitAttempt({
        attemptId: req.params.id,
        requestingUserId: req.user.id,
        answers: input.answers,
        externalScore: input.externalScore,
      }),
    );
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function listForSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.listAttemptsForSession(req.params.sessionId));
  } catch (err) {
    next(err);
  }
}
