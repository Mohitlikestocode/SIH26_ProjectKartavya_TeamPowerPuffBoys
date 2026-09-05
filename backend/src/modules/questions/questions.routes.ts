import { Router } from "express";
import * as controller from "./questions.controller";
import { requireAdminIdentity } from "@/middleware/adminIdentity";

export const questionsRouter = Router();

questionsRouter.get("/", controller.list);
questionsRouter.get("/:id", controller.getById);
questionsRouter.post("/", requireAdminIdentity, controller.createManual);
questionsRouter.patch("/:id", requireAdminIdentity, controller.edit);
questionsRouter.post("/:id/approve", requireAdminIdentity, controller.approve);
questionsRouter.post("/:id/reject", requireAdminIdentity, controller.reject);
