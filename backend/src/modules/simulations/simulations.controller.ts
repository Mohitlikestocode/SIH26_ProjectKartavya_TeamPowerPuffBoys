import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./simulations.service";
import { ApiError } from "../../middleware/errorHandler";

const createFromScenarioSchema = z.object({
  scenarioId: z.string(),
  timeLimitSeconds: z.number().int().positive().optional(),
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

export async function createAssessmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = createFromScenarioSchema.parse(req.body);
    res.status(201).json(
      await service.createSimulationAssessment(req.user.id, input.scenarioId, input.timeLimitSeconds),
    );
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}
