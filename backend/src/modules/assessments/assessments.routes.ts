import { Router } from "express";
import { createHandler, createMcqHandler, getHandler, listHandler, diagnosticHandler } from "./assessments.controller";
import { requireAuth } from "../../middleware/auth";
import { resolveTrainerAuth } from "../../middleware/resolveTrainerAuth";

export const assessmentsRouter = Router();

assessmentsRouter.get("/diagnostic", requireAuth, diagnosticHandler);
assessmentsRouter.post("/", resolveTrainerAuth, createHandler);
assessmentsRouter.post("/mcq", resolveTrainerAuth, createMcqHandler);
assessmentsRouter.get("/", requireAuth, listHandler);
assessmentsRouter.get("/:id", requireAuth, getHandler);
