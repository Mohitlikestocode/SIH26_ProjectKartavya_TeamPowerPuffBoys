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
STAGE 2 — SPECIFIC       only the weakest sub-skills, ~6 items each
   │                     purpose: MEASURE, and localise WHICH misconception
   ▼
gap = required − measured   →   course recommendations
```

Stage 1 answers *where* is this person weak. Stage 2 answers *how* — its
distractors are built so the pattern of wrong answers points at a specific
misunderstanding. `src/stages.ts` holds both stage definitions and is the
source of truth; the stage is injected into the generation prompt, so the two
stages genuinely produce different questions rather than different counts of
the same question.

## Commands

```bash
npm install
cp .env.example .env          # ANTHROPIC_API_KEY

npm run generate -- --source samples/sampling-module.txt --skills domain:Statistical --stage broad
npm run generate -- --source samples/sampling-module.txt --skills Sampling --stage specific

npm run demo:broad            # offline, no key, no cost
npm run demo:specific
npm run lint                  # tsc --noEmit
```

Output is one JSON file per sub-skill under `out/<stage>/`, plus `index.json`
summarising the sweep.

## Repo map

| File | Role |
|---|---|
| `src/stages.ts` | **The two-stage design.** Item counts, difficulty, and the prompt intent that makes broad ≠ specific. |
| `src/ontology.ts` | Competency tags, resolved against the backend's seeded list. |
| `src/prompt.ts` | Generation brief. Source material sits behind a cache breakpoint. |
| `src/generate.ts` | Batched API calls, structured outputs, typed error handling. |
| `src/validate.ts` | Quality checks a JSON schema cannot express. |
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
