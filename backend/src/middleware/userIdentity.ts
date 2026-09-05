import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";

// PLACEHOLDER identity mechanism — same pattern as src/middleware/adminIdentity.ts. There is no
// User model or real auth yet (src/modules/auth is a stub, and src/middleware/auth.ts's JWT
// verification has nothing issuing real tokens against a real user table). Callers self-report
// who they are via `x-user-id`; nothing here verifies that claim. Replace with real
// authentication once the Auth module exists, and consider migrating Attempt.userId /
// Assessment.createdBy to a foreign key at that point.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireUserIdentity(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header("x-user-id");
  if (!userId || !userId.trim()) {
    return next(new ApiError(400, "Missing 'x-user-id' header — required to identify who this attempt belongs to (placeholder until real auth exists)."));
  }
  req.userId = userId.trim();
  next();
}
