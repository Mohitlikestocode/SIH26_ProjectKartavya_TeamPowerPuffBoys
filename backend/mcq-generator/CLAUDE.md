# Kartavya — Case-Based Question Bank Generator

Lives at `backend/mcq-generator/`. Its own npm package — `npm install` here,
not from `backend/`. It never imports from the backend at runtime; the only
coupling is the competency label table described below.

## What this is for

This tool exists to serve **a two-stage competency diagnostic**. That design is
the point of the repo — if a change makes the two stages less distinct, it is
the wrong change.

```
Target role
   │  (defines the required level for each sub-skill)
   ▼
STAGE 1 — BROAD          every sub-skill the role requires, ~2 items each
   │                     purpose: RANK sub-skills weakest-first
   │                     NOT a measurement: 2 items can only score 0/50/100
   ▼
STAGE 2 — SPECIFIC       only the weakest sub-skills
   │                     ~4 MCQ each        → MEASURE (deterministic)
   │                     ~2 written each    → DIAGNOSE (rubric, not scored)
   ▼
gap = required − measured   →   course recommendations
```

Stage 1 answers *where* is this person weak. Stage 2 answers *how* — its
distractors are built so the pattern of wrong answers points at a specific
misunderstanding. `src/stages.ts` holds both stage definitions and is the
source of truth; the stage is injected into the generation prompt, so the two
stages genuinely produce different questions rather than different counts of
the same question.

**Inside stage 2 the two item kinds have different jobs, and this split is
deliberate.** The MCQs produce the competency number — deterministic, and a
trainer can check the key. The written items produce the diagnosis and the
labelled data; a model's reading of a paragraph never sets a competency score.
Model graders reward fluent writing, drift lenient, and can be satisfied by
vocabulary rather than reasoning. None of that matters while nothing is decided
by them. If written items are ever promoted to scoring, it should be because a
measured trainer-agreement rate justified it, not because it seemed to work.

## Commands

```bash
npm install
cp .env.example .env          # GROQ_API_KEY

npm run generate -- --source samples/sampling-module.txt --skills domain:Statistical --stage broad
npm run generate -- --source samples/sampling-module.txt --skills Sampling --stage specific
npm run generate -- --source samples/sampling-module.txt --skills Sampling --stage specific --free-text 2

npm run demo:broad            # offline, no key, no cost
npm run demo:specific
npm run lint                  # tsc --noEmit
```

Output is one JSON file per sub-skill under `out/<stage>/`, plus `index.json`
summarising the sweep. Each file carries `questions` (MCQ) and `free_text`
(written items with their rubrics); every item is tagged `kind`.

## Repo map

| File | Role |
|---|---|
| `src/stages.ts` | **The two-stage design.** Item counts, difficulty, and the prompt intent that makes broad ≠ specific. Also `FREE_TEXT_INTENT`, the rubric-writing brief. |
| `src/ontology.ts` | Competency tags, resolved against the backend's seeded list. |
| `src/prompt.ts` | Generation brief and the two stage intents, assembled into one system message. |
| `src/llm.ts` | **The only file that knows the provider.** Groq client, Zod → strict JSON schema, typed errors. |
| `src/generate.ts` | Batching and the stop-early rules. Provider-agnostic. |
| `src/validate.ts` | Quality checks a JSON schema cannot express, for both item kinds. |
| `src/bank.ts` | Sweeps sub-skills, one output file each. |
| `src/cli.ts` | Argument parsing and reporting. |
| `src/mock.ts` | Offline sample output. |

## Things that are non-obvious and will bite you

**Competency tags fail silently.** The Kartavya backend files every question
under a broad `domainTag` and a specific `subSkillTag`, and a tag it has not
seeded scores *nothing* for that sub-skill — with no error. The gap map,
recommendations and admin heatmap all keep rendering normal-looking numbers
built on the missing score. That is why tags resolve in `ontology.ts` against a
fixed table copied from `../prisma/seed/ontology.seed.ts`, before the API
call, rather than being left to the model to spell. Keep that table in sync
with the seed file.

**Fewer items than requested is correct behaviour.** The brief tells the model
to stop rather than invent content the source does not support, and a short
batch ends the run for that sub-skill. Do not "fix" this by retrying until the
count is met — padded items are worse than missing ones. `notes` in each output
file says what happened.

**A rubric criterion must be a claim, not a keyword.** `"mentions non-response
bias"` is passed by a learner who writes the phrase without understanding it —
the rubric becomes a vocabulary check. `"distinguishes frame error from
non-response, and states that weighting does not fix the former"` cannot be
satisfied without engaging. `validate.ts` warns on claims that look
keyword-shaped or are suspiciously short; those warnings are for a human to act
on, not noise to filter out. Criteria tied to a specific detail of the scenario
are the hardest to game.

**Written items are graded by quoting first.** The intended grading procedure —
see `DESIGN_FREETEXT_EVALUATOR.md` — requires a grader to quote the words in the
answer that establish each claim, and award nothing if no such words exist. That
converts an unreliable judgment task into a tractable entailment one, and it is
why every criterion ships with a `met_example` and a `not_met_example`: they are
the anchors that stop a grader drifting lenient between runs.

**Groq has no prompt caching, so `--batch-size` is a cost lever.** The source
document is re-sent with every request. A 28-sub-skill sweep at batch size 5
sends the document roughly 28 times, not once. Raising the batch size cuts that
proportionally but lengthens each response, and a response that hits the output
limit fails the whole batch — `llm.ts` names that case explicitly rather than
letting it look like a schema error.

**The Zod parse after the API call is not redundant.** Strict structured output
is only available on some Groq models; anything else degrades to best-effort
JSON with no error. The parse in `llm.ts` is what stops a malformed item
reaching a learner, so do not remove it on the grounds that the schema is
already enforced.

**Generate a bank ahead of time; never generate during a live test.** Stage 2
items must exist before a learner reaches stage 2 — generation is far too slow
to sit inside a proctored session, and the trainer UI promises human review
before anything publishes. Stage 2 at runtime is *selection from this bank*,
not generation.

**The backend's score blend currently defeats stage 2.** `feedCompetencyScores()`
in `../src/modules/attempts/attempts.service.ts` blends every result 50/50
with the existing level, so a 2-item screening guess counts as much as a 6-item
deep dive. Stage 2 needs to outweigh stage 1 — a confidence weight based on how
many items actually scored that sub-skill. Until that changes, the two-stage
design underperforms what it should.

## Deliberately not built

**The backend adapter.** The backend stores questions as
`{ id, stem, options: string[], correctIndex, domainTag, subSkillTag }` and
scores them in `scoreMcqLike()`. This tool emits a richer shape — separate
`scenario` and `question`, options keyed A–D, plus explanations that scorer
never reads. The mapping is ~15 lines but is deferred until the contract is
confirmed with the backend author (see [`../MCQ_CONTRACT_PROPOSAL.md`](../MCQ_CONTRACT_PROPOSAL.md)); writing it against a guess means writing it twice.

Competency labels were deliberately **not** deferred, because they are baked
into every generated item — getting them wrong means re-labelling the whole
bank later, not editing one function.
