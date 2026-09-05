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
| MCQ per sub-skill | 2 | 6 |
| Written items per sub-skill | 0 | 1 |
| Default difficulty | intermediate | advanced |
| Job | rank sub-skills weakest-first | measure, and localise the misconception |
| Item style | one central idea, cleanly separates can/cannot | each distractor is a different failure mode |

Inside stage 2 the two kinds do different jobs. **The MCQs carry the score** —
deterministic, and a trainer can check the key. **The written items carry the
diagnosis** and the rubric a grader marks against; they are not scored
automatically, because a model's reading of a paragraph should not set someone's
competency level until a measured agreement rate says it can.

Standalone by design: no server, no database. It reads a file and writes JSON.

## Setup

```bash
npm install
cp .env.example .env      # then put your GROQ_API_KEY in it
```

Runs on **Groq**, using strict structured outputs — the response is constrained
to the schema during decoding rather than merely asked for. That needs a model
which supports strict mode (`openai/gpt-oss-120b` by default; also
`openai/gpt-oss-20b`, `qwen/qwen3.8-27b`). Other Groq models still work, but
degrade to best-effort JSON, so expect more rejected batches.

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
| `--count` | per stage | MCQ items per sub-skill |
| `--free-text` | per stage | Written items per sub-skill |
| `--difficulty` | per stage | `foundational`, `intermediate`, `advanced` |
| `--out` | `out/<stage>` | Output directory |
| `--batch-size` | `5` | Items per API call |
| `--model` | `openai/gpt-oss-120b` | Groq model id |
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

Each file holds `questions` (MCQ) and `free_text` (written items). Every item
carries `kind`, its resolved `competency`, and its `stage`.

A written item looks like this — the rubric is the substantial part:

```json
{
  "kind": "free_text",
  "scenario": "…a work situation…",
  "question": "Explain what these reports tell you, and what you would do.",
  "reference_answer": "…what a strong answer contains, shown to the learner after…",
  "criteria": [
    {
      "key": "c2",
      "claim": "States that this is frame error rather than non-response, and that a weighting adjustment does not fix it",
      "met_example": "A non-response adjustment would be wrong here, because these units were never eligible for selection…",
      "not_met_example": "I would apply a non-response weighting adjustment to the units that did respond…",
      "source_grounding": "Section 1 — non-response is a distinct problem"
    }
  ]
}
```

**Each criterion is a claim the answer must make, not a term it must contain.**
`"mentions non-response bias"` is passed by anyone who writes the phrase;
the claim above is not. `met_example` and `not_met_example` are the anchors a
grader marks against, which is what stops it drifting lenient between runs.

## How it works

1. **`stages.ts`** decides what a good item looks like for this stage, and that
   intent goes into the prompt — so broad and specific genuinely differ.
2. **`ontology.ts`** resolves each tag against the backend's seeded labels
   *before* any API call, so a typo costs nothing.
3. **`prompt.ts`** assembles the brief, the stage intent and the source
   material into one system message. Groq has no prompt-caching API, so the
   document is re-sent on every request — which makes `--batch-size` a cost
   lever as well as a reliability one.
4. **`generate.ts`** requests items in small batches, passing what already
   exists so the model covers new ground. **`llm.ts`** is the only file that
   knows the provider: it derives the JSON schema from the Zod schema, calls
   Groq, and re-validates the parsed result with Zod regardless — strict mode
   should make that unreachable, but a model without strict support degrades
   silently, and a malformed item is worse than a failed request because it
   reaches a learner.
5. **`validate.ts`** checks what the schema cannot. For MCQs: four distinct
   options keyed A–D, a correct option that exists, reasoning for every option,
   no duplicates, a scenario long enough to require judgement, and a skewed
   answer key across the set. For written items: 3–5 criteria, no criterion
   whose met and not-met examples are the same, a reference answer present, and
   a warning on any claim phrased as `"mentions X"` or short enough to be
   satisfied by vocabulary. Failing items are dropped and reported.
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
