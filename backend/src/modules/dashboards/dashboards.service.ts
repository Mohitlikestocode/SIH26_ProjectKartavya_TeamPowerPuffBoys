import { prisma } from "../../config/db";
import { getGapMap, getRankedGaps } from "../competency/competency.service";
import { getRecommendations } from "../recommendations/recommendations.service";

// ---------------------------------------------------------------------------
// Employee dashboard (prompt.md Phase 5, item 19)
// ---------------------------------------------------------------------------

export async function getEmployeeDashboard(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { targetRole: true } });

  const [gapMap, rankedGaps, recommendations, activeAttempts, history] = await Promise.all([
    user?.targetRoleId ? getGapMap(userId) : Promise.resolve([]),
    user?.targetRoleId ? getRankedGaps(userId) : Promise.resolve([]),
    user?.targetRoleId ? getRecommendations(userId) : Promise.resolve([]),
    prisma.attempt.findMany({
      where: { userId, status: "in_progress" },
      include: { assessment: true, session: true },
      orderBy: { startedAt: "desc" },
    }),
    prisma.attempt.findMany({
      where: { userId, status: { in: ["submitted", "kicked"] } },
      include: { assessment: { select: { title: true, type: true } } },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const attemptedAssessmentIds = new Set(
    [...activeAttempts, ...history].map((a) => a.assessmentId),
  );
  const availableAssessments = await prisma.assessment.findMany({
    where: { id: { notIn: Array.from(attemptedAssessmentIds) } },
    select: { id: true, title: true, type: true, isProctored: true, timeLimitSeconds: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    targetRole: user?.targetRole ? { id: user.targetRole.id, title: user.targetRole.title } : null,
    gapMap,
    rankedGaps,
    recommendations,
    activeAttempts,
    // Progress history / score trend — chronological, chart-ready as-is.
    progressHistory: history.map((a) => ({
      attemptId: a.id,
      title: a.assessment.title,
      type: a.assessment.type,
      score: a.score,
      status: a.status,
      submittedAt: a.submittedAt,
    })),
    availableAssessments,
  };
}

// ---------------------------------------------------------------------------
// Trainer dashboard
// ---------------------------------------------------------------------------

export async function getTrainerDashboard(trainerId: string) {
  const [assessments, sessions] = await Promise.all([
    prisma.assessment.findMany({ where: { createdById: trainerId }, orderBy: { createdAt: "desc" } }),
    prisma.session.findMany({
      where: { createdById: trainerId },
      include: { assessment: true, _count: { select: { attempts: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return { assessments, sessions };
}

// ---------------------------------------------------------------------------
// Org admin dashboard (prompt.md Phase 5, item 20)
// ---------------------------------------------------------------------------

export interface HeatmapFilters {
  department?: string;
  cadre?: string;
  state?: string;
}

// Workforce-wide competency heatmap: rows = cadre, columns = domain, value =
// average gap (requiredLevel - currentLevel, floored at 0) across every
// learner in that cadre who has a target role set. Filterable by
// department/cadre/state.
export async function getWorkforceHeatmap(filters: HeatmapFilters) {
  const learners = await prisma.user.findMany({
    where: {
      role: "learner",
      targetRoleId: { not: null },
      ...(filters.department ? { department: filters.department } : {}),
      ...(filters.cadre ? { cadre: filters.cadre } : {}),
      ...(filters.state ? { state: filters.state } : {}),
    },
    select: { id: true, cadre: true, targetRoleId: true },
  });

  const domains = await prisma.competencyDomain.findMany({ orderBy: { name: "asc" } });
  const cadreGroups = new Map<string, string[]>(); // cadre -> userIds
  for (const l of learners) {
    const cadre = l.cadre ?? "Unspecified";
    if (!cadreGroups.has(cadre)) cadreGroups.set(cadre, []);
    cadreGroups.get(cadre)!.push(l.id);
  }

  const rows = [];
  for (const [cadre, userIds] of cadreGroups.entries()) {
    const domainGapSums: Record<string, { sum: number; n: number }> = {};
    for (const domain of domains) domainGapSums[domain.name] = { sum: 0, n: 0 };

    for (const userId of userIds) {
      const gapMap = await getGapMap(userId).catch(() => []);
      for (const dg of gapMap) {
        if (!domainGapSums[dg.domain]) domainGapSums[dg.domain] = { sum: 0, n: 0 };
        domainGapSums[dg.domain].sum += dg.gap;
        domainGapSums[dg.domain].n += 1;
      }
    }

    rows.push({
      cadre,
      count: userIds.length,
      domainGaps: Object.fromEntries(
        Object.entries(domainGapSums).map(([domain, { sum, n }]) => [domain, n ? Math.round(sum / n) : 0]),
      ),
    });
  }

  return { domains: domains.map((d) => d.name), rows };
}

// Training-effectiveness trend: average submitted-attempt score, bucketed by
// month. A direct "score improvement specifically attributable to a given
// recommendation" isn't tracked yet (would need a recommendation ->
// enrollment -> re-attempt linkage this backend doesn't record), so this is
// the honest proxy: is the workforce's average score trending up over time.
export async function getTrainingEffectivenessTrend() {
  const attempts = await prisma.attempt.findMany({
    where: { status: "submitted", submittedAt: { not: null }, score: { not: null } },
    select: { score: true, submittedAt: true },
    orderBy: { submittedAt: "asc" },
  });

  const buckets = new Map<string, { sum: number; n: number }>();
  for (const a of attempts) {
    const d = a.submittedAt as Date;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, { sum: 0, n: 0 });
    const b = buckets.get(key)!;
    b.sum += a.score as number;
    b.n += 1;
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { sum, n }]) => ({ month, averageScore: Math.round(sum / n), attemptCount: n }));
}

// Org-wide violation/audit-trail feed — most recent first, across every
// attempt, not just one (prompt.md Phase 3 item 14 / Phase 5 item 20).
export async function getRecentViolations(limit = 50) {
  return prisma.violationEvent.findMany({
    take: limit,
    orderBy: { timestamp: "desc" },
    include: {
      attempt: {
        select: {
          id: true,
          status: true,
          user: { select: { id: true, name: true, email: true } },
          assessment: { select: { id: true, title: true } },
        },
      },
    },
  });
}
