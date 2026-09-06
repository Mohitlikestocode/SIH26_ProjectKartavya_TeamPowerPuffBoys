import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedOntology } from "./ontology.seed";
import { seedTargetRoles } from "./roles.seed";
import { seedIgotCourses } from "./igot.seed";
import { seedNsstaProgrammes } from "./nssta.seed";
import { seedSyntheticWorkforce } from "./synthetic.seed";
<<<<<<< HEAD
import { seedDiagnosticContent } from "./diagnostic.seed";
=======
import { seedDiagnosticQuestions } from "./diagnosticQuestions.seed";
>>>>>>> origin/main
import { getOrCreateDiagnostic } from "../../src/modules/assessments/assessments.service";

const prisma = new PrismaClient();

async function seedDemoUsers() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const priceStatsRole = await prisma.targetRole.findUnique({
    where: { title: "Deputy Director – Price Statistics" },
  });

  const demoUsers = [
    {
      email: "learner@kartavya.gov.in",
      name: "Anjali Sharma",
      role: "learner" as const,
      designation: "Assistant Director",
      department: "MoSPI",
      cadre: "ISS",
      state: "Delhi",
      experienceYears: 4,
      targetRoleId: priceStatsRole?.id,
    },
    {
      email: "trainer@kartavya.gov.in",
      name: "Rakesh Verma",
      role: "trainer" as const,
      designation: "Senior Faculty",
      department: "NSSTA",
      cadre: "ISS",
      state: "Uttar Pradesh",
      experienceYears: 12,
    },
    {
      email: "admin@kartavya.gov.in",
      name: "Meera Iyer",
      role: "org_admin" as const,
      designation: "Director",
      department: "MoSPI",
      cadre: "ISS",
      state: "Delhi",
      experienceYears: 18,
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { ...u, passwordHash },
      create: { ...u, passwordHash },
    });
  }

  console.log(`Seeded ${demoUsers.length} demo users (password: password123)`);
}

async function main() {
  console.log("Seeding Kartavya backend...");
  await seedOntology(prisma);
  await seedTargetRoles(prisma);
  await seedIgotCourses(prisma);
  await seedNsstaProgrammes(prisma);
  await seedDemoUsers();

  const orgAdmin = await prisma.user.findFirst({ where: { role: "org_admin" } });
  if (orgAdmin) {
    await seedDiagnosticQuestions(prisma);
    await getOrCreateDiagnostic(orgAdmin.id);
    await seedDiagnosticContent(prisma, orgAdmin.id);

    // seedDiagnosticContent creates its own three grade-scoped roles (JTS / STS / JSO) that are
    // distinct from the eight aspirational target roles in roles.seed.ts. The demo learner is
    // seeded above against "Deputy Director – Price Statistics", which has no authored
    // role-scoped diagnostic, so GET /api/assessments/diagnostic would always fall back to the
    // generic stub. Re-point the demo learner at the matching grade-scoped role so the
    // role-scoping path is exercised by the default login.
    const jtsPriceStats = await prisma.targetRole.findUnique({
      where: { title: "JTS/Assistant Director – Price Statistics" },
    });
    if (jtsPriceStats) {
      await prisma.user.update({
        where: { email: "learner@kartavya.gov.in" },
        data: { targetRoleId: jtsPriceStats.id },
      });
      console.log('  Re-pointed demo learner at "JTS/Assistant Director – Price Statistics"');
    }

    await seedSyntheticWorkforce(prisma);
  } else {
    console.warn("  ! no org_admin user found — skipping diagnostic + synthetic workforce seed");
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
