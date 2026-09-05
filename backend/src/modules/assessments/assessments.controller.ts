import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as service from "./assessments.service";
import { ApiError } from "@/middleware/errorHandler";

const assembleSchema = z.object({
  purpose: z.enum(["diagnostic", "practice", "graded", "self_generated"]),
  title: z.string().min(1),
  questionCount: z.number().int().min(1).max(200),
  domain: z.string().min(1).optional(),
  skill: z.string().min(1).optional(),
  sourceDocumentId: z.string().min(1).optional(),
  timeLimitMinutes: z.number().int().min(1).optional(),
  passingThreshold: z.number().int().min(0).max(100).optional(),
});

export async function assemble(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = assembleSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, `Invalid request body: ${parsed.error.message}`);
    const assessment = await service.assembleAssessment({ ...parsed.data, createdBy: req.userId });
    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const assessment = await service.getAssessment(req.params.id);
    // Redact answer-revealing fields — this is the test definition, not a scored result.
    const sanitized = {
      ...assessment,
      assessmentQuestions: assessment.assessmentQuestions.map((aq) => ({
        sequence: aq.sequence,
        question: {
          id: aq.question.id,
          question: aq.question.question,
          options: aq.question.options,
          isNegatedStem: aq.question.isNegatedStem,
          domain: aq.question.domain,
          skill: aq.question.skill,
        },
      })),
    };
    res.json(sanitized);
  } catch (err) {
    next(err);
  }
}

export async function startAttempt(req: Request, res: Response, next: NextFunction) {
  try {
    const attempt = await service.startAttempt(req.params.id, req.userId!);
    res.status(201).json(attempt);
  } catch (err) {
    next(err);
  }
}
