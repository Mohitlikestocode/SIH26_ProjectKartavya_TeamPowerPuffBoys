import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./assessments.service";
import { ApiError } from "../../middleware/errorHandler";
import { prisma } from "../../config/db";

const createAssessmentSchema = z.object({
  type: z.enum(["mcq", "simulation", "diagnostic"]),
  title: z.string().min(1),
  domainTags: z.array(z.string()).default([]),
  subSkillTags: z.array(z.string()).default([]),
  questions: z.unknown().optional(),
  scenario: z.unknown().optional(),
  timeLimitSeconds: z.number().int().positive(),
  passingScore: z.number().int().min(0).max(100),
});

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = createAssessmentSchema.parse(req.body);
    res.status(201).json(await service.createAssessment(req.user.id, input));
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function getHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.getAssessment(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const mine = req.query.mine === "true";
    res.json(await service.listAssessments(mine ? req.user?.id : undefined));
  } catch (err) {
    next(err);
  }
}

export async function diagnosticHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // System-owned content — attributed to any org_admin account.
    const systemUser = await prisma.user.findFirst({ where: { role: "org_admin" } });
    if (!systemUser) throw new ApiError(500, "No org_admin account available to own system content");
    res.json(await service.getOrCreateDiagnostic(systemUser.id));
  } catch (err) {
    next(err);
  }
}
