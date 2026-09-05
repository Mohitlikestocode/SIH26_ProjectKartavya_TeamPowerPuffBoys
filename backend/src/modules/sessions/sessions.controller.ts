import type { Request, Response, NextFunction } from "express";
import * as service from "./sessions.service";

// Sessions/QR controllers — thin HTTP layer over sessions.service.ts.
// TODO: implement handlers as each phase lands.
