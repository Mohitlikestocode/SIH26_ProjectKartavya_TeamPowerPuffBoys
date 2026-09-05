# Case-Based Question Bank Generator — Kartavya (SIH26101)

Turns uploaded course material into case-based multiple-choice items: a work
scenario a government statistical officer would plausibly face, four options
where the three wrong ones are realistic mistakes, and a per-option explanation
shown to the learner after they answer.

It generates a **bank ahead of time**, in two stages. See [CLAUDE.md](CLAUDE.md)
for why the two stages exist — that is the design this tool serves.

| | Stage 1 — `broad` | Stage 2 — `specific` |
|---|---|---|
| Covers | every sub-skill the role requires | only the weakest sub-skills |
| Items per sub-skill | 2 | 6 |
| Default difficulty | intermediate | advanced |
| Job | rank sub-skills weakest-first | measure, and localise the misconception |
| Item style | one central idea, cleanly separates can/cannot | each distractor is a different failure mode |

Standalone by design: no server, no database. It reads a file and writes JSON.

## Setup

```bash
npm install
cp .env.example .env      # then put your ANTHROPIC_API_KEY in it
```

## Run

```bash
# Stage 1 — screen a whole domain
npm run generate -- --source samples/sampling-module.txt --skills domain:Statistical --stage broad

# Stage 2 — deep dive on what stage 1 flagged
npm run generate -- --source samples/sampling-module.txt --skills Sampling --stage specific
```

Offline, no key and no cost:

```bash
npm run demo:broad
npm run demo:specific
```

| Option | | |
|---|---|---|
| `--source` | required | Source material, `.txt` or `.md` |
| `--skills` | required | Comma-separated tags, or `all`, or `domain:Statistical` |
| `--stage` | `broad` | `broad` or `specific` |
| `--count` | per stage | Items per sub-skill |
| `--difficulty` | per stage | `foundational`, `intermediate`, `advanced` |
| `--out` | `out/<stage>` | Output directory |
| `--batch-size` | `5` | Items per API call |
| `--model` | `claude-opus-5` | Model id |
| `--mock` | off | Offline sample output |

`--help` lists every valid sub-skill tag.

## Output

One file per sub-skill, plus an index:

```
out/broad/
  index.json              the whole sweep at a glance
  sampling.json           items + resolved competency labels + warnings
  survey-design.json
  ...
```

## How it works

1. **`stages.ts`** decides what a good item looks like for this stage, and that
   intent goes into the prompt — so broad and specific genuinely differ.
2. **`ontology.ts`** resolves each tag against the backend's seeded labels
   *before* any API call, so a typo costs nothing.
3. **`prompt.ts`** puts the source material behind a cache breakpoint, so a
   28-sub-skill sweep pays for the document once.
4. **`generate.ts`** requests items in small batches, passing what already
   exists so the model covers new ground. Structured outputs enforce the JSON
   shape — no fence-stripping, no `JSON.parse` guesswork.
5. **`validate.ts`** checks what the schema cannot: four distinct options keyed
   A–D, a correct option that exists, reasoning for every option, no duplicates,
   a scenario long enough to require judgement, and a skewed answer key across
   the set. Failing items are dropped and reported.
6. **`bank.ts`** sweeps the sub-skills and writes the files. One sub-skill
   failing does not lose the rest of the sweep.

Fewer items than requested is expected, not a bug — the brief tells the model to
stop rather than invent content the source does not support.

## Competency tags

Tags resolve three ways:

- **exact** — seeded as written.
- **alias** — same skill, different spelling (`Data Visualization` → `Data Viz`).
  Stored under the seeded name, with a warning.
- **unseeded** — allowed by the brief but absent from the backend (`Open Data`,
  `APIs`, `Metadata Standards`, `Agricultural Statistics`,
  `Industrial Statistics`). Generation proceeds and the flag is written into the
  output, but these score nothing until someone adds them to the seed.

Anything else is rejected before the API call.
