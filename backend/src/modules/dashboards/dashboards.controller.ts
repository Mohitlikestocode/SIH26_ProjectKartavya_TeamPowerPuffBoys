import type { NextFunction, Request, Response } from "express";
import * as service from "./dashboards.service";
import { ApiError } from "../../middleware/errorHandler";

export async function employeeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getEmployeeDashboard(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function trainerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getTrainerDashboard(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function heatmapHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { department, cadre, state } = req.query;
    res.json(
      await service.getWorkforceHeatmap({
        department: typeof department === "string" ? department : undefined,
        cadre: typeof cadre === "string" ? cadre : undefined,
        state: typeof state === "string" ? state : undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
}

export async function effectivenessTrendHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.getTrainingEffectivenessTrend());
  } catch (err) {
    next(err);
  }
}

export async function violationsFeedHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    res.json(await service.getRecentViolations(limit));
  } catch (err) {
    next(err);
  }
}
