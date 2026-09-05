import { Router } from "express";
import * as controller from "./assessments.controller";
import { requireUserIdentity } from "@/middleware/userIdentity";

export const assessmentsRouter = Router();

assessmentsRouter.post("/", requireUserIdentity, controller.assemble);
assessmentsRouter.get("/:id", controller.getById);
assessmentsRouter.post("/:id/attempts", requireUserIdentity, controller.startAttempt);
