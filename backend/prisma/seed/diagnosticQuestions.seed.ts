import { PrismaClient } from "@prisma/client";
import { createManualQuestion } from "../../src/modules/questions/questions.service";

// The curated 10-question-per-role baseline diagnostic (4 role-specific Statistical + 6 shared
// Technical/Digital Governance/Behavioural, reused as-is across every role — same shared-pool
// design as the rest of the ontology). Each question runs through the real
// createManualQuestion() pipeline (deriveCorrectOption + validateMcq), same quality gate as
// anything a trainer authors — not a raw DB insert.
//
// The role->skill and shared-skill lookup tables consumed by assessments.service.ts's
// getOrCreateDiagnostic() live in src/lib/assessment/curatedDiagnostics.ts, not here — tsconfig's
// rootDir is "src", so runtime code can't import back out of it into prisma/seed/.

interface OptionSpec {
  text: string;
  isTrue: boolean;
  explain: string;
}

interface QuestionSpec {
  question: string;
  isNegatedStem: boolean;
  options: [OptionSpec, OptionSpec, OptionSpec, OptionSpec];
  domain: string;
  skill: string;
}

const PRICE_STATISTICS_QUESTIONS: QuestionSpec[] = [
  {
    question: "The all-India Wholesale Price Index (WPI) series currently uses which base year?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      { text: "2004-05", isTrue: false, explain: "An earlier, since-revised base year." },
      { text: "2011-12", isTrue: true, explain: "Current official WPI base year." },
      { text: "2016-17", isTrue: false, explain: "Not the WPI base year." },
      { text: "2001-02", isTrue: false, explain: "Not the WPI base year." },
    ],
  },
  {
    question: "Which index specifically measures price changes faced by households for consumption purposes?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      { text: "Wholesale Price Index (WPI)", isTrue: false, explain: "Measures wholesale/producer prices, not consumption." },
      { text: "Index of Industrial Production (IIP)", isTrue: false, explain: "Measures industrial output volume." },
      { text: "Consumer Price Index (CPI)", isTrue: true, explain: "Correct — measures household consumption prices." },
      { text: "Index of Service Production (ISP)", isTrue: false, explain: "Measures service-sector output." },
    ],
  },
  {
    question: "Which of the following is NOT one of the standard CPI series compiled in India?",
    isNegatedStem: true,
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      { text: "CPI (Rural)", isTrue: true, explain: "A real, standard series." },
      { text: "CPI (Urban)", isTrue: true, explain: "A real, standard series." },
      { text: "CPI (Agricultural Labourer / Rural Labourer)", isTrue: true, explain: "A real, standard series." },
      { text: "CPI (Export Price Parity)", isTrue: false, explain: "Not a recognized official CPI series." },
    ],
  },
  {
    question: "Which government body compiles the CPI for Agricultural Labourers and Rural Labourers?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Price Statistics",
    options: [
      { text: "Reserve Bank of India", isTrue: false, explain: "Uses inflation data but doesn't compile this series." },
      { text: "Labour Bureau", isTrue: true, explain: "Correct compiling authority." },
      { text: "NITI Aayog", isTrue: false, explain: "A policy think tank, not a compiler." },
      { text: "DGCI&S", isTrue: false, explain: "Compiles trade statistics, not this CPI." },
    ],
  },
];

const NATIONAL_ACCOUNTS_QUESTIONS: QuestionSpec[] = [
  {
    question: "What does GVA (Gross Value Added) represent in national accounting?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      { text: "Total government spending in a fiscal year", isTrue: false, explain: "A separate aggregate, not GVA." },
      { text: "The value of output less the value of intermediate consumption", isTrue: true, explain: "Correct definition." },
      { text: "Total exports minus total imports", isTrue: false, explain: "Describes net exports, not GVA." },
      { text: "Household savings as a percentage of GDP", isTrue: false, explain: "Describes a savings rate, not GVA." },
    ],
  },
  {
    question: "GDP can be estimated using which of the following approaches?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      { text: "Production, Income, and Expenditure approaches", isTrue: true, explain: "Correct — the three standard, reconciling approaches." },
      { text: "Only the Expenditure approach", isTrue: false, explain: "Only one of three, not the sole approach." },
      { text: "Only the Production approach", isTrue: false, explain: "Only one of three, not the sole approach." },
      { text: "Import-Export approach only", isTrue: false, explain: "No such standalone approach exists." },
    ],
  },
  {
    question: "At the state level, which aggregate is the equivalent of national GDP?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      { text: "State Domestic Product (SDP) / Net State Domestic Product (NSDP)", isTrue: true, explain: "Correct state-level counterpart." },
      { text: "State Fiscal Deficit", isTrue: false, explain: "A government-finance measure, not output." },
      { text: "State Consumer Price Index", isTrue: false, explain: "Measures prices, not output." },
      { text: "State Export Index", isTrue: false, explain: "No such standard aggregate exists." },
    ],
  },
  {
    question: "Which of the following is NOT typically an institutional sector in the SNA framework?",
    isNegatedStem: true,
    domain: "Statistical",
    skill: "National Accounts",
    options: [
      { text: "Households", isTrue: true, explain: "A standard SNA sector." },
      { text: "Non-financial corporations", isTrue: true, explain: "A standard SNA sector." },
      { text: "General government", isTrue: true, explain: "A standard SNA sector." },
      { text: "Weather Bureau", isTrue: false, explain: "Not an SNA institutional sector classification at all." },
    ],
  },
];

