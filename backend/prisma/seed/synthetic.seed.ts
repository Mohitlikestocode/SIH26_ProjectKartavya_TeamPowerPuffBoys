import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Synthetic workforce data so the Phase 5 dashboards (org-wide heatmap,
// training-effectiveness trend) have real volume to aggregate instead of
// an empty state — not meant to represent real officials. Idempotent:
// re-running upserts the same deterministic set of synthetic emails.

const CADRES = ["ISS", "SSS", "State DES", "MoSPI/NSO"];
const STATES = ["Delhi", "Uttar Pradesh", "Maharashtra", "Karnataka", "West Bengal", "Tamil Nadu"];
const DEPARTMENTS = ["MoSPI", "NSSTA", "State DES Office", "NSO Field Operations"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export async function seedSyntheticWorkforce(prisma: PrismaClient, count = 40) {
  const targetRoles = await prisma.targetRole.findMany({
    include: { requirements: { include: { subSkill: true } } },
  });
  if (!targetRoles.length) {
    console.warn("  ! no target roles found — run seedTargetRoles first, skipping synthetic workforce");
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const rnd = seededRandom(42);
  const users: { id: string; targetRole: (typeof targetRoles)[number] }[] = [];

  for (let i = 0; i < count; i++) {
    const cadre = CADRES[i % CADRES.length];
    const state = STATES[i % STATES.length];
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const targetRole = targetRoles[i % targetRoles.length];
    const email = `synthetic.learner${i + 1}@kartavya.gov.in`;

    const user = await prisma.user.upsert({
      where: { email },
      update: { targetRoleId: targetRole.id, cadre, state, department },
      create: {
        email,
        passwordHash,
        name: `Synthetic Learner ${i + 1}`,
        role: "learner",
        designation: "Assistant Director",
        department,
        cadre,
        state,
        experienceYears: 1 + Math.floor(rnd() * 15),
        targetRoleId: targetRole.id,
      },
    });
    users.push({ id: user.id, targetRole });
  }

  // Competency scores: skew below the target role's requirement so gaps
  // exist to visualize (a workforce that's already fully qualified makes
  // for a boring heatmap and defeats the point of the demo).
  for (const { id: userId, targetRole } of users) {
    for (const req of targetRole.requirements) {
      const deficit = 10 + Math.floor(rnd() * 35); // 10-45 points below requirement
      const level = Math.max(5, Math.min(100, req.requiredLevel - deficit));
      await prisma.userCompetencyScore.upsert({
        where: { userId_subSkillId: { userId, subSkillId: req.subSkillId } },
        update: { level, source: "seed" },
        create: { userId, subSkillId: req.subSkillId, level, source: "seed" },
      });
    }
  }

  // A handful of submitted Attempts per user, spread over the past ~10
  // weeks with a mild upward trend, so the training-effectiveness trend
  // endpoint has something to show besides a flat line.
  const diagnostic = await prisma.assessment.findFirst({ where: { title: "Baseline Diagnostic" } });
  if (diagnostic) {
    for (const { id: userId } of users) {
      const attemptsForUser = 2 + Math.floor(rnd() * 3);
      for (let a = 0; a < attemptsForUser; a++) {
        const weeksAgo = (attemptsForUser - a) * 2 + Math.floor(rnd() * 2);
        const submittedAt = new Date(Date.now() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
        const baseScore = 40 + Math.floor(rnd() * 25);
        const trendBoost = (attemptsForUser - 1 - a) * -4; // earlier attempts score lower
        const score = Math.max(10, Math.min(100, baseScore - trendBoost));

        const existing = await prisma.attempt.findFirst({
          where: { userId, assessmentId: diagnostic.id, submittedAt },
        });
        if (existing) continue;

        await prisma.attempt.create({
          data: {
            userId,
            assessmentId: diagnostic.id,
            status: "submitted",
            score,
            perDomainScore: { Statistical: score, Technical: score - 5, "Digital Governance": score - 10 },
            perSubSkillScore: {},
            startedAt: new Date(submittedAt.getTime() - 20 * 60 * 1000),
            submittedAt,
          },
        });
      }
    }
  } else {
    console.warn("  ! no diagnostic assessment found — run seed/index.ts's full flow first for synthetic attempts");
  }

  console.log(`Seeded ${users.length} synthetic learners with competency scores${diagnostic ? " and attempt history" : ""}`);
}
