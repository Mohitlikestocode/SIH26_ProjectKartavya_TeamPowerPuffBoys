import { Router } from "express";
import { myRecommendationsHandler } from "./recommendations.controller";
import { requireAuth } from "../../middleware/auth";

export const recommendationsRouter = Router();

recommendationsRouter.get("/me", requireAuth, myRecommendationsHandler);
