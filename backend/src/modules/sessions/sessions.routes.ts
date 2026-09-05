import { Router } from "express";
import {
  createHandler,
  regenerateQrHandler,
  getHandler,
  listMineHandler,
  joinHandler,
} from "./sessions.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const sessionsRouter = Router();

sessionsRouter.post("/", requireAuth, requireRole("trainer", "org_admin"), createHandler);
sessionsRouter.get("/mine", requireAuth, requireRole("trainer", "org_admin"), listMineHandler);
sessionsRouter.get("/:id", requireAuth, getHandler);
sessionsRouter.post(
  "/:id/regenerate-qr",
  requireAuth,
  requireRole("trainer", "org_admin"),
  regenerateQrHandler,
);
// Scan -> join: any authenticated learner (post mock-SSO login) hitting the
// QR's join URL lands here.
sessionsRouter.post("/:id/join", requireAuth, joinHandler);
