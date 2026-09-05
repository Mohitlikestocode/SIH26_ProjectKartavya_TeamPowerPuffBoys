// Violations/Proctoring business logic — logs a basic anti-cheat event against an attempt.
// Intentionally simple (a timestamped log row + a running count on Attempt) per Phase 3 scope —
// no elaborate proctoring, scoring impact, or auto-kick logic here.
import { prisma } from "@/config/db";
import { ApiError } from "@/middleware/errorHandler";
import type { Attempt } from "@prisma/client";

export async function logViolation(attemptId: string, type: string, requestingUserId: string): Promise<Attempt> {
  const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new ApiError(404, "Attempt not found.");
  if (attempt.userId !== requestingUserId) {
    throw new ApiError(403, "Cannot log a violation event against another user's attempt.");
  }

  const [, updated] = await prisma.$transaction([
    prisma.attemptViolationEvent.create({ data: { attemptId, type } }),
    prisma.attempt.update({ where: { id: attemptId }, data: { violationCount: { increment: 1 } } }),
  ]);
  return updated;
}
