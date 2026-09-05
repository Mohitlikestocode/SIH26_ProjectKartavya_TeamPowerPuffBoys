import type { NextFunction, Request, Response } from "express";
import * as service from "./recommendations.service";
import { ApiError } from "../../middleware/errorHandler";

export async function myRecommendationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    res.json(await service.getRecommendations(req.user.id));
  } catch (err) {
    next(err);
  }
}
