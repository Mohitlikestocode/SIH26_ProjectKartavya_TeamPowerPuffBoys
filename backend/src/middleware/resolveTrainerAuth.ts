import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { ApiError } from "./errorHandler";
import type { AuthUser } from "./auth";

const TRAINER_ROLES: AuthUser["role"][] = ["trainer", "org_admin"];

// Trainer-side test/session creation needs a real User.id — Assessment.createdById and
// Session.createdById are foreign keys, unlike QuestionEditLog.editedBy (a free string, which is
// why requireAdminIdentity can get away with trusting the raw header). This accepts either a real
// JWT (same as requireAuth + requireRole) or the same "x-admin-id" header TrainerStudio.jsx
// already sends, resolved against the real User table so a bad/unknown id fails loudly instead of
// violating the FK at write time.
export async function resolveTrainerAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice("Bearer ".length), env.jwtSecret) as AuthUser;
      if (!TRAINER_ROLES.includes(payload.role)) {
        return next(new ApiError(403, `Requires role: ${TRAINER_ROLES.join(" or ")}`));
      }
      req.user = payload;
      return next();
    } catch {
      return next(new ApiError(401, "Invalid or expired token"));
    }
  }

  const adminId = req.header("x-admin-id")?.trim();
  if (!adminId) {
    return next(new ApiError(401, "Not authenticated — provide a bearer token or 'x-admin-id' header"));
  }

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ id: adminId }, { email: adminId }] },
    });
    if (!user) throw new ApiError(401, `No user found for 'x-admin-id: ${adminId}'`);
    if (!TRAINER_ROLES.includes(user.role)) {
      throw new ApiError(403, `Requires role: ${TRAINER_ROLES.join(" or ")}`);
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}
