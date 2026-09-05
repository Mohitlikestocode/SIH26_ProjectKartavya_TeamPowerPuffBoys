import { Router } from "express";
import { logHandler, timelineHandler } from "./violations.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const violationsRouter = Router();

// Learner's proctoring client (TensorFlow.js coco-ssd / face-api.js, plus
// fullscreen/visibility listeners) posts events here during an active attempt.
violationsRouter.post("/", requireAuth, logHandler);
// Trainer/org-admin audit-trail view.
violationsRouter.get(
  "/:attemptId",
  requireAuth,
  requireRole("trainer", "org_admin"),
  timelineHandler,
);
