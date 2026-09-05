import { Router } from "express";
import { gapMapHandler, rankedGapsHandler, myScoresHandler } from "./competency.controller";
import { requireAuth } from "../../middleware/auth";

export const competencyRouter = Router();

// Radar-chart-ready: current vector + required vector, same axes, per domain.
competencyRouter.get("/gap-map", requireAuth, gapMapHandler);
competencyRouter.get("/gaps", requireAuth, rankedGapsHandler);
competencyRouter.get("/me", requireAuth, myScoresHandler);
