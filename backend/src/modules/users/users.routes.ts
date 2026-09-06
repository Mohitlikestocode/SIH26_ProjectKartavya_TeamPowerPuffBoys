import { Router } from "express";
import { listTargetRolesHandler, updateProfileHandler } from "./users.controller";
import { requireAuth } from "../../middleware/auth";

export const usersRouter = Router();

// Static catalog metadata, no user-specific data — public for the same reason
// simulations' /scenarios is (lets the trainer create-test UI list it via the
// x-admin-id shortcut without also requiring a JWT).
usersRouter.get("/target-roles", listTargetRolesHandler);
usersRouter.patch("/me", requireAuth, updateProfileHandler);