const SURVEY_DESIGN_QUESTIONS: QuestionSpec[] = [
  {
    question: "In NSSO large-scale sample surveys, what is a First Stage Unit (FSU) typically based on?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      { text: "Individual household members only", isTrue: false, explain: "Households are the ultimate unit, not the FSU." },
      { text: "Census villages (rural) or Urban Frame Survey blocks (urban)", isTrue: true, explain: "Correct — the actual FSU basis." },
      { text: "State capitals only", isTrue: false, explain: "Not restricted to capitals." },
      { text: "Industrial units regardless of location", isTrue: false, explain: "Relates to enterprise surveys, not this FSU concept." },
    ],
  },
  {
    question: "Which division executes field work for central-sample socio-economic surveys?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      { text: "Data Processing Division (DPD)", isTrue: false, explain: "Processes data, doesn't collect it." },
      { text: "Field Operations Division (FOD) of NSSO", isTrue: true, explain: "Correct — FOD executes central-sample fieldwork." },
      { text: "Ministry of Finance", isTrue: false, explain: "No role in field collection." },
      { text: "Survey Design & Research Division (SDRD) only", isTrue: false, explain: "Designs methodology, doesn't conduct fieldwork." },
    ],
  },
  {
    question: "For state-sample socio-economic surveys, who typically executes the field work?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      { text: "Respective State Governments/UTs", isTrue: true, explain: "Correct — states handle their own samples." },
      { text: "Always the central FOD, never states", isTrue: false, explain: "FOD handles central, not state, samples." },
      { text: "Private survey contractors exclusively", isTrue: false, explain: "Not typically outsourced this way." },
      { text: "The Reserve Bank of India", isTrue: false, explain: "No role in field surveys." },
    ],
  },
  {
    question: "What is the primary purpose of All-India Training of Trainers (AITOT) before a survey round begins?",
    isNegatedStem: false,
    domain: "Statistical",
    skill: "Survey Design",
    options: [
      { text: "To discuss sampling design, survey schedules, and data collection procedures with senior field officers", isTrue: true, explain: "Correct — AITOT's actual purpose." },
      { text: "To finalize the survey's budget allocation", isTrue: false, explain: "A separate administrative matter." },
      { text: "To recruit new central government ministers", isTrue: false, explain: "Unrelated." },
      { text: "To design the national census logo", isTrue: false, explain: "Unrelated." },
    ],
  },
];

