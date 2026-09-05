import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../middleware/errorHandler";
import { startAttempt } from "../attempts/attempts.service";

interface JoinTokenPayload {
  sid: string;
}

function buildJoinUrl(sessionId: string, token: string) {
  return `${env.frontendUrl}/join/${sessionId}?token=${encodeURIComponent(token)}`;
}

function signJoinToken(sessionId: string, ttlMinutes: number) {
  return jwt.sign({ sid: sessionId } satisfies JoinTokenPayload, env.sessionJoinTokenSecret, {
    expiresIn: `${ttlMinutes}m`,
  });
}

async function withQr(session: { id: string; joinToken: string }) {
  const joinUrl = buildJoinUrl(session.id, session.joinToken);
  const qrDataUrl = await QRCode.toDataURL(joinUrl, { margin: 1, width: 320 });
  return { joinUrl, qrDataUrl };
}

export interface CreateSessionInput {
  assessmentId: string;
  name: string;
  targetAudience?: string;
  expiresInMinutes?: number;
  createdById: string;
}

// Trainer creates a session for an Assessment: generates a signed,
// short-lived join token and a QR code encoding the join URL
// `/join/{sessionId}?token=...` (prompt.md Phase 3, item 10).
export async function createSession(input: CreateSessionInput) {
  const assessment = await prisma.assessment.findUnique({ where: { id: input.assessmentId } });
  if (!assessment) throw new ApiError(404, "Assessment not found");

  const ttlMinutes = input.expiresInMinutes ?? env.sessionJoinTokenTtlMinutes;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

  // Two-step create: the join token embeds the session's own id, so the row
  // is created first with a placeholder, then patched with its real token.
  const created = await prisma.session.create({
    data: {
      name: input.name,
      assessmentId: input.assessmentId,
      createdById: input.createdById,
      targetAudience: input.targetAudience,
      joinToken: `pending-${Date.now()}`,
      expiresAt,
    },
  });

  const joinToken = signJoinToken(created.id, ttlMinutes);
  const session = await prisma.session.update({
    where: { id: created.id },
    data: { joinToken },
  });

  const { joinUrl, qrDataUrl } = await withQr(session);
  return { session, joinUrl, qrDataUrl };
}

export async function regenerateQr(sessionId: string, requestingUserId: string, requestingRole: string) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new ApiError(404, "Session not found");
  if (session.createdById !== requestingUserId && requestingRole !== "org_admin") {
    throw new ApiError(403, "Not your session");
  }

  const ttlMinutes = env.sessionJoinTokenTtlMinutes;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const joinToken = signJoinToken(session.id, ttlMinutes);

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { joinToken, expiresAt },
  });

  const { joinUrl, qrDataUrl } = await withQr(updated);
  return { session: updated, joinUrl, qrDataUrl };
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { assessment: true },
  });
  if (!session) throw new ApiError(404, "Session not found");
  const { joinUrl, qrDataUrl } = await withQr(session);
  return { session, joinUrl, qrDataUrl };
}

export async function listSessionsForTrainer(createdById: string) {
  return prisma.session.findMany({
    where: { createdById },
    include: { assessment: true, _count: { select: { attempts: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export interface JoinSessionInput {
  sessionId: string;
  token: string;
  userId: string;
}

// Scan -> validate -> attempt. This is the endpoint the QR's join URL hits:
// validate the token and expiry, then create (or resume) an Attempt so the
// frontend can redirect straight into the assessment (prompt.md Phase 3,
// item 11).
export async function joinSession(input: JoinSessionInput) {
  const session = await prisma.session.findUnique({ where: { id: input.sessionId } });
  if (!session) throw new ApiError(404, "Session not found");

  if (session.expiresAt.getTime() < Date.now()) {
    throw new ApiError(410, "This session has expired");
  }
  if (session.joinToken !== input.token) {
    throw new ApiError(401, "This QR code is no longer valid — ask your trainer for a fresh one");
  }

  try {
    const payload = jwt.verify(input.token, env.sessionJoinTokenSecret) as JoinTokenPayload;
    if (payload.sid !== session.id) throw new Error("session mismatch");
  } catch {
    throw new ApiError(401, "Invalid or expired join token");
  }

  const attempt = await startAttempt({
    assessmentId: session.assessmentId,
    userId: input.userId,
    sessionId: session.id,
  });

  const assessment = await prisma.assessment.findUnique({ where: { id: session.assessmentId } });

  return { attempt, assessment };
}
