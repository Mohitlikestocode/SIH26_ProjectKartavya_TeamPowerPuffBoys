import type { Request, Response, NextFunction } from "express";
import * as service from "./simulations.service";

// Simulations controllers — thin HTTP layer over simulations.service.ts.
// TODO: implement handlers as each phase lands.
