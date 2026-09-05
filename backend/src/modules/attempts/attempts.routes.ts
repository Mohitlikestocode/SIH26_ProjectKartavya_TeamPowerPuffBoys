import { Router } from "express";
import * as controller from "./attempts.controller";
import { requireUserIdentity } from "@/middleware/userIdentity";

export const attemptsRouter = Router();

attemptsRouter.get("/:id", requireUserIdentity, controller.getById);
attemptsRouter.post("/:id/answers", requireUserIdentity, controller.submitAnswer);
attemptsRouter.post("/:id/submit", requireUserIdentity, controller.submit);
