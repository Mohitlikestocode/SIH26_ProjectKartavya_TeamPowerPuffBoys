import type { Request, Response, NextFunction } from "express";
import * as service from "./recommendations.service";

// Recommendations controllers — thin HTTP layer over recommendations.service.ts.
// TODO: implement handlers as each phase lands.