const SHARED_QUESTIONS: QuestionSpec[] = [
  {
    question: "In SQL, which clause is used to filter rows after an aggregation (e.g., after GROUP BY)?",
    isNegatedStem: false,
    domain: "Technical",
    skill: "SQL",
    options: [
      { text: "WHERE", isTrue: false, explain: "Filters rows before aggregation, not after." },
      { text: "HAVING", isTrue: true, explain: "Correct — HAVING filters post-aggregation results." },
      { text: "ORDER BY", isTrue: false, explain: "Only controls sort order." },
      { text: "LIMIT", isTrue: false, explain: "Only restricts row count returned." },
    ],
  },
  {
    question: "What is the primary use of Python's pandas library in official statistics work?",
    isNegatedStem: false,
    domain: "Technical",
    skill: "Python",
    options: [
      { text: "Reading and manipulating tabular/structured data", isTrue: true, explain: "Correct — pandas is built for tabular data handling and analysis." },
      { text: "Rendering 3D graphics", isTrue: false, explain: "Not pandas' purpose." },
      { text: "Sending emails", isTrue: false, explain: "Unrelated to pandas." },
      { text: "Managing a database's physical disk storage", isTrue: false, explain: "A database engine's job, not pandas'." },
    ],
  },
  {
    question: "The Digital Personal Data Protection (DPDP) Act, governing personal data processing in India, was enacted in which year?",
    isNegatedStem: false,
    domain: "Digital Governance",
    skill: "Data Privacy",
    options: [
      { text: "2000", isTrue: false, explain: "That's the IT Act's year, not DPDP." },
      { text: "2011", isTrue: false, explain: "Predates DPDP's enactment." },
      { text: "2023", isTrue: true, explain: "Correct enactment year." },
      { text: "2018", isTrue: false, explain: "Predates DPDP's actual enactment." },
    ],
  },
  {
    question: "What is a key purpose of role-based access control (RBAC) in a government data system?",
    isNegatedStem: false,
    domain: "Digital Governance",
    skill: "Cybersecurity",
    options: [
      { text: "To give every user identical, unrestricted access", isTrue: false, explain: "Opposite of RBAC's actual purpose." },
      { text: "To restrict a user's access/actions to only what's appropriate for their role", isTrue: true, explain: "Correct — RBAC limits access appropriately by role." },
      { text: "To deliberately slow the system down", isTrue: false, explain: "Not a real security goal." },
      { text: "To eliminate the need for audit logging", isTrue: false, explain: "RBAC complements, doesn't replace, audit logging." },
    ],
  },
  {
    question: "What does 'stakeholder management' primarily involve in a project management context?",
    isNegatedStem: false,
    domain: "Behavioural/Managerial",
    skill: "Project Management",
    options: [
      { text: "Ignoring feedback from other departments", isTrue: false, explain: "The opposite of good stakeholder management." },
      { text: "Identifying, engaging, and balancing the needs/expectations of people affected by or influencing a project", isTrue: true, explain: "Correct definition." },
      { text: "Only managing your direct subordinates", isTrue: false, explain: "Too narrow — stakeholders extend beyond direct reports." },
      { text: "A financial auditing technique", isTrue: false, explain: "Unrelated to auditing." },
    ],
  },
  {
    question: "Which is generally considered a hallmark of effective leadership in a public-sector organization?",
    isNegatedStem: false,
    domain: "Behavioural/Managerial",
    skill: "Leadership",
    options: [
      { text: "Making all decisions without input from team members", isTrue: false, explain: "Describes poor, not effective, leadership." },
      { text: "Clear communication, accountability, and empowering team members", isTrue: true, explain: "Correct — the widely recognized hallmark." },
      { text: "Avoiding documentation of decisions", isTrue: false, explain: "Poor governance practice." },
      { text: "Delegating all responsibility with zero oversight", isTrue: false, explain: "Delegation without any oversight is a failure mode, not leadership." },
    ],
  },
];

export const ALL_DIAGNOSTIC_QUESTION_SPECS: QuestionSpec[] = [
  ...PRICE_STATISTICS_QUESTIONS,
  ...NATIONAL_ACCOUNTS_QUESTIONS,
  ...SURVEY_DESIGN_QUESTIONS,
  ...SHARED_QUESTIONS,
];

export async function seedDiagnosticQuestions(prisma: PrismaClient) {
  const orgAdmin = await prisma.user.findFirst({ where: { role: "org_admin" } });
  if (!orgAdmin) {
    console.warn("  ! no org_admin user found — skipping curated diagnostic question seed");
    return;
  }

  let created = 0;
  for (const spec of ALL_DIAGNOSTIC_QUESTION_SPECS) {
    const existing = await prisma.question.findFirst({ where: { question: spec.question } });
    if (existing) continue;

    await createManualQuestion(
      {
        question: spec.question,
        options: spec.options.map((o) => o.text) as [string, string, string, string],
        isNegatedStem: spec.isNegatedStem,
        optionEvaluations: spec.options.map((o, i) => ({ optionIndex: i, isTrueStatement: o.isTrue, text: o.explain })),
        domain: spec.domain,
        skill: spec.skill,
        approve: true,
      },
      orgAdmin.id,
    );
    created++;
  }

  console.log(
    `Seeded ${created} curated diagnostic question(s) (${ALL_DIAGNOSTIC_QUESTION_SPECS.length} total in the curated set: 3 roles x 4 statistical + 6 shared)`,
  );
}
