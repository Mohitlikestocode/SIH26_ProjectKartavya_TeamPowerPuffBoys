// The competency labels the Kartavya backend actually recognises.
//
// Mirrored from `backend/prisma/seed/ontology.seed.ts`. This matters more than
// it looks: the backend files every question under a broad `domainTag` (one of
// four) plus a specific `subSkillTag`, and a tag it does not recognise scores
// *nothing* for that sub-skill — with no error. The gap map, the
// recommendation engine and the admin heatmap all keep rendering
// normal-looking numbers built on the missing score.
//
// So tags are resolved here, in code, against a fixed table — never left to
// the model to spell correctly.

export const DOMAINS = [
  "Statistical",
  "Technical",
  "Digital Governance",
  "Behavioural/Managerial",
] as const;

export type Domain = (typeof DOMAINS)[number];

export const ONTOLOGY: Record<Domain, string[]> = {
  Statistical: [
    "Survey Design",
    "Sampling",
    "National Accounts",
    "Price Statistics",
    "Labour Statistics",
    "SDG Indicators",
    "Data Quality Frameworks",
  ],
  Technical: ["Python", "R", "SQL", "Stata", "SPSS", "SAS", "GIS", "Data Viz", "AI/ML", "Cloud"],
  "Digital Governance": ["Cybersecurity", "Data Privacy", "Digital Signatures", "Gov Cloud", "DPI"],
  "Behavioural/Managerial": [
    "Leadership",
    "Communication",
    "Project Management",
    "Ethics",
    "Decision Making",
    "Change Management",
  ],
};

// Same skill, different spelling. The generator brief was written with the
// long-form names; the backend seeds the short ones. Accept either, store the
// backend's.
const ALIASES: Record<string, string> = {
  "Data Visualization": "Data Viz",
  "Cloud Computing": "Cloud",
  "Government Cloud": "Gov Cloud",
};

// Tags the generator brief allows that the backend has never seeded. Questions
// still generate — the tag just has nowhere to score until someone adds it to
// the seed, so every one of these raises a warning and carries the flag
// through to the output file.
const UNSEEDED: Record<string, Domain> = {
  "Agricultural Statistics": "Statistical",
  "Industrial Statistics": "Statistical",
  "Metadata Standards": "Statistical",
  APIs: "Technical",
  "Open Data": "Digital Governance",
};

export interface Competency {
  domainTag: Domain;
  subSkillTag: string;
  /** exact — seeded as-is. alias — renamed to the seeded spelling. unseeded — no home in the backend yet. */
  resolution: "exact" | "alias" | "unseeded";
  note?: string;
}

function domainOf(subSkill: string): Domain | undefined {
  return (Object.keys(ONTOLOGY) as Domain[]).find((d) => ONTOLOGY[d].includes(subSkill));
}

/** Every tag the CLI will accept, for --help and error messages. */
export function knownTags(): string[] {
  return [
    ...Object.values(ONTOLOGY).flat(),
    ...Object.keys(ALIASES),
    ...Object.keys(UNSEEDED),
  ].sort((a, b) => a.localeCompare(b));
}

/** Case-insensitive so `--domain sampling` works. */
export function resolveCompetency(tag: string): Competency {
  const wanted = tag.trim().toLowerCase();
  const match = (candidates: string[]) => candidates.find((c) => c.toLowerCase() === wanted);

  const exact = match(Object.values(ONTOLOGY).flat());
  if (exact) return { domainTag: domainOf(exact)!, subSkillTag: exact, resolution: "exact" };

  const aliased = match(Object.keys(ALIASES));
  if (aliased) {
    const canonical = ALIASES[aliased];
    return {
      domainTag: domainOf(canonical)!,
      subSkillTag: canonical,
      resolution: "alias",
      note: `"${aliased}" is seeded as "${canonical}" — stored under the seeded name.`,
    };
  }

  const unseeded = match(Object.keys(UNSEEDED));
  if (unseeded) {
    return {
      domainTag: UNSEEDED[unseeded],
      subSkillTag: unseeded,
      resolution: "unseeded",
      note: `"${unseeded}" is not in the backend ontology. Questions will score 0 for this sub-skill until it is added to ontology.seed.ts under "${UNSEEDED[unseeded]}".`,
    };
  }

  throw new Error(
    `Unknown competency tag: "${tag}".\nKnown tags:\n  ${knownTags().join("\n  ")}`,
  );
}
