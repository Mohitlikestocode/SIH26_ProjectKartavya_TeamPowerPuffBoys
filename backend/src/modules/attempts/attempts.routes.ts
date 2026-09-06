import { Router } from "express";
import { startHandler, getHandler, submitHandler, listForSessionHandler, listMineHandler } from "./attempts.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const attemptsRouter = Router();

// Direct (non-session) attempt start — e.g. the diagnostic/onboarding test.
attemptsRouter.post("/", requireAuth, startHandler);
attemptsRouter.get("/mine", requireAuth, listMineHandler);
attemptsRouter.get("/:id", requireAuth, getHandler);
attemptsRouter.post("/:id/submit", requireAuth, submitHandler);
attemptsRouter.get(
  "/session/:sessionId",
  requireAuth,
  requireRole("trainer", "org_admin"),
  listForSessionHandler,
);
