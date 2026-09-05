import { prisma } from "../../config/db";

export interface IgotSearchParams {
  tags?: string[];
  query?: string;
  page?: number;
  size?: number;
}

// Mirrors the shape of a real Sunbird `composite/v3/search` response closely
// enough that swapping the mock adapter for the live API later only touches
// this file, not its callers.
export async function searchCourses(params: IgotSearchParams) {
  const page = params.page ?? 1;
  const size = params.size ?? 20;

  const where = {
    AND: [
      params.tags?.length ? { competencyTags: { hasSome: params.tags } } : {},
      params.query
        ? { title: { contains: params.query, mode: "insensitive" as const } }
        : {},
    ],
  };

  const [count, content] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy: { title: "asc" },
      skip: (page - 1) * size,
      take: size,
    }),
  ]);

  return {
    id: "igot-mock-search",
    params: { status: "successful" },
    result: {
      count,
      content: content.map((c) => ({
        identifier: c.doId,
        name: c.title,
        source: c.provider,
        duration: c.durationHours ? `${c.durationHours}h` : undefined,
        competencyTags: c.competencyTags,
        description: c.description,
      })),
    },
    page,
    size,
  };
}
