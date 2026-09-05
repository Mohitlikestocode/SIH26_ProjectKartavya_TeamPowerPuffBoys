import "dotenv/config";
import path from "node:path";
import { buildBank } from "./bank";
import { DEFAULT_MODEL } from "./generate";
import { knownTags, ONTOLOGY } from "./ontology";
import { DIFFICULTIES, type Difficulty } from "./schema";
import { readSource } from "./source";
import { STAGES, STAGE_PROFILES, type Stage } from "./stages";

const USAGE = `Case-based question bank generator — Kartavya (SIH26101)

Two stages, because that is the whole design:

  --stage broad      ${STAGE_PROFILES.broad.purpose}
                     default ${STAGE_PROFILES.broad.itemsPerSkill} items/sub-skill, ${STAGE_PROFILES.broad.difficulty}
  --stage specific   ${STAGE_PROFILES.specific.purpose}
                     default ${STAGE_PROFILES.specific.itemsPerSkill} items/sub-skill, ${STAGE_PROFILES.specific.difficulty}

Usage:
  npm run generate -- --source <file> --skills <a,b,c> [--stage broad|specific]

Required:
  --source <file>        Source material as .txt or .md
  --skills <list>        Comma-separated sub-skill tags. Also accepts:
                           all                  every seeded sub-skill (28)
                           domain:Statistical   every sub-skill in one domain

Options:
  --stage <name>         ${STAGES.join(" | ")}          (default: broad)
  --count <n>            Items per sub-skill              (default: per stage)
  --difficulty <level>   ${DIFFICULTIES.join(" | ")}     (default: per stage)
  --out <dir>            Output directory                 (default: out/<stage>)
  --batch-size <n>       Items per API call               (default: 5)
  --model <id>           Model to use                     (default: ${DEFAULT_MODEL})
  --mock                 Run offline with sample output — no API key, no cost
  --help                 Show this message

Output is one JSON file per sub-skill, plus index.json summarising the sweep.

Sub-skill tags:
  ${knownTags().join("\n  ")}
`;

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const name = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[name] = true;
    } else {
      args[name] = next;
      i++;
    }
  }
  return args;
}

function requireString(args: Record<string, string | boolean>, name: string): string {
  const value = args[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required option --${name}. Run with --help for usage.`);
  }
  return value.trim();
}

function parseCount(args: Record<string, string | boolean>, name: string, fallback: number): number {
  const raw = args[name];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) throw new Error(`--${name} must be a positive integer.`);
  return n;
}

function parseSkills(raw: string): string[] {
  if (raw.toLowerCase() === "all") return Object.values(ONTOLOGY).flat();

  if (raw.toLowerCase().startsWith("domain:")) {
    const wanted = raw.slice("domain:".length).trim().toLowerCase();
    const match = Object.keys(ONTOLOGY).find((d) => d.toLowerCase() === wanted);
    if (!match) {
      throw new Error(`Unknown domain "${raw.slice(7)}". Domains: ${Object.keys(ONTOLOGY).join(", ")}`);
    }
    return ONTOLOGY[match as keyof typeof ONTOLOGY];
  }

  const skills = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (skills.length === 0) throw new Error("--skills was empty.");
  return skills;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || process.argv.length <= 2) {
    console.log(USAGE);
    return;
  }

  const stageRaw = typeof args.stage === "string" ? args.stage : "broad";
  if (!(STAGES as readonly string[]).includes(stageRaw)) {
    throw new Error(`--stage must be one of: ${STAGES.join(", ")}`);
  }
  const stage = stageRaw as Stage;
  const profile = STAGE_PROFILES[stage];

  const sourcePath = requireString(args, "source");
  const skills = parseSkills(requireString(args, "skills"));

  const difficultyRaw = typeof args.difficulty === "string" ? args.difficulty : profile.difficulty;
  if (!(DIFFICULTIES as readonly string[]).includes(difficultyRaw)) {
    throw new Error(`--difficulty must be one of: ${DIFFICULTIES.join(", ")}`);
  }
  const difficulty = difficultyRaw as Difficulty;

  const itemsPerSkill = parseCount(args, "count", profile.itemsPerSkill);
  const batchSize = parseCount(args, "batch-size", 5);
  const outDir = typeof args.out === "string" ? args.out : path.join("out", stage);
  const source = readSource(sourcePath);

  console.error(`Stage: ${stage} — ${profile.purpose}`);
  console.error(
    `${skills.length} sub-skill(s) × ${itemsPerSkill} ${difficulty} item(s) = up to ${skills.length * itemsPerSkill} items`,
  );
  for (const w of source.warnings) console.error(`  warning: ${w}`);
  console.error("");

  const index = await buildBank({
    sourcePath: source.path,
    sourceText: source.text,
    skills,
    stage,
    difficulty,
    itemsPerSkill,
    batchSize,
    mock: args.mock === true,
    model: typeof args.model === "string" ? args.model : undefined,
    outDir,
    onProgress: (message) => console.error(message),
  });

  const short = index.skills.filter((s) => s.returned < s.requested);

  console.error("");
  console.error(`Wrote ${index.total_items} item(s) across ${index.skills.length} file(s) in ${outDir}`);
  if (short.length > 0) {
    console.error(
      `${short.length} sub-skill(s) returned fewer items than requested — the source material does not cover them deeply enough. See index.json.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
