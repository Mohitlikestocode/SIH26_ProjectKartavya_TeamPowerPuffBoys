import { PrismaClient, type Prisma } from "@prisma/client";
import { deriveCorrectOption } from "../../src/lib/mcq/deriveCorrectOption";
import type { OptionEvaluation } from "../../src/types/mcq";

// Hand-authored onboarding diagnostic content: 3 officer roles x 10 questions.
//
// Only 18 questions are stored, not 30: each role gets 4 role-specific Statistical questions,
// and the remaining 6 (Technical / Digital Governance / Behavioural) are deliberately shared
// across all three roles, so they're stored once and referenced by all three assessments.
//
// Every question is pushed through deriveCorrectOption() rather than declaring `correctOption`
// directly — the same structural gate LLM-generated questions go through. Each option states
// whether its own claim is true; the answer key is computed from those plus the stem's negation.
// A typo that makes two options true (or none) fails the seed loudly instead of silently
// shipping an unanswerable question.

interface QuestionSeed {
  key: string;
  question: string;
  isNegatedStem: boolean;
  domain: string;
  skill: string;
  options: [string, string, string, string];
  evaluations: OptionEvaluation[];
}

type OptionSpec = [text: string, isTrueStatement: boolean, explanation: string];

function q(input: {
  key: string;
  question: string;
  domain: string;
  skill: string;
  negated?: boolean;
  options: [OptionSpec, OptionSpec, OptionSpec, OptionSpec];
}): QuestionSeed {
  return {
    key: input.key,
    question: input.question,
    isNegatedStem: input.negated ?? false,
    domain: input.domain,
    skill: input.skill,
    options: input.options.map((o) => o[0]) as [string, string, string, string],
    evaluations: input.options.map((o, i) => ({ optionIndex: i, isTrueStatement: o[1], text: o[2] })),
  };
}

// ---------------------------------------------------------------------------
// Shared pool — identical for all three roles
// ---------------------------------------------------------------------------

const SHARED_QUESTIONS: QuestionSeed[] = [
  q({
    key: "shared-sql-having",
    question: "In SQL, which clause is used to filter rows after an aggregation (e.g. after GROUP BY)?",
    domain: "Technical",
    skill: "SQL",
    options: [
      ["WHERE", false, "Filters rows before aggregation, not after."],
      ["HAVING", true, "Correct — HAVING filters post-aggregation results."],
      ["ORDER BY", false, "Only controls sort order."],
      ["LIMIT", false, "Only restricts the number of rows returned."],
    ],
  }),
  q({
    key: "shared-python-pandas",
    question: "What is the primary use of Python's pandas library in official statistics work?",
    domain: "Technical",
    skill: "Python",
    options: [
      ["Reading and manipulating tabular/structured data", true, "Correct — pandas is built for tabular data handling and analysis."],
      ["Rendering 3D graphics", false, "Not pandas' purpose."],
      ["Sending emails", false, "Unrelated to pandas."],
      ["Managing a database's physical disk storage", false, "That is a database engine's job, not pandas'."],
    ],
  }),
  q({
    key: "shared-dpdp-year",
    question:
      "The Digital Personal Data Protection (DPDP) Act, governing personal data processing in India, was enacted in which year?",
    domain: "Digital Governance",
    skill: "Data Privacy",
    options: [
      ["2000", false, "That is the IT Act's year, not the DPDP Act's."],
      ["2011", false, "Predates the DPDP Act's enactment."],
      ["2023", true, "Correct enactment year."],
      ["2018", false, "Predates the DPDP Act's actual enactment."],
    ],
  }),
  q({
    key: "shared-rbac",
    question: "What is a key purpose of role-based access control (RBAC) in a government data system?",
    domain: "Digital Governance",
    skill: "Cybersecurity",
    options: [
      ["To give every user identical, unrestricted access", false, "The opposite of RBAC's actual purpose."],
      [
        "To restrict a user's access and actions to only what is appropriate for their role",
        true,
        "Correct — RBAC limits access appropriately by role.",
      ],
      ["To deliberately slow the system down", false, "Not a real security goal."],
      ["To eliminate the need for audit logging", false, "RBAC complements audit logging, it does not replace it."],
    ],
  }),
  q({
    key: "shared-stakeholder",
    question: "What does 'stakeholder management' primarily involve in a project management context?",
    domain: "Behavioural/Managerial",
    skill: "Project Management",
    options: [
      ["Ignoring feedback from other departments", false, "The opposite of good stakeholder management."],
      [
        "Identifying, engaging and balancing the needs of people affected by or influencing a project",
        true,
        "Correct definition.",
      ],
      ["Only managing your direct subordinates", false, "Too narrow — stakeholders extend well beyond direct reports."],
      ["A financial auditing technique", false, "Unrelated to auditing."],
    ],
  }),
  q({
    key: "shared-leadership",
    question: "Which is generally considered a hallmark of effective leadership in a public-sector organisation?",
    domain: "Behavioural/Managerial",
    skill: "Leadership",
    options: [
      ["Making all decisions without input from team members", false, "Describes poor, not effective, leadership."],
      [
        "Clear communication, accountability and empowering team members",
        true,
        "Correct — the widely recognised hallmark.",
      ],
      ["Avoiding documentation of decisions", false, "Poor governance practice."],
      ["Delegating all responsibility with zero oversight", false, "Delegation without oversight is a failure mode, not leadership."],
    ],
  }),
];

