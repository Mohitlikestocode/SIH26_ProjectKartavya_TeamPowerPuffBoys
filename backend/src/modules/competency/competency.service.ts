import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";

export interface SubSkillGap {
  subSkillId: string;
  subSkill: string;
  domain: string;
  current: number;
  required: number;
  gap: number; // required - current, floored at 0
}

export interface DomainGap {
  domain: string;
  current: number; // average current across the domain's required sub-skills
  required: number; // average required
  gap: number;
  subSkills: SubSkillGap[];
}

// Gap-scoring service: given a user's current competency scores and their
// target role's required vector, compute per-sub-skill and per-domain gap.
// Radar-chart-ready: current vector + required vector, same axes.
export async function getGapMap(userId: string): Promise<DomainGap[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");
  if (!user.targetRoleId) {
    throw new ApiError(400, "Set a target role before requesting a gap map");
  }

  const requirements = await prisma.roleCompetencyRequirement.findMany({
    where: { targetRoleId: user.targetRoleId },
    include: { subSkill: { include: { domain: true } } },
  });

  const scores = await prisma.userCompetencyScore.findMany({ where: { userId } });
  const scoreBySubSkill = new Map(scores.map((s) => [s.subSkillId, s.level]));

  const byDomain = new Map<string, SubSkillGap[]>();

  for (const req of requirements) {
    const current = scoreBySubSkill.get(req.subSkillId) ?? 0;
    const gap = Math.max(0, req.requiredLevel - current);
    const domainName = req.subSkill.domain.name;

    const entry: SubSkillGap = {
      subSkillId: req.subSkillId,
      subSkill: req.subSkill.name,
      domain: domainName,
      current,
      required: req.requiredLevel,
      gap,
    };

    if (!byDomain.has(domainName)) byDomain.set(domainName, []);
    byDomain.get(domainName)!.push(entry);
  }

  const avg = (nums: number[]) => (nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0);

  return Array.from(byDomain.entries()).map(([domain, subSkills]) => ({
    domain,
    current: avg(subSkills.map((s) => s.current)),
    required: avg(subSkills.map((s) => s.required)),
    gap: avg(subSkills.map((s) => s.gap)),
    subSkills: subSkills.sort((a, b) => b.gap - a.gap),
  }));
}

// Flat, gap-descending list — used by the recommendation engine to decide
// what to recommend against, and by the dashboard's "top gaps" widget.
export async function getRankedGaps(userId: string): Promise<SubSkillGap[]> {
  const domainGaps = await getGapMap(userId);
  return domainGaps
    .flatMap((d) => d.subSkills)
    .filter((s) => s.gap > 0)
    .sort((a, b) => b.gap - a.gap);
}

export async function getMyScores(userId: string) {
  return prisma.userCompetencyScore.findMany({
    where: { userId },
    include: { subSkill: { include: { domain: true } } },
  });
}
