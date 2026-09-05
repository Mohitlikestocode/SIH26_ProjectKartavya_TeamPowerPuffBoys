import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import { forceKick } from "../attempts/attempts.service";
import type { ViolationType } from "@prisma/client";

// This is the actual grading-relevant logic (backend-owned), not just a demo
// gimmick. Every violation type counts equally — deliberately not sensitive:
// it takes 6 warnings before an attempt is force-submitted and kicked, so a
// single glance away or a momentary camera drop-out never ends a test.
const VIOLATION_WEIGHTS: Record<ViolationType, number> = {
  phone_detected: 1,
  multiple_faces: 1,
  no_face: 1,
  tab_switch: 1,
  fullscreen_exit: 1,
};

const KICK_THRESHOLD = 6;

export interface LogViolationInput {
  attemptId: string;
  type: ViolationType;
  requestingUserId: string;
}

export async function logViolation(input: LogViolationInput) {
  const attempt = await prisma.attempt.findUnique({ where: { id: input.attemptId } });
  if (!attempt) throw new ApiError(404, "Attempt not found");
  if (attempt.userId !== input.requestingUserId) throw new ApiError(403, "Not your attempt");
  if (attempt.status !== "in_progress") {
    // Already terminal — accept the event for the audit log but don't re-kick.
    return { violationCount: 0, weightedCount: 0, status: attempt.status };
  }

  await prisma.violationEvent.create({
    data: { attemptId: input.attemptId, type: input.type },
  });

  const events = await prisma.violationEvent.findMany({ where: { attemptId: input.attemptId } });
  const weightedCount = events.reduce((sum, e) => sum + VIOLATION_WEIGHTS[e.type], 0);

  if (weightedCount >= KICK_THRESHOLD) {
    const kicked = await forceKick(input.attemptId);
    return { violationCount: events.length, weightedCount, status: kicked.status };
  }

  return { violationCount: events.length, weightedCount, status: attempt.status };
}

// Full violation timeline per attempt — the audit-trail feature on the
// trainer/org-admin dashboard (prompt.md Phase 3, item 14).
export async function getTimeline(attemptId: string) {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { user: true, assessment: true },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found");

  const violations = await prisma.violationEvent.findMany({
    where: { attemptId },
    orderBy: { timestamp: "asc" },
  });

  return { attempt, violations };
}