// ---------------------------------------------------------------------------
// Role-specific Statistical pools
// ---------------------------------------------------------------------------

const PRICE_STATISTICS_QUESTIONS: QuestionSeed[] = [
  q({
    key: "ps-wpi-base-year",
    question: "The all-India Wholesale Price Index (WPI) series currently uses which base year?",
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      ["2004-05", false, "An earlier, since-revised base year."],
      ["2011-12", true, "Current official WPI base year."],
      ["2016-17", false, "Not the WPI base year."],
      ["2001-02", false, "Not the WPI base year."],
    ],
  }),
  q({
    key: "ps-cpi-household",
    question: "Which index specifically measures price changes faced by households for consumption purposes?",
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      ["Wholesale Price Index (WPI)", false, "Measures wholesale/producer prices, not consumption."],
      ["Index of Industrial Production (IIP)", false, "Measures industrial output volume."],
      ["Consumer Price Index (CPI)", true, "Correct — measures household consumption prices."],
      ["Index of Service Production (ISP)", false, "Measures service-sector output."],
    ],
  }),
  q({
    key: "ps-cpi-series-negated",
    question: "Which of the following is NOT one of the standard CPI series compiled in India?",
    domain: "Statistical",
    skill: "Price Statistics",
    negated: true,
    options: [
      ["CPI (Rural)", true, "A real, standard CPI series."],
      ["CPI (Urban)", true, "A real, standard CPI series."],
      ["CPI (Agricultural Labourer / Rural Labourer)", true, "A real, standard CPI series."],
      ["CPI (Export Price Parity)", false, "Not a recognised official CPI series — this is the odd one out."],
    ],
  }),
  q({
    key: "ps-cpi-al-compiler",
    question: "Which government body compiles the CPI for Agricultural Labourers and Rural Labourers?",
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      ["Reserve Bank of India", false, "Uses inflation data but does not compile this series."],
      ["Labour Bureau", true, "Correct compiling authority."],
      ["NITI Aayog", false, "A policy think tank, not a compiler of this series."],
      ["DGCI&S", false, "Compiles trade statistics, not this CPI."],
    ],
  }),
];

const NATIONAL_ACCOUNTS_QUESTIONS: QuestionSeed[] = [
  q({
    key: "na-gva-definition",
    question: "What does GVA (Gross Value Added) represent in national accounting?",
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      ["Total government spending in a fiscal year", false, "A separate aggregate, not GVA."],
      ["The value of output less the value of intermediate consumption", true, "Correct definition."],
      ["Total exports minus total imports", false, "Describes net exports, not GVA."],
      ["Household savings as a percentage of GDP", false, "Describes a savings rate, not GVA."],
    ],
  }),
  q({
    key: "na-gdp-approaches",
    question: "GDP can be estimated using which of the following approaches?",
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      ["Production, Income and Expenditure approaches", true, "Correct — the three standard, reconciling approaches."],
      ["Only the Expenditure approach", false, "That is only one of the three approaches."],
      ["Only the Production approach", false, "That is only one of the three approaches."],
      ["Import-Export approach only", false, "No such standalone approach exists."],
    ],
  }),
  q({
    key: "na-state-aggregate",
    question: "At the state level, which aggregate is the equivalent of national GDP?",
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      ["State Domestic Product (SDP) / Net State Domestic Product (NSDP)", true, "Correct state-level counterpart."],
      ["State Fiscal Deficit", false, "A government-finance measure, not output."],
      ["State Consumer Price Index", false, "Measures prices, not output."],
      ["State Export Index", false, "No such standard aggregate exists."],
    ],
  }),
  q({
    key: "na-sna-sector-negated",
    question: "Which of the following is NOT typically an institutional sector in the SNA framework?",
    domain: "Statistical",
    skill: "National Accounts",
    negated: true,
    options: [
      ["Households", true, "A standard SNA institutional sector."],
      ["Non-financial corporations", true, "A standard SNA institutional sector."],
      ["General government", true, "A standard SNA institutional sector."],
      ["Weather Bureau", false, "Not an SNA institutional sector classification at all — this is the odd one out."],
    ],
  }),
];

