import { Router } from "express";
import { listScenariosHandler, getScenarioHandler, createAssessmentHandler, defaultAssessmentHandler } from "./simulations.controller";
import { requireAuth } from "../../middleware/auth";
import { resolveTrainerAuth } from "../../middleware/resolveTrainerAuth";

export const simulationsRouter = Router();

// Static scenario catalog metadata — no user-specific data, so it doesn't need auth (this is what
// lets the trainer create-test UI list scenarios via the same identity-header shortcut used for
// creating the assessment itself, without also requiring a JWT).
simulationsRouter.get("/scenarios", listScenariosHandler);
simulationsRouter.get("/scenarios/:id", getScenarioHandler);
// Mirrors GET /api/assessments/diagnostic — the learner-facing gate's fallback simulation.
simulationsRouter.get("/assessments/default", requireAuth, defaultAssessmentHandler);
simulationsRouter.post("/assessments", resolveTrainerAuth, createAssessmentHandler);
