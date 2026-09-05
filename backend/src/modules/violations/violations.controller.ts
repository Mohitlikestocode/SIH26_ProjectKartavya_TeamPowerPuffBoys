import type { Request, Response, NextFunction } from "express";
import * as service from "./violations.service";

// Violations/Proctoring controllers — thin HTTP layer over violations.service.ts.
// TODO: implement handlers as each phase lands.
