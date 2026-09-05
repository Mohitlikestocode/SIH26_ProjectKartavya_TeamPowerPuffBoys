import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import * as service from "./auth.service";
import { ApiError } from "../../middleware/errorHandler";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["learner", "trainer", "org_admin"]).optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  cadre: z.string().optional(),
  state: z.string().optional(),
  experienceYears: z.number().int().nonnegative().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await service.register(input);
    res.status(201).json(result);
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await service.login(input);
    res.json(result);
  } catch (err) {
    next(err instanceof z.ZodError ? new ApiError(400, err.errors[0]?.message ?? "Invalid input") : err);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new ApiError(401, "Not authenticated");
    const user = await service.me(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
