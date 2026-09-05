import type { NextFunction, Request, Response } from "express";
import * as service from "./competency.service";
import { ApiError } from "../../middleware/errorHandler";

export async function gapMapHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getGapMap(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function rankedGapsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getRankedGaps(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function myScoresHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getMyScores(req.user.id));
  } catch (err) {
    next(err);
  }
}
