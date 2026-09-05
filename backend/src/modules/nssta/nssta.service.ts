import { prisma } from "../../config/db";

export interface NsstaSearchParams {
  tags?: string[];
  cadre?: string;
  page?: number;
  size?: number;
}

// Same result shape as the iGOT adapter (identifier/name/source/...) so the
// recommendation engine treats both sources uniformly.
export async function searchProgrammes(params: NsstaSearchParams) {
  const page = params.page ?? 1;
  const size = params.size ?? 20;

  const where = {
    AND: [
      params.tags?.length ? { competencyTags: { hasSome: params.tags } } : {},
      params.cadre ? { targetCadre: { has: params.cadre } } : {},
    ],
  };

  const [count, content] = await Promise.all([
    prisma.trainingProgramme.count({ where }),
    prisma.trainingProgramme.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * size,
      take: size,
    }),
  ]);

  return {
    id: "nssta-mock-search",
    params: { status: "successful" },
    result: {
      count,
      content: content.map((p) => ({
        identifier: p.id,
        name: p.name,
        source: "NSSTA/TPAC",
        duration: p.durationDays ? `${p.durationDays}d` : undefined,
        venue: p.venue,
        batchSize: p.batchSize,
        targetCadre: p.targetCadre,
        competencyTags: p.competencyTags,
        description: p.description,
        level: p.level,
        rating: p.rating,
      })),
    },
    page,
    size,
  };
}
