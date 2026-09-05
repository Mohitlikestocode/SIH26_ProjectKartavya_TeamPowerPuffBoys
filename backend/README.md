# Kartavya Backend

Node.js + Express + TypeScript backend for the Kartavya competency/learning platform (SIH26101, MoSPI/DIID). Scope and build order: see [`../prompt.md`](../prompt.md).

## Structure

```
backend/
  src/
    app.ts, server.ts       Express app wiring + entrypoint
    config/                 env, Prisma client
    middleware/              auth (JWT), rbac, error handling
    modules/                 one folder per domain (routes/controller/service)
    types/                   shared DTOs (domains, violation events, ...)
  prisma/
    schema.prisma           Prisma models
    seed/                   idempotent seed scripts (ontology, roles, iGOT, NSSTA)
  postman/                  API collection, grows with each phase
```

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` etc.
3. `npm run prisma:migrate` — applies the schema to your Postgres instance.
4. `npm run seed` — populates the competency ontology, target roles, iGOT/NSSTA mock catalogues, demo users (one per role, password `password123`), the baseline diagnostic assessment, and 40 synthetic learners with competency scores + attempt history (for the dashboards to have real data to show).
5. `npm run dev` — starts the API on `PORT` (default 4000).

## Status

**Phase 1 (Foundation)** — done: Prisma schema, seed scripts (ontology/roles/iGOT/NSSTA/demo users), mock-SSO auth + JWT + RBAC.

**Phase 2 (Competency + Recommendations)** — done: gap-scoring (`/api/competency/gap-map`, radar-chart-ready), iGOT/NSSTA search adapters (same response shape, ~146 iGOT courses across 5 levels x 28 sub-skills + 26 NSSTA/TPAC programmes, both carrying `level`/`rating`), rules-based recommendation engine with a "why recommended" string per candidate (tag-overlap x gap-magnitude, plus a small token-overlap text-similarity tiebreaker — an honest interim stand-in for the real pgvector/embeddings layer prompt.md describes, since this environment has neither the pgvector extension nor an embeddings API key; swapping in real embeddings later only means replacing `textOverlapScore()` in `recommendations.service.ts`).

**Phase 3 (Sessions, QR, Proctoring)** — done:
- Every `Assessment` carries `isProctored: boolean` (default `false`, set at creation time — `POST /api/assessments`). This is the trainer's per-test toggle: if `false`, the assessment runner shouldn't launch the camera harness at all, and `POST /api/violations` rejects events against a non-proctored attempt (`400 This assessment is not proctored`) as a backend-enforced backstop — proctoring can't be turned on client-side against the backend's knowledge.
- `POST /api/sessions` (trainer/org_admin) creates a `Session` for an `Assessment`, signs a short-lived join token, returns a QR code as a base64 PNG data URL (`qrDataUrl`) plus the raw `joinUrl` (`{FRONTEND_URL}/join/{sessionId}?token=...`).
- `POST /api/sessions/:id/regenerate-qr` invalidates the previous QR (old token stops working) and issues a new one.
- `POST /api/sessions/:id/join` is what the frontend's scan page calls after decoding the QR: validates the token + expiry, then creates (or resumes) an `Attempt` and hands back `{ attempt, assessment }` so the frontend can render the questions immediately.
- `POST /api/attempts` / `GET /api/attempts/:id` / `POST /api/attempts/:id/submit` — direct (non-QR) attempt lifecycle, e.g. the diagnostic test. Submit scores MCQ/diagnostic assessments itself (see the "MCQ contract assumption" note below) and blends the result into `UserCompetencyScore`.
- `POST /api/violations` — proctoring client (frontend MediaPipe Tasks Vision + fullscreen/visibility listeners) posts events here; every violation type counts equally and it takes 6 to auto-kick and force-submit the attempt (deliberately not sensitive — a single glance away shouldn't end a test). `GET /api/violations/:attemptId` is the trainer/org-admin audit trail.
- `GET /api/assessments/diagnostic` assembles a balanced onboarding test across all 4 domains against a clearly-labelled **stub** question set (`isStub: true` on every question) — swap for a real call once the MCQ teammate's question bank exists.

**MCQ contract assumption (temporary, isolated to one function):** until the teammate's question-bank module lands, `attempts.service.ts`'s scorer assumes each `Assessment.questions[]` entry looks like `{ id, domainTag, subSkillTag, correctIndex }` and that submitted answers look like `{ questionId, selectedIndex }[]`. Everything else in the codebase only ever touches `Assessment.questions` as opaque JSON, so reconciling the real shape later means editing `scoreMcqLike()` in `src/modules/attempts/attempts.service.ts` and nothing else. **See [`MCQ_CONTRACT_PROPOSAL.md`](MCQ_CONTRACT_PROPOSAL.md) — a concrete doc to confirm/correct with the MCQ module's author, since this is currently an unconfirmed guess everything downstream (gap map, recommendations, heatmap) depends on.**

**Phase 4 (Simulations)** — done: `ScenarioGraph` type + two fully fleshed branching scenarios (`data-quality-check`, `survey-design` — see `SCENARIOS` in `simulations.service.ts`), each with real multi-step decision trees and distinct terminal outcomes scored 15-95. `GET /api/simulations/scenarios` / `GET /api/simulations/scenarios/:id` browse templates; `POST /api/simulations/assessments` (trainer/org_admin) creates an `Assessment` (type=simulation) from one. Submitting a simulation attempt goes through the *same* `POST /api/attempts/:id/submit` endpoint as MCQ — pass the path taken (`[{ nodeId, choiceId }, ...]`) as `answers`; `scoreSimulationPath()` validates it actually follows the graph's edges (no skipping to a favorable outcome) before scoring, and the result feeds `UserCompetencyScore` exactly like an MCQ attempt.

**Phase 5 (Dashboards)** — done:
- `GET /api/dashboards/employee` — gap map, ranked gaps, recommendations (all Phase 2, bundled), active attempts, chronological progress/score history, and available (not-yet-attempted) assessments.
- `GET /api/dashboards/trainer` — a trainer's own assessments + sessions (with attempt counts).
- `GET /api/dashboards/admin/heatmap?department=&cadre=&state=` — workforce-wide competency heatmap: average gap per domain, grouped by cadre, filterable. Backed by `prisma/seed/synthetic.seed.ts` (40 synthetic learners across cadres/states with deliberately-gapped competency scores + attempt history) so this isn't an empty grid until real users exist.
- `GET /api/dashboards/admin/effectiveness-trend` — average submitted-attempt score by month. Documented honestly in-code as a proxy: this backend doesn't yet track a recommendation -> enrollment -> re-attempt linkage, so it's "is the average score trending up" rather than "did *this specific* recommendation work."
- `GET /api/dashboards/admin/violations?limit=` — org-wide violation feed (not just per-attempt), most recent first.

**Not yet built:** Phase 6 (Sarvam multilingual).

**Environment note:** this was built and type-checked (`tsc --noEmit` passes, `prisma validate`/`generate` succeed) without a reachable Postgres instance in the dev sandbox — no `psql`/`docker` available. Point `DATABASE_URL` at a real Postgres, run `npm run prisma:migrate && npm run seed`, and the flows above are ready to exercise end-to-end (Postman collection covers all of them).
