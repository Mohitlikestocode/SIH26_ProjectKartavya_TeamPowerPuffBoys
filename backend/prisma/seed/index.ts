import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedOntology } from "./ontology.seed";
import { seedTargetRoles } from "./roles.seed";
import { seedIgotCourses } from "./igot.seed";
import { seedNsstaProgrammes } from "./nssta.seed";

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
