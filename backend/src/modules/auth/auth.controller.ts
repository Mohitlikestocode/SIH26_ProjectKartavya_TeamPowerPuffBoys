import type { Request, Response, NextFunction } from "express";
import * as service from "./auth.service";

// Auth controllers — thin HTTP layer over auth.service.ts.
// TODO: implement handlers as each phase lands.
