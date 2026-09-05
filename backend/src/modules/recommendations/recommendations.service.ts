import { prisma } from "../../config/db";
import { ApiError } from "../../middleware/errorHandler";
import { getRankedGaps, type SubSkillGap } from "../competency/competency.service";

export interface RecommendationCandidate {
  source: "iGOT Karmayogi" | "NSSTA/TPAC";
  id: string;
  title: string;
  tags: string[];
  score: number;
  why: string;
}

export interface GapRecommendations {
  subSkill: string;
  domain: string;
  gap: number;
  candidates: RecommendationCandidate[];
}

// Rules-based, explainable ranking: tag-overlap weight (2x for an exact
// sub-skill tag match, 1x for a domain-only match) multiplied by the
// gap's magnitude. No embeddings yet — a pgvector semantic-similarity
// layer (course/programme descriptions vs. sub-skill descriptions) is the
// planned secondary signal once this rules-based pass is solid; see
// prompt.md Phase 2 item 9. Every candidate must carry a "why recommended"
// string tied to the specific gap it addresses — this is a judging
// differentiator, not optional polish.
function tagOverlapWeight(tags: string[], subSkill: string, domain: string): number {
  if (tags.includes(subSkill)) return 2;
  if (tags.includes(domain)) return 1;
  return 0;
}

async function candidatesForGap(gap: SubSkillGap, targetRoleTitle: string): Promise<RecommendationCandidate[]> {
  const [courses, programmes] = await Promise.all([
    prisma.course.findMany({
      where: { competencyTags: { hasSome: [gap.subSkill, gap.domain] } },
    }),
    prisma.trainingProgramme.findMany({
      where: { competencyTags: { hasSome: [gap.subSkill, gap.domain] } },
    }),
  ]);

  const courseCandidates: RecommendationCandidate[] = courses.map((c) => {
    const weight = tagOverlapWeight(c.competencyTags, gap.subSkill, gap.domain);
    return {
      source: "iGOT Karmayogi",
      id: c.doId,
      title: c.title,
      tags: c.competencyTags,
      score: weight * gap.gap,
      why: `Closes your ${gap.gap}-point gap in ${gap.subSkill} (currently ${gap.current}/100, ${targetRoleTitle} requires ${gap.required}/100).`,
    };
  });

  const programmeCandidates: RecommendationCandidate[] = programmes.map((p) => {
    const weight = tagOverlapWeight(p.competencyTags, gap.subSkill, gap.domain);
    return {
      source: "NSSTA/TPAC",
      id: p.id,
      title: p.name,
      tags: p.competencyTags,
      score: weight * gap.gap,
      why: `Residential training addressing your ${gap.gap}-point gap in ${gap.subSkill} (currently ${gap.current}/100, ${targetRoleTitle} requires ${gap.required}/100).`,
    };
  });

  return [...courseCandidates, ...programmeCandidates]
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export async function getRecommendations(userId: string): Promise<GapRecommendations[]> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { targetRole: true } });
  if (!user) throw new ApiError(404, "User not found");
  const targetRoleTitle = user.targetRole?.title ?? "your target role";

  const gaps = await getRankedGaps(userId);

  const results: GapRecommendations[] = [];
  for (const gap of gaps) {
    const candidates = await candidatesForGap(gap, targetRoleTitle);
    if (candidates.length) {
      results.push({ subSkill: gap.subSkill, domain: gap.domain, gap: gap.gap, candidates });
    }
  }

  return results;
}
