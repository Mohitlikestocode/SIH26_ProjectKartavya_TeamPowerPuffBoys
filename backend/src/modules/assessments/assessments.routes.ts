import { Router } from "express";
import { createHandler, getHandler, listHandler, diagnosticHandler } from "./assessments.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const assessmentsRouter = Router();

assessmentsRouter.get("/diagnostic", requireAuth, diagnosticHandler);
assessmentsRouter.post("/", requireAuth, requireRole("trainer", "org_admin"), createHandler);
assessmentsRouter.get("/", requireAuth, listHandler);
assessmentsRouter.get("/:id", requireAuth, getHandler);
