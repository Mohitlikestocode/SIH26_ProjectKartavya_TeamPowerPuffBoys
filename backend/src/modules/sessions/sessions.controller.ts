import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./sessions.service";
import { ApiError } from "../../middleware/errorHandler";

const createSessionSchema = z.object({
  assessmentId: z.string(),
  name: z.string().min(1),
  targetAudience: z.string().optional(),
  expiresInMinutes: z.number().int().positive().optional(),
});

const joinSchema = z.object({
  token: z.string().min(1),
});

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = createSessionSchema.parse(req.body);
    res.status(201).json(await service.createSession({ ...input, createdById: req.user.id }));
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function regenerateQrHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.regenerateQr(req.params.id, req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
}

export async function getHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.getSession(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function listMineHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.listSessionsForTrainer(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function joinHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const { token } = joinSchema.parse(req.body);
    res.json(await service.joinSession({ sessionId: req.params.id, token, userId: req.user.id }));
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}
