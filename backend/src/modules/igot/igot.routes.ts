import { Router } from "express";
import { searchHandler } from "./igot.controller";
import { requireAuth } from "../../middleware/auth";

export const igotRouter = Router();

// GET /api/courses/igot?tag=Python&tag=SQL&q=data&page=1&size=20
igotRouter.get("/", requireAuth, searchHandler);