const FIELD_OPERATIONS_QUESTIONS: QuestionSeed[] = [
  q({
    key: "fo-fsu-basis",
    question: "In NSSO large-scale sample surveys, what is a First Stage Unit (FSU) typically based on?",
    domain: "Statistical",
    skill: "Sampling",
    options: [
      ["Individual household members only", false, "Households are the ultimate unit, not the FSU."],
      ["Census villages (rural) or Urban Frame Survey blocks (urban)", true, "Correct — the actual FSU basis."],
      ["State capitals only", false, "FSU selection is not restricted to capitals."],
      ["Industrial units regardless of location", false, "Relates to enterprise surveys, not this FSU concept."],
    ],
  }),
  q({
    key: "fo-central-sample-executor",
    question: "Which division executes field work for central-sample socio-economic surveys?",
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      ["Data Processing Division (DPD)", false, "Processes data, does not collect it."],
      ["Field Operations Division (FOD) of NSSO", true, "Correct — FOD executes central-sample fieldwork."],
      ["Ministry of Finance", false, "Has no role in field collection."],
      ["Survey Design & Research Division (SDRD) only", false, "Designs methodology, does not conduct fieldwork."],
    ],
  }),
  q({
    key: "fo-state-sample-executor",
    question: "For state-sample socio-economic surveys, who typically executes the field work?",
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      ["Respective State Governments / UTs", true, "Correct — states handle their own samples."],
      ["Always the central FOD, never states", false, "FOD handles central, not state, samples."],
      ["Private survey contractors exclusively", false, "Not typically outsourced this way."],
      ["The Reserve Bank of India", false, "Has no role in field surveys."],
    ],
  }),
  q({
    key: "fo-aitot-purpose",
    question: "What is the primary purpose of All-India Training of Trainers (AITOT) before a survey round begins?",
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      [
        "To discuss sampling design, survey schedules and data collection procedures with senior field officers",
        true,
        "Correct — AITOT's actual purpose.",
      ],
      ["To finalise the survey's budget allocation", false, "A separate administrative matter."],
      ["To recruit new central government ministers", false, "Unrelated to AITOT."],
      ["To design the national census logo", false, "Unrelated to AITOT."],
    ],
  }),
];

// ---------------------------------------------------------------------------
// The three demo roles
// ---------------------------------------------------------------------------

interface DiagnosticRoleSeed {
  title: string;
  cadre: string;
  description: string;
  statisticalQuestions: QuestionSeed[];
  // requiredLevel (0-100) per sub-skill. Deliberately covers every sub-skill the diagnostic
  // actually tests, so each question's result feeds a real gap rather than scoring into a void.
  requirements: Record<string, number>;
}

export const DIAGNOSTIC_ROLES: DiagnosticRoleSeed[] = [
  {
    title: "JTS/Assistant Director – Price Statistics",
    cadre: "ISS",
    description:
      "Entry-grade ISS officer supporting WPI/CPI compilation, price-collection scrutiny and index quality checks.",
    statisticalQuestions: PRICE_STATISTICS_QUESTIONS,
    requirements: {
      "Price Statistics": 70,
      Sampling: 55,
      "Data Quality Frameworks": 55,
      SQL: 50,
      Python: 45,
      "Data Privacy": 45,
      Cybersecurity: 40,
      "Project Management": 45,
      Leadership: 40,
    },
  },
  {
    title: "STS/Deputy Director – National Accounts",
    cadre: "ISS",
    description:
      "Senior time-scale officer compiling GDP/GVA aggregates and reconciling sectoral and state-level accounts.",
    statisticalQuestions: NATIONAL_ACCOUNTS_QUESTIONS,
    requirements: {
      "National Accounts": 80,
      "Data Quality Frameworks": 60,
      SQL: 55,
      Python: 50,
      "Data Privacy": 45,
      Cybersecurity: 40,
      "Project Management": 55,
      Leadership: 55,
    },
  },
  {
    title: "JSO – Field Operations",
    cadre: "SSS",
    description:
      "Junior Statistical Officer running field enumeration, schedule scrutiny and first-level data collection.",
    statisticalQuestions: FIELD_OPERATIONS_QUESTIONS,
    requirements: {
      "Survey Design": 70,
      Sampling: 65,
      Communication: 50,
      SQL: 45,
      Python: 40,
      "Data Privacy": 40,
      Cybersecurity: 40,
      "Project Management": 45,
      Leadership: 40,
    },
  },
];

