// Targeted entry point: seeds ONLY the role-scoped diagnostic content (3 roles + their
// requirements + 18 questions + 3 assessments), skipping the full seed's catalogue and synthetic
// workforce passes. Useful when those are already populated and you only changed diagnostics.
import { PrismaClient } from "@prisma/client";
import { seedDiagnosticContent } from "./diagnostic.seed";

const prisma = new PrismaClient();

async function main() {
  const orgAdmin = await prisma.user.findFirst({ where: { role: "org_admin" } });
  if (!orgAdmin) throw new Error("No org_admin user found — run the full seed first.");
  await seedDiagnosticContent(prisma, orgAdmin.id);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
