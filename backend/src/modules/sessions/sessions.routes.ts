import { Router } from "express";
import {
  createHandler,
  regenerateQrHandler,
  getHandler,
  listMineHandler,
  joinHandler,
} from "./sessions.controller";
import { requireAuth } from "../../middleware/auth";
import { resolveTrainerAuth } from "../../middleware/resolveTrainerAuth";

export const sessionsRouter = Router();

sessionsRouter.post("/", resolveTrainerAuth, createHandler);
sessionsRouter.get("/mine", resolveTrainerAuth, listMineHandler);
sessionsRouter.get("/:id", requireAuth, getHandler);
sessionsRouter.post("/:id/regenerate-qr", resolveTrainerAuth, regenerateQrHandler);
// Scan -> join: any authenticated learner (post mock-SSO login) hitting the
// QR's join URL lands here.
sessionsRouter.post("/:id/join", requireAuth, joinHandler);
