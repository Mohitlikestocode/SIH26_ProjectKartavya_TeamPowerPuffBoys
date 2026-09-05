# MCQ contract — proposal to lock with Tanish

The shared `Assessment`/`Attempt` contract in [`../prompt.md`](../prompt.md) deliberately
leaves `Assessment.questions` as opaque JSON so neither module blocks the other. But
something has to actually be agreed for scoring to work, and right now the backend is
running on a **guess**, isolated to one function
(`scoreMcqLike()` in `src/modules/attempts/attempts.service.ts`). This doc is that guess,
written down so it can be confirmed or corrected in one pass instead of silently drifting.

## What the backend currently assumes

**Each entry in `Assessment.questions[]`:**

```json
{
  "id": "q1",
  "stem": "Which sampling method gives every unit equal selection probability?",
  "options": ["SRS", "Convenience", "Quota", "Snowball"],
  "correctIndex": 0,
  "domainTag": "Statistical",
  "subSkillTag": "Sampling"
}
```

- `id` — unique within the assessment, referenced by submitted answers.
- `correctIndex` — index into `options` the scorer checks against. **If your MCQ
  generation pipeline scores differently (partial credit, multiple correct answers,
  confidence-weighted, etc.), this needs to change.**
- `domainTag` / `subSkillTag` — must match the seeded ontology names exactly (see
  `prisma/seed/ontology.seed.ts` — e.g. `"Statistical"` / `"Sampling"`, not
  `"sampling"` or `"Statistical Methods"`). This is how a score rolls up into the
  competency gap-scoring engine per sub-skill/domain — a mismatched tag silently
  produces no score for that sub-skill instead of an error.

**Each submitted answer, in `POST /api/attempts/:id/submit`'s `answers[]`:**

```json
{ "questionId": "q1", "selectedIndex": 0 }
```

## What actually needs confirming (in priority order)

1. **Does `correctIndex` (single index) match how your validation step marks a
   correct answer?** If your pipeline instead outputs a set of acceptable indices,
   partial-credit weights, or free-text answer matching, the scorer needs a
   different shape and a different scoring function — not just a rename.
2. **Do you already have domain/sub-skill tagging in your generation pipeline**, and
   does it use the same 4 domains / sub-skill names as the seeded ontology? If your
   pipeline tags differently (its own taxonomy), we need a mapping table, not just a
   field rename.
3. **Essay/free-text items** — `prompt.md`'s diagnostic assessment includes a written
   judgement question. Confirm whether that's in scope for your module at all, or
   stays fully on this side (currently: not built, no scoring path exists for it yet).
4. **Anything else your validation/confidence-scoring step outputs that the
   competency engine should see** (e.g. a confidence score, a difficulty rating) —
   worth exposing even if not scored automatically, since the trainer-review UI
   (`TrainerStudio.jsx`) already has slots for confidence/difficulty in the mock.

## Why this matters now, not later

Every score this backend computes — the gap map, the recommendation engine's ranking,
the org-wide competency heatmap — is downstream of whatever `scoreMcqLike()` decides.
If the real shape differs from the guess above, all of it is silently computing
plausible-looking but wrong numbers rather than failing loudly. A 10-minute
confirmation now (even just "yes, that's right" or "no, here's the real shape")
removes that risk entirely — the fix is contained to one function either way.
