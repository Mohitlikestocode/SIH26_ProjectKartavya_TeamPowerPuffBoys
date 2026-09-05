import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";

// PLACEHOLDER identity mechanism — there is no auth/user model yet (src/modules/auth is a stub).
// Callers self-report who they are via the `x-admin-id` header; nothing here verifies that claim.
// A real implementation must replace this with an authenticated session/JWT and a lookup against
// an actual User model, and QuestionEditLog.editedBy should become a foreign key at that point.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

export function requireAdminIdentity(req: Request, _res: Response, next: NextFunction) {
  const adminId = req.header("x-admin-id");
  if (!adminId || !adminId.trim()) {
    return next(new ApiError(400, "Missing 'x-admin-id' header — required to identify who is making this change (placeholder until real auth exists)."));
  }
  req.adminId = adminId.trim();
  next();
}
