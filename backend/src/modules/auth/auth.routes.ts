import { Router } from "express";
import { registerHandler, loginHandler, meHandler } from "./auth.controller";
import { requireAuth } from "../../middleware/auth";

export const authRouter = Router();

// Mock SSO — architecturally consistent with a future real Parichay/SSO handoff.
authRouter.post("/register", registerHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/me", requireAuth, meHandler);
