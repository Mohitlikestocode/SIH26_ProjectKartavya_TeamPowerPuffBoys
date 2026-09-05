import type { Request, Response, NextFunction } from "express";
import * as service from "./attempts.service";

// Attempts controllers — thin HTTP layer over attempts.service.ts.
// TODO: implement handlers as each phase lands.
