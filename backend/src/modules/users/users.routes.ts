import { Router } from "express";
import { listTargetRolesHandler, updateProfileHandler } from "./users.controller";
import { requireAuth } from "../../middleware/auth";

export const usersRouter = Router();

usersRouter.get("/target-roles", requireAuth, listTargetRolesHandler);
usersRouter.patch("/me", requireAuth, updateProfileHandler);
