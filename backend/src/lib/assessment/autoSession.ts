import { z } from "zod";
import { createSession } from "../../modules/sessions/sessions.service";

// Shared by assessments.controller.ts (generic + /mcq) and simulations.controller.ts so
// "create an assessment and immediately hand back a working QR" behaves identically everywhere a
// trainer can create an assessment, instead of QR/session creation staying a separate manual step.
export const autoSessionSchema = z
  .object({
    name: z.string().min(1),
    targetAudience: z.string().optional(),
    expiresInMinutes: z.number().int().positive().optional(),
  })
  .optional();

export type AutoSessionInput = z.infer<typeof autoSessionSchema>;

export async function maybeCreateSession(
  assessmentId: string,
  createdById: string,
  input: AutoSessionInput,
) {
  if (!input) return null;
  return createSession({ assessmentId, createdById, ...input });
}
