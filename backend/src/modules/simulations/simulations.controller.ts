import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./simulations.service";
import { ApiError } from "../../middleware/errorHandler";
import { autoSessionSchema, maybeCreateSession } from "../../lib/assessment/autoSession";
import { prisma } from "../../config/db";

const createFromScenarioSchema = z.object({
  scenarioId: z.string(),
  timeLimitSeconds: z.number().int().positive().optional(),
  session: autoSessionSchema,
});

export function listScenariosHandler(_req: Request, res: Response) {
  res.json(service.listScenarios());
}

export function getScenarioHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(service.getScenario(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function defaultAssessmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // System-owned content — same "attributed to any org_admin" convention as
    // assessments.controller.ts's diagnosticHandler.
    const systemUser = await prisma.user.findFirst({ where: { role: "org_admin" } });
    if (!systemUser) throw new ApiError(500, "No org_admin account available to own system content");
    res.json(await service.getOrCreateDefaultSimulation(systemUser.id));
  } catch (err) {
    next(err);
  }
}

export async function createAssessmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = createFromScenarioSchema.parse(req.body);
    const assessment = await service.createSimulationAssessment(req.user.id, input.scenarioId, input.timeLimitSeconds);
    const session = await maybeCreateSession(assessment.id, req.user.id, input.session);
    res.status(201).json(session ? { assessment, ...session } : { assessment });
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}
