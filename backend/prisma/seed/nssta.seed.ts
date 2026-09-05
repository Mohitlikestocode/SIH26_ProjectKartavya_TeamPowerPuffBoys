import { PrismaClient } from "@prisma/client";

// Mock NSSTA/TPAC dataset, structured from published MoSPI residential
// training-calendar fields. Same interface shape as the iGOT adapter
// (competencyTags) so the recommendation engine treats both sources
// uniformly — see prompt.md Phase 2, item 8.

const VENUES = [
  "NSSTA, Greater Noida",
  "NSSTA Regional Centre, Kolkata",
  "IIPA, New Delhi",
  "NSSTA Regional Centre, Bengaluru",
  "ISI, Kolkata (MoSPI collaboration)",
];

interface ProgrammeSeedBase {
  name: string;
  targetCadre: string[];
  durationDays: number;
  venue: string;
  batchSize: number;
  competencyTags: string[];
  description: string;
}

function hashRating(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff;
  return Math.round((3.6 + (h % 131) / 100) * 10) / 10;
}

function deriveLevel(name: string): string {
  if (/foundation|essentials|orientation|introduction/i.test(name)) return "Beginner";
  if (/advanced/i.test(name)) return "Advanced";
  return "Intermediate";
}

const BASE_PROGRAMMES: ProgrammeSeedBase[] = [
  {
    name: "Foundation Course on Official Statistics",
    targetCadre: ["ISS", "SSS"],
    durationDays: 10,
    venue: VENUES[0],
    batchSize: 40,
    competencyTags: ["Statistical", "Survey Design", "Sampling"],
    description: "Induction-level residential course covering the statistical system's structure, survey design fundamentals, and sampling theory.",
  },
  {
    name: "Advanced Sampling Techniques for Large-Scale Surveys",
    targetCadre: ["ISS"],
    durationDays: 5,
    venue: VENUES[0],
    batchSize: 30,
    competencyTags: ["Statistical", "Sampling", "Survey Design"],
    description: "Residential workshop on complex sample design for national surveys (NSS rounds, PLFS).",
  },
  {
    name: "National Accounts Statistics: Compilation & Reconciliation",
    targetCadre: ["ISS"],
    durationDays: 6,
    venue: VENUES[2],
    batchSize: 35,
    competencyTags: ["Statistical", "National Accounts"],
    description: "Covers GDP/GVA compilation methodology, sectoral reconciliation, and base-year revision practices.",
  },
  {
    name: "Price Statistics and Index Number Construction",
    targetCadre: ["ISS", "State DES"],
    durationDays: 5,
    venue: VENUES[1],
    batchSize: 30,
    competencyTags: ["Statistical", "Price Statistics"],
    description: "CPI/WPI compilation, price collection protocols, and index revision methodology.",
  },
  {
    name: "Labour Force Survey Methodology (PLFS)",
    targetCadre: ["State DES", "SSS"],
    durationDays: 5,
    venue: VENUES[1],
    batchSize: 40,
    competencyTags: ["Statistical", "Labour Statistics", "Survey Design"],
    description: "Field-level training on PLFS schedules, definitions, and state-level reporting requirements.",
  },
  {
    name: "SDG Indicator Framework and Monitoring",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 4,
    venue: VENUES[2],
    batchSize: 45,
    competencyTags: ["Statistical", "SDG Indicators", "Data Quality Frameworks"],
    description: "National Indicator Framework alignment, data gaps, and SDG progress reporting.",
  },
  {
    name: "Data Quality Assurance Frameworks for Official Statistics",
    targetCadre: ["ISS", "SSS"],
    durationDays: 4,
    venue: VENUES[0],
    batchSize: 30,
    competencyTags: ["Statistical", "Data Quality Frameworks"],
    description: "Quality assurance frameworks (NQAF-aligned) for survey and administrative data.",
  },
  {
    name: "Python for Statistical Data Processing",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 6,
    venue: VENUES[3],
    batchSize: 35,
    competencyTags: ["Technical", "Python", "Data Viz"],
    description: "Hands-on residential lab on Python (pandas/numpy) for survey data cleaning and tabulation.",
  },
  {
    name: "R Programming for Survey Data Analysis",
    targetCadre: ["ISS", "SSS"],
    durationDays: 5,
    venue: VENUES[3],
    batchSize: 30,
    competencyTags: ["Technical", "R", "Data Viz"],
    description: "R-based analysis workflows for survey estimation and small-area estimation.",
  },
  {
    name: "SQL & Database Management for Statistical Offices",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 4,
    venue: VENUES[0],
    batchSize: 40,
    competencyTags: ["Technical", "SQL"],
    description: "Relational database design and query optimization for departmental data warehouses.",
  },
  {
    name: "GIS and Spatial Analysis for Statistical Applications",
    targetCadre: ["ISS"],
    durationDays: 6,
    venue: VENUES[3],
    batchSize: 25,
    competencyTags: ["Technical", "GIS", "Data Viz"],
    description: "Applied GIS training for survey frame mapping and spatial estimation.",
  },
  {
    name: "AI/ML Applications in Official Statistics",
    targetCadre: ["ISS"],
    durationDays: 5,
    venue: VENUES[4],
    batchSize: 25,
    competencyTags: ["Technical", "AI/ML", "Python"],
    description: "Machine-learning methods for imputation, classification and anomaly detection in survey data.",
  },
  {
    name: "Cloud Computing for Government Data Systems",
    targetCadre: ["ISS", "SSS"],
    durationDays: 4,
    venue: VENUES[2],
    batchSize: 30,
    competencyTags: ["Technical", "Cloud", "Gov Cloud"],
    description: "Cloud infrastructure fundamentals for departmental data platforms, aligned to GI Cloud (MeghRaj) guidelines.",
  },
  {
    name: "Cybersecurity Essentials for Government Officers",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 3,
    venue: VENUES[0],
    batchSize: 45,
    competencyTags: ["Digital Governance", "Cybersecurity"],
    description: "Baseline cybersecurity hygiene, threat awareness, and incident-reporting protocols for government systems.",
  },
  {
    name: "Data Privacy and Protection in Public Data Systems",
    targetCadre: ["ISS", "SSS"],
    durationDays: 3,
    venue: VENUES[1],
    batchSize: 35,
    competencyTags: ["Digital Governance", "Data Privacy"],
    description: "DPDP Act compliance, anonymization techniques, and privacy-by-design for statistical microdata.",
  },
  {
    name: "Digital Public Infrastructure (DPI) Orientation",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 3,
    venue: VENUES[2],
    batchSize: 40,
    competencyTags: ["Digital Governance", "DPI", "Gov Cloud"],
    description: "Overview of India's DPI stack (Aadhaar, DigiLocker, ONDC-style architectures) and its relevance to statistical data ecosystems.",
  },
  {
    name: "Leadership and Change Management for Statistical Officers",
    targetCadre: ["ISS", "SSS"],
    durationDays: 5,
    venue: VENUES[2],
    batchSize: 30,
    competencyTags: ["Behavioural/Managerial", "Leadership", "Change Management"],
    description: "Residential leadership development programme with a focus on managing organisational change in statistical offices.",
  },
  {
    name: "Project Management for Survey Operations",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 4,
    venue: VENUES[0],
    batchSize: 35,
    competencyTags: ["Behavioural/Managerial", "Project Management"],
    description: "Planning and execution of multi-state survey operations using structured project-management methods.",
  },
  {
    name: "Effective Communication for Public Officials",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 3,
    venue: VENUES[1],
    batchSize: 40,
    competencyTags: ["Behavioural/Managerial", "Communication"],
    description: "Written and verbal communication skills for reporting to policymakers and the public.",
  },
  {
    name: "Ethics and Decision-Making in Public Service",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 3,
    venue: VENUES[2],
    batchSize: 40,
    competencyTags: ["Behavioural/Managerial", "Ethics", "Decision Making"],
    description: "Case-based training on ethical decision-making frameworks in government service delivery.",
  },
  {
    name: "SPSS for Survey Data Analysis",
    targetCadre: ["ISS", "SSS"],
    durationDays: 4,
    venue: VENUES[1],
    batchSize: 30,
    competencyTags: ["Technical", "SPSS"],
    description: "Statistical analysis and hypothesis testing workflows in SPSS for survey microdata.",
  },
  {
    name: "SAS Programming for Official Statistics",
    targetCadre: ["ISS"],
    durationDays: 5,
    venue: VENUES[0],
    batchSize: 25,
    competencyTags: ["Technical", "SAS"],
    description: "SAS macro programming and large-dataset processing for national-survey pipelines.",
  },
  {
    name: "Stata for Econometric Analysis of Survey Data",
    targetCadre: ["ISS", "SSS"],
    durationDays: 5,
    venue: VENUES[3],
    batchSize: 25,
    competencyTags: ["Technical", "Stata"],
    description: "Econometric modelling and survey-weighted estimation techniques in Stata.",
  },
  {
    name: "Digital Signature Certificates & e-Governance Workflows",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 2,
    venue: VENUES[2],
    batchSize: 45,
    competencyTags: ["Digital Governance", "Digital Signatures"],
    description: "DSC issuance, e-signing workflows, and legal validity of digitally signed government documents.",
  },
  {
    name: "Data Visualization for Policy Communication",
    targetCadre: ["ISS", "SSS", "State DES"],
    durationDays: 3,
    venue: VENUES[3],
    batchSize: 35,
    competencyTags: ["Technical", "Data Viz"],
    description: "Designing dashboards and charts that communicate statistical findings clearly to policymakers.",
  },
  {
    name: "Change Management for Digital Transformation Projects",
    targetCadre: ["ISS", "SSS"],
    durationDays: 3,
    venue: VENUES[2],
    batchSize: 30,
    competencyTags: ["Behavioural/Managerial", "Change Management"],
    description: "Frameworks for leading organisational change during departmental digitalization initiatives.",
  },
];

export const NSSTA_PROGRAMMES = BASE_PROGRAMMES.map((p) => ({
  ...p,
  level: deriveLevel(p.name),
  rating: hashRating(p.name),
}));

export async function seedNsstaProgrammes(prisma: PrismaClient) {
  for (const p of NSSTA_PROGRAMMES) {
    const existing = await prisma.trainingProgramme.findFirst({ where: { name: p.name } });
    if (existing) {
      await prisma.trainingProgramme.update({ where: { id: existing.id }, data: p });
    } else {
      await prisma.trainingProgramme.create({ data: p });
    }
  }
  console.log(`Seeded ${NSSTA_PROGRAMMES.length} NSSTA/TPAC training programmes`);
}
