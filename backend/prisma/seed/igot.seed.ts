import { PrismaClient } from "@prisma/client";
import { ONTOLOGY } from "./ontology.seed";

// Mock iGOT Karmayogi catalogue, modeled on the real Sunbird `composite/v3/search`
// response shape (do_-style content IDs, title, duration in hours, tags).
// Generated programmatically (~5 courses/sub-skill x 28 sub-skills ≈ 140 records)
// so the recommendation engine has enough tag-overlap surface to rank against.

const LEVELS = [
  { label: "Foundations of", hours: 4, level: "Beginner" },
  { label: "Practitioner's Guide to", hours: 8, level: "Intermediate" },
  { label: "Advanced", hours: 12, level: "Advanced" },
  { label: "Applied", hours: 6, level: "Intermediate" },
  { label: "Masterclass:", hours: 16, level: "Expert" },
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Deterministic pseudo-rating (3.6-4.9) from the doId so re-seeding never
// changes a course's displayed rating — not real feedback data.
function hashRating(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  return Math.round((3.6 + (h % 131) / 100) * 10) / 10;
}

interface CourseSeed {
  doId: string;
  title: string;
  provider: string;
  durationHours: number;
  competencyTags: string[];
  description: string;
  level: string;
  rating: number;
}

function buildCourses(): CourseSeed[] {
  const courses: CourseSeed[] = [];
  let seq = 1;

  for (const [domain, subSkills] of Object.entries(ONTOLOGY)) {
    for (const subSkill of subSkills) {
      for (const level of LEVELS) {
        const title =
          level.label === "Masterclass:"
            ? `${level.label} ${subSkill} for Government Officers`
            : `${level.label} ${subSkill}`;
        const doId = `do_igot_${String(seq).padStart(5, "0")}_${slug(subSkill)}`;
        courses.push({
          doId,
          title,
          provider: "iGOT Karmayogi",
          durationHours: level.hours,
          competencyTags: [domain, subSkill],
          description: `A ${level.hours}-hour self-paced module covering ${subSkill.toLowerCase()} concepts and applications within the ${domain} domain, aligned to the Mission Karmayogi FRAC competency framework.`,
          level: level.level,
          rating: hashRating(doId),
        });
        seq += 1;
      }
    }
  }

  return courses;
}

export const IGOT_COURSES = buildCourses();

export async function seedIgotCourses(prisma: PrismaClient) {
  for (const c of IGOT_COURSES) {
    await prisma.course.upsert({
      where: { doId: c.doId },
      update: c,
      create: c,
    });
  }
  console.log(`Seeded ${IGOT_COURSES.length} iGOT mock courses`);
}
