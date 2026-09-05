import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./users.service";
import { ApiError } from "../../middleware/errorHandler";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  cadre: z.string().optional(),
  state: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  targetRoleId: z.string().nullable().optional(),
});

export async function listTargetRolesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.listTargetRoles());
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const input = updateProfileSchema.parse(req.body);
    res.json(await service.updateProfile(req.user.id, input));
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}
