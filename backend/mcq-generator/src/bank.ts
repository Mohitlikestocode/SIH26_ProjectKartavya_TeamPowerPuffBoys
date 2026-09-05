import fs from "node:fs";
import path from "node:path";
import { generate } from "./generate";
import { resolveCompetency } from "./ontology";
import type { BankIndex, Difficulty, SkillBankFile, TaggedQuestion } from "./schema";
import { stageProfile, type Stage } from "./stages";
import { validate } from "./validate";

export interface BankOptions {
  sourcePath: string;
  sourceText: string;
  /** Sub-skill tags to sweep. One output file each. */
  skills: string[];
  stage: Stage;
  difficulty: Difficulty;
  itemsPerSkill: number;
  batchSize: number;
  mock: boolean;
  model?: string;
  outDir: string;
  onProgress?: (message: string) => void;
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function buildBank(opts: BankOptions): Promise<BankIndex> {
  const log = opts.onProgress ?? (() => {});
  const profile = stageProfile(opts.stage);

  fs.mkdirSync(path.resolve(opts.outDir), { recursive: true });

  const entries: BankIndex["skills"] = [];
  let model = opts.mock ? "mock" : (opts.model ?? "");
  let total = 0;

  for (const [i, tag] of opts.skills.entries()) {
    const competency = resolveCompetency(tag);
    const fileName = `${slug(competency.subSkillTag)}.json`;
    const warnings: string[] = [];
    if (competency.note) warnings.push(competency.note);

    log(
      `[${i + 1}/${opts.skills.length}] ${competency.domainTag} → ${competency.subSkillTag} (${opts.itemsPerSkill} ${opts.difficulty} items)`,
    );
    for (const w of warnings) log(`    warning: ${w}`);

    let questions: TaggedQuestion[] = [];
    let notes = "";

    try {
      const result = await generate({
        sourceText: opts.sourceText,
        domain: competency.subSkillTag,
        difficulty: opts.difficulty,
        count: opts.itemsPerSkill,
        stage: opts.stage,
        batchSize: opts.batchSize,
        mock: opts.mock,
        model: opts.model,
        onProgress: (m) => log(`    ${m}`),
      });
      model = result.model;

      const report = validate(result.questions, competency.subSkillTag);
      for (const { question, reason } of report.rejected) log(`    dropped ${question.id}: ${reason}`);
      for (const w of report.warnings) log(`    warning: ${w}`);
      warnings.push(...report.warnings);

      questions = report.kept.map((q) => ({ ...q, competency, stage: opts.stage }));
      notes = result.notes.join(" ");
    } catch (error) {
      // One sub-skill failing should not lose the rest of a long sweep — the
      // failure is recorded in the index and the run continues.
      const message = error instanceof Error ? error.message : String(error);
      log(`    FAILED: ${message}`);
      warnings.push(`Generation failed: ${message}`);
      notes = "Generation failed for this sub-skill — see warnings.";
    }

    const file: SkillBankFile = {
      meta: {
        generated_at: new Date().toISOString(),
        model,
        stage: opts.stage,
        source_file: opts.sourcePath,
        requested_tag: tag,
        domain_tag: competency.domainTag,
        sub_skill_tag: competency.subSkillTag,
        difficulty: opts.difficulty,
        requested_count: opts.itemsPerSkill,
        returned_count: questions.length,
      },
      questions,
      notes,
      warnings,
    };

    fs.writeFileSync(
      path.join(opts.outDir, fileName),
      `${JSON.stringify(file, null, 2)}\n`,
      "utf8",
    );

    total += questions.length;
    entries.push({
      requested_tag: tag,
      domain_tag: competency.domainTag,
      sub_skill_tag: competency.subSkillTag,
      resolution: competency.resolution,
      file: fileName,
      requested: opts.itemsPerSkill,
      returned: questions.length,
      warnings,
    });
  }

  const index: BankIndex = {
    generated_at: new Date().toISOString(),
    model,
    stage: opts.stage,
    stage_purpose: profile.purpose,
    source_file: opts.sourcePath,
    difficulty: opts.difficulty,
    items_per_skill: opts.itemsPerSkill,
    total_items: total,
    skills: entries,
  };

  fs.writeFileSync(
    path.join(opts.outDir, "index.json"),
    `${JSON.stringify(index, null, 2)}\n`,
    "utf8",
  );

  return index;
}
