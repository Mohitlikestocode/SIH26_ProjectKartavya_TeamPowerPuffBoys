import "dotenv/config";
import fs from "node:fs";
import { gradeCriterion } from "./grade";
import { DEFAULT_MODEL } from "./llm";
import type { SkillBankFile, TaggedFreeTextItem } from "./schema";

// ---------------------------------------------------------------------------
// Does the grader get the right answer when we already know the right answer?
//
// Every criterion ships with a met_example and a not_met_example. Compose an
// answer out of a chosen subset of those and the correct marking is known BY
// CONSTRUCTION — no model, and no human, was asked for an opinion. That is
// what stops this being circular: a grader cannot pass by agreeing with
// itself.
//
// It is a floor, not a ceiling. These answers use the rubric's own phrasing
// and read like assembled fragments, so a real officer under time pressure is
// harder. A bad score here is conclusive; a good score is necessary, not
// sufficient.
// ---------------------------------------------------------------------------

interface Case {
  answer: string;
  /** Index-aligned to the item's criteria: was this criterion built in or left out? */
  shouldBeMet: boolean[];
}

/**
 * Builds a spread of cases, always including all-met and none-met — the two
 * that catch a grader stuck saying the same thing every time.
 */
function buildCases(item: TaggedFreeTextItem, wanted: number): Case[] {
  const k = item.criteria.length;
  const total = 2 ** k;
  const masks = new Set<number>([0, total - 1]);
  for (let i = 1; masks.size < Math.min(wanted, total); i++) {
    masks.add(Math.floor((i * total) / Math.min(wanted, total)) % total);
  }

  return [...masks].sort((a, b) => a - b).map((mask) => {
    const shouldBeMet = item.criteria.map((_, i) => Boolean(mask & (1 << i)));
    const answer = item.criteria
      .map((c, i) => (shouldBeMet[i] ? c.met_example : c.not_met_example))
      .join(" ");
    return { answer, shouldBeMet };
  });
}

interface Tally {
  decisions: number;
  correct: number;
  /** Credit given for something the answer does not contain. The dangerous error. */
  falseMet: number;
  /** Credit withheld for something the answer does contain. */
  falseNotMet: number;
  fabricatedQuotes: number;
}

async function main() {
  const args = process.argv.slice(2);
  const arg = (name: string) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const bankPath = arg("bank");
  if (!bankPath) {
    console.error(
      `Usage: npm run selftest -- --bank <file.json> [--cases 6] [--model <id>]\n\n` +
        `Grades composed answers whose correct marking is known by construction,\n` +
        `then reports how often the grader agreed.`,
    );
    process.exitCode = 1;
    return;
  }

  const cases = Number(arg("cases") ?? 6);
  const model = arg("model") ?? DEFAULT_MODEL;
  const bank: SkillBankFile = JSON.parse(fs.readFileSync(bankPath, "utf8"));

  if (!bank.free_text?.length) {
    console.error(`No written items in ${bankPath}. Generate a specific-stage bank first.`);
    process.exitCode = 1;
    return;
  }

  const t: Tally = { decisions: 0, correct: 0, falseMet: 0, falseNotMet: 0, fabricatedQuotes: 0 };
  const misses: string[] = [];

  console.error(`Grading with ${model}\n`);

  for (const item of bank.free_text) {
    const built = buildCases(item, cases);
    console.error(`${item.id} — ${item.criteria.length} criteria × ${built.length} answers`);

    for (const [n, c] of built.entries()) {
      for (const [i, criterion] of item.criteria.entries()) {
        const graded = await gradeCriterion({
          scenario: item.scenario,
          question: item.question,
          answer: c.answer,
          criterion,
          model,
        });

        // A not_met_example usually states a misconception, so "contradicted"
        // is as correct as "not_met" — both mean the claim was not asserted.
        const gotMet = graded.verdict === "met";
        const ok = gotMet === c.shouldBeMet[i];

        t.decisions++;
        if (ok) t.correct++;
        else if (gotMet) t.falseMet++;
        else t.falseNotMet++;
        if (graded.fabricatedQuote) t.fabricatedQuotes++;

        if (!ok) {
          misses.push(
            `  case ${n + 1}, ${criterion.key}: expected ${c.shouldBeMet[i] ? "met" : "not met"}, got ${graded.verdict}` +
              `\n     claim: ${criterion.claim}` +
              `\n     quote: ${graded.quote || "(none)"}`,
          );
        }
      }
      process.stderr.write(`  case ${n + 1}/${built.length} done\n`);
    }
  }

  const pct = (n: number) => `${((n / t.decisions) * 100).toFixed(1)}%`;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Marking decisions   ${t.decisions}`);
  console.log(`Agreed              ${t.correct}  (${pct(t.correct)})`);
  console.log(`Credit not earned   ${t.falseMet}  (${pct(t.falseMet)})   <- the dangerous error`);
  console.log(`Credit missed       ${t.falseNotMet}  (${pct(t.falseNotMet)})`);
  console.log(`Fabricated quotes   ${t.fabricatedQuotes}  (caught and discarded)`);
  console.log("=".repeat(60));

  if (misses.length) {
    console.log(`\nDisagreements:\n${misses.join("\n")}`);
    console.log(
      `\nA criterion that misses repeatedly is usually worded badly, not graded badly — ` +
        `check its claim before blaming the model.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(`\nError: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
