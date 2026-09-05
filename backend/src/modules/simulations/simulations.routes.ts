import { Router } from "express";
import { listScenariosHandler, getScenarioHandler, createAssessmentHandler } from "./simulations.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const simulationsRouter = Router();

simulationsRouter.get("/scenarios", requireAuth, listScenariosHandler);
simulationsRouter.get("/scenarios/:id", requireAuth, getScenarioHandler);
simulationsRouter.post("/assessments", requireAuth, requireRole("trainer", "org_admin"), createAssessmentHandler);
