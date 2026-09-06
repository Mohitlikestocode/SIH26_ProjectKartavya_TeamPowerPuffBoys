import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./assessments.service";
import { ApiError } from "../../middleware/errorHandler";
import { prisma } from "../../config/db";
import { autoSessionSchema, maybeCreateSession } from "../../lib/assessment/autoSession";

const createAssessmentSchema = z.object({
  type: z.enum(["mcq", "simulation", "diagnostic"]),
  title: z.string().min(1),
  domainTags: z.array(z.string()).default([]),
  subSkillTags: z.array(z.string()).default([]),
  questions: z.unknown().optional(),
  scenario: z.unknown().optional(),
  timeLimitSeconds: z.number().int().positive(),
  passingScore: z.number().int().min(0).max(100),
  isProctored: z.boolean().default(false),
  session: autoSessionSchema,
});

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const { session: sessionInput, ...input } = createAssessmentSchema.parse(req.body);
    const assessment = await service.createAssessment(req.user.id, input);
    const session = await maybeCreateSession(assessment.id, req.user.id, sessionInput);
    res.status(201).json(session ? { assessment, ...session } : { assessment });
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

const createMcqAssessmentSchema = z.object({
  title: z.string().min(1),
  targetRoleId: z.string().optional(),
  domainTags: z.array(z.string()).optional(),
  subSkillTags: z.array(z.string()).optional(),
  count: z.number().int().positive(),
  timeLimitSeconds: z.number().int().positive(),
  passingScore: z.number().int().min(0).max(100),
  isProctored: z.boolean().default(false),
  session: autoSessionSchema,
});

// Trainer-facing "build a general MCQ test from the bank, optionally scoped to a designation,
// and hand back a working QR in one call" — the flow the trainer actually wants, instead of
// hand-assembling `questions` JSON and creating a session as two separate manual steps.
export async function createMcqHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const { session: sessionInput, ...input } = createMcqAssessmentSchema.parse(req.body);
    const assessment = await service.assembleMcqAssessment(req.user.id, input);
    const session = await maybeCreateSession(assessment.id, req.user.id, sessionInput);
    res.status(201).json(session ? { assessment, ...session } : { assessment });
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
    if (!req.user) throw new ApiError(401, "Not authenticated");
    // System-owned content — attributed to any org_admin account.
    const systemUser = await prisma.user.findFirst({ where: { role: "org_admin" } });
    if (!systemUser) throw new ApiError(500, "No org_admin account available to own system content");
<<<<<<< HEAD

    // The diagnostic is scoped to the caller's own target role where one has been authored.
    const caller = req.user
      ? await prisma.user.findUnique({ where: { id: req.user.id }, include: { targetRole: true } })
      : null;

    res.json(await service.getOrCreateDiagnostic(systemUser.id, caller?.targetRole?.title ?? null));
=======
    // The requesting learner's own target role decides whether they get the curated,
    // designation-specific diagnostic or the generic fallback — see getOrCreateDiagnostic.
    const requestingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json(await service.getOrCreateDiagnostic(systemUser.id, requestingUser?.targetRoleId));
>>>>>>> origin/main
  } catch (err) {
    next(err);
  }
}
