// Shared between assessments.service.ts (assembling a role-specific baseline diagnostic at
// request time) and prisma/seed/diagnosticQuestions.seed.ts (seeding the curated question content
// these skills point at) — lives under src/ rather than prisma/seed/ because tsconfig.json's
// rootDir is "src"; the seed script importing from here is fine (it already imports runtime code
// the same way), but the reverse would break `tsc -p tsconfig.json`.
//
// Role -> primary Statistical skill for the curated 10-question baseline diagnostic. Keep these
// keys in sync with prisma/seed/roles.seed.ts's TargetRole titles.
export const CURATED_ROLE_SKILL: Record<string, string> = {
  "Deputy Director – Price Statistics": "Price Statistics",
  "Deputy Director – National Accounts": "National Accounts",
  "Junior Statistical Officer – Field Operations": "Survey Design",
};

// The 6 shared Technical/Digital Governance/Behavioural sub-skills reused identically across
// every curated role's diagnostic (one question each) — same shared-pool design as the rest of
// the ontology.
export const SHARED_DIAGNOSTIC_SKILLS = [
  "SQL",
  "Python",
  "Data Privacy",
  "Cybersecurity",
  "Project Management",
  "Leadership",
];