export const DIAGNOSTIC_TITLE_PREFIX = "Baseline Diagnostic";

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

// Derives the answer key and builds both the stored Question row and the Assessment's embedded
// question payload. Throws (failing the seed) if a question's option evaluations don't resolve to
// exactly one answer — see deriveCorrectOption.
function buildQuestion(seed: QuestionSeed) {
  const derived = deriveCorrectOption(seed.evaluations, seed.isNegatedStem);
  if (!derived.ok) {
    throw new Error(`Diagnostic question "${seed.key}" has an inconsistent answer key: ${derived.reason}`);
  }
  return { derived, seed };
}

export async function seedDiagnosticContent(prisma: PrismaClient, systemUserId: string) {
  const allQuestions = [
    ...SHARED_QUESTIONS,
    ...PRICE_STATISTICS_QUESTIONS,
    ...NATIONAL_ACCOUNTS_QUESTIONS,
    ...FIELD_OPERATIONS_QUESTIONS,
  ];

  // 1. Question bank rows — approved, so they're immediately usable by the trainer-side
  //    assembly/review flows, not just by these three diagnostics.
  const questionIdByKey = new Map<string, string>();
  for (const seed of allQuestions) {
    const { derived } = buildQuestion(seed);
    const existing = await prisma.question.findFirst({ where: { question: seed.question } });
    const data = {
      question: seed.question,
      options: seed.options,
      isNegatedStem: seed.isNegatedStem,
      correctOption: derived.correctOption,
      explanations: derived.explanations as unknown as Prisma.InputJsonValue,
      domain: seed.domain,
      skill: seed.skill,
      status: "approved" as const,
    };
    const row = existing
      ? await prisma.question.update({ where: { id: existing.id }, data })
      : await prisma.question.create({ data });
    questionIdByKey.set(seed.key, row.id);
  }

  // 2. Roles + their competency requirements.
  for (const roleSeed of DIAGNOSTIC_ROLES) {
    const role = await prisma.targetRole.upsert({
      where: { title: roleSeed.title },
      update: { description: roleSeed.description, cadre: roleSeed.cadre },
      create: { title: roleSeed.title, cadre: roleSeed.cadre, description: roleSeed.description },
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

    // 3. One diagnostic Assessment per role: 4 role-specific + the 6 shared, in that order.
    const roleQuestions = [...roleSeed.statisticalQuestions, ...SHARED_QUESTIONS];
    const payload = roleQuestions.map((seed) => {
      const { derived } = buildQuestion(seed);
      return {
        id: questionIdByKey.get(seed.key),
        stem: seed.question,
        options: seed.options,
        correctIndex: derived.correctOption,
        domainTag: seed.domain,
        subSkillTag: seed.skill,
        isNegatedStem: seed.isNegatedStem,
        explanations: derived.explanations,
      };
    });

    const title = `${DIAGNOSTIC_TITLE_PREFIX} – ${roleSeed.title}`;
    const assessmentData = {
      type: "diagnostic" as const,
      title,
      domainTags: Array.from(new Set(roleQuestions.map((s) => s.domain))),
      subSkillTags: Array.from(new Set(roleQuestions.map((s) => s.skill))),
      questions: payload as unknown as Prisma.InputJsonValue,
      timeLimitSeconds: 20 * 60,
      passingScore: 50,
      createdById: systemUserId,
    };

    const existingAssessment = await prisma.assessment.findFirst({ where: { title, type: "diagnostic" } });
    if (existingAssessment) {
      await prisma.assessment.update({ where: { id: existingAssessment.id }, data: assessmentData });
    } else {
      await prisma.assessment.create({ data: assessmentData });
    }
  }

  console.log(
    `Seeded diagnostic content: ${allQuestions.length} questions, ${DIAGNOSTIC_ROLES.length} roles, ${DIAGNOSTIC_ROLES.length} role-scoped diagnostics (10 questions each)`,
  );
}
