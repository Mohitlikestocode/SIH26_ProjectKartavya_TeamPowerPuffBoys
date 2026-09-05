import { Router } from "express";
import * as controller from "./violations.controller";
import { requireUserIdentity } from "@/middleware/userIdentity";

export const violationsRouter = Router();

violationsRouter.post("/", requireUserIdentity, controller.log);
