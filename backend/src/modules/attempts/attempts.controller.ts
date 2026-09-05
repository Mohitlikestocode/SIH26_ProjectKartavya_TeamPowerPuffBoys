import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as service from "./attempts.service";
import { ApiError } from "@/middleware/errorHandler";

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const state = await service.getAttemptState(req.params.id, req.userId!);
    res.json(state);
  } catch (err) {
    next(err);
  }
}

const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export async function submitAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = submitAnswerSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const answer = await service.submitAnswer(
      req.params.id,
      parsed.data.questionId,
      parsed.data.selectedOptionIndex,
      req.userId!
    );
    res.status(201).json(answer);
  } catch (err) {
    next(err);
  }
}

export async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.submitAttempt(req.params.id, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
