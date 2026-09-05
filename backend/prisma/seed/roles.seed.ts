import { PrismaClient } from "@prisma/client";

interface TargetRoleSeed {
  title: string;
  cadre: string;
  description: string;
  // requiredLevel (0-100) keyed by sub-skill name — only sub-skills relevant
  // to the role need be listed; others are simply not required (no gap).
  requirements: Record<string, number>;
}

export const TARGET_ROLES: TargetRoleSeed[] = [
  {
    title: "Deputy Director – Price Statistics",
    cadre: "ISS",
    description:
      "Leads Wholesale/Consumer Price Index compilation and price-collection quality assurance.",
    requirements: {
      "Price Statistics": 85,
      Sampling: 70,
      "Data Quality Frameworks": 75,
      SQL: 60,
      "Data Viz": 55,
      Leadership: 65,
      "Decision Making": 60,
    },
  },
  {
    title: "Joint Director – GIS & Spatial Analytics",
    cadre: "ISS",
    description:
      "Drives geospatial integration of survey frames and spatial analysis for area-level estimates.",
    requirements: {
      GIS: 90,
      Python: 70,
      "AI/ML": 55,
      "Data Viz": 65,
      "Survey Design": 60,
      "Project Management": 55,
    },
  },
  {
    title: "State DES Officer – Labour Statistics",
    cadre: "State DES",
    description:
      "Coordinates state-level labour force survey rounds and reporting to MoSPI/NSO.",
    requirements: {
      "Labour Statistics": 85,
      "Survey Design": 65,
      Sampling: 65,
      Communication: 60,
      "Project Management": 55,
    },
  },
  {
    title: "Deputy Director – National Accounts",
    cadre: "ISS",
    description: "Compiles GDP/GVA estimates and reconciles sectoral accounts.",
    requirements: {
      "National Accounts": 90,
      "Data Quality Frameworks": 70,
      SAS: 55,
      SQL: 55,
      "SDG Indicators": 45,
      "Decision Making": 55,
    },
  },
  {
    title: "Assistant Director – Data Quality & SDG Monitoring",
    cadre: "SSS",
    description: "Owns SDG indicator tracking and cross-survey data-quality audits.",
    requirements: {
      "SDG Indicators": 85,
      "Data Quality Frameworks": 80,
      "Data Viz": 60,
      Python: 50,
      Ethics: 55,
    },
  },
  {
    title: "Deputy Director – Digital Governance & Data Systems",
    cadre: "MoSPI/NSO",
    description:
      "Owns platform security posture, DPI integration, and data-privacy compliance for statistical systems.",
    requirements: {
      Cybersecurity: 80,
      "Data Privacy": 80,
      "Gov Cloud": 70,
      DPI: 65,
      "Digital Signatures": 55,
      "Change Management": 50,
    },
  },
  {
    title: "Joint Director – Data Science & Analytics",
    cadre: "ISS",
    description: "Leads adoption of AI/ML methods for official statistics production.",
    requirements: {
      "AI/ML": 85,
      Python: 80,
      R: 65,
      Cloud: 60,
      "Data Viz": 70,
      "Data Quality Frameworks": 55,
    },
  },
  {
    title: "Regional Director – Survey Operations",
    cadre: "SSS",
    description: "Manages multi-state field survey operations and enumerator training.",
    requirements: {
      "Survey Design": 80,
      Sampling: 75,
      Leadership: 75,
      "Project Management": 70,
      Communication: 65,
      "Change Management": 55,
    },
  },
];

export async function seedTargetRoles(prisma: PrismaClient) {
  for (const roleSeed of TARGET_ROLES) {
    const role = await prisma.targetRole.upsert({
      where: { title: roleSeed.title },
      update: { description: roleSeed.description, cadre: roleSeed.cadre },
      create: {
        title: roleSeed.title,
        cadre: roleSeed.cadre,
        description: roleSeed.description,
      },
    });

    for (const [subSkillName, requiredLevel] of Object.entries(roleSeed.requirements)) {
      const subSkill = await prisma.subSkill.findFirst({ where: { name: subSkillName } });
      if (!subSkill) {
        console.warn(`  ! skipping unknown sub-skill "${subSkillName}" for role "${roleSeed.title}"`);
        continue;
      }
      await prisma.roleCompetencyRequirement.upsert({
        where: { targetRoleId_subSkillId: { targetRoleId: role.id, subSkillId: subSkill.id } },
        update: { requiredLevel },
        create: { targetRoleId: role.id, subSkillId: subSkill.id, requiredLevel },
      });
    }
  }

  console.log(`Seeded ${TARGET_ROLES.length} target roles with competency requirements`);
}
