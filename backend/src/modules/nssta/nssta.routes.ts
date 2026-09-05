import { Router } from "express";
import { searchHandler } from "./nssta.controller";
import { requireAuth } from "../../middleware/auth";

export const nsstaRouter = Router();

// GET /api/courses/nssta?tag=GIS&cadre=ISS
nsstaRouter.get("/", requireAuth, searchHandler);
