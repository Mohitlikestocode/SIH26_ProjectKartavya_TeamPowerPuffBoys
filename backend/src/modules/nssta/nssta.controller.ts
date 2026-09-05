import type { Request, Response, NextFunction } from "express";
import * as service from "./nssta.service";

// NSSTA/TPAC controllers — thin HTTP layer over nssta.service.ts.
// TODO: implement handlers as each phase lands.
