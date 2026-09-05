import { Router } from "express";
import {
  employeeHandler,
  trainerHandler,
  heatmapHandler,
  effectivenessTrendHandler,
  violationsFeedHandler,
} from "./dashboards.controller";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";

export const dashboardsRouter = Router();

dashboardsRouter.get("/employee", requireAuth, employeeHandler);
dashboardsRouter.get("/trainer", requireAuth, requireRole("trainer", "org_admin"), trainerHandler);
dashboardsRouter.get("/admin/heatmap", requireAuth, requireRole("org_admin"), heatmapHandler);
dashboardsRouter.get("/admin/effectiveness-trend", requireAuth, requireRole("org_admin"), effectivenessTrendHandler);
dashboardsRouter.get("/admin/violations", requireAuth, requireRole("org_admin"), violationsFeedHandler);
