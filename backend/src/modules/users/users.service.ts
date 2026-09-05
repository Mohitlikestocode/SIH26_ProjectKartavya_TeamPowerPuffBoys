import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";

export interface UpdateProfileInput {
  name?: string;
  designation?: string;
  department?: string;
  cadre?: string;
  state?: string;
  experienceYears?: number;
  targetRoleId?: string | null;
}

export async function listTargetRoles() {
  return prisma.targetRole.findMany({
    orderBy: { title: "asc" },
    include: { requirements: { include: { subSkill: { include: { domain: true } } } } },
  });
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.targetRoleId) {
    const role = await prisma.targetRole.findUnique({ where: { id: input.targetRoleId } });
    if (!role) throw new ApiError(400, "Unknown targetRoleId");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
  });

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
