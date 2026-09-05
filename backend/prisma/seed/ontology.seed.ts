import { PrismaClient } from "@prisma/client";

// Competency ontology per prompt.md: 4 domains, 5-8 sub-skills each,
// using the exact sub-skills listed in the problem statement.
export const ONTOLOGY: Record<string, string[]> = {
  Statistical: [
    "Survey Design",
    "Sampling",
    "National Accounts",
    "Price Statistics",
    "Labour Statistics",
    "SDG Indicators",
    "Data Quality Frameworks",
  ],
  Technical: [
    "Python",
    "R",
    "SQL",
    "Stata",
    "SPSS",
    "SAS",
    "GIS",
    "Data Viz",
    "AI/ML",
    "Cloud",
  ],
  "Digital Governance": [
    "Cybersecurity",
    "Data Privacy",
    "Digital Signatures",
    "Gov Cloud",
    "DPI",
  ],
  "Behavioural/Managerial": [
    "Leadership",
    "Communication",
    "Project Management",
    "Ethics",
    "Decision Making",
    "Change Management",
  ],
};

export async function seedOntology(prisma: PrismaClient) {
  for (const [domainName, subSkills] of Object.entries(ONTOLOGY)) {
    const domain = await prisma.competencyDomain.upsert({
      where: { name: domainName },
      update: {},
      create: { name: domainName },
    });

    for (const subSkillName of subSkills) {
      await prisma.subSkill.upsert({
        where: { domainId_name: { domainId: domain.id, name: subSkillName } },
        update: {},
        create: { name: subSkillName, domainId: domain.id },
      });
    }
  }

  console.log(
    `Seeded ontology: ${Object.keys(ONTOLOGY).length} domains, ${Object.values(ONTOLOGY).flat().length} sub-skills`,
  );
}
