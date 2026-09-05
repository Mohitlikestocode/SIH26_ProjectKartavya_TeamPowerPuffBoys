import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";
import type { AuthUser } from "./auth";

export function requireRole(...roles: AuthUser["role"][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Requires role: ${roles.join(" or ")}`));
    }
    next();
  };
}
