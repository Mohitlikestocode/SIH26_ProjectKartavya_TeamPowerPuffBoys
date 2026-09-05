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
4. `npm run seed` — populates the competency ontology, target roles, iGOT/NSSTA mock catalogues.
5. `npm run dev` — starts the API on `PORT` (default 4000).

## Status

Scaffold only, except the **Assessment module — Phase 1 (PDF → MCQ generation pipeline)** and **Phase 2 (admin review/edit/manual entry)**, which are implemented:
`src/modules/documents/`, `src/modules/questions/`, and the pipeline logic under `src/lib/` (`ingestion/`, `chunking/`, `llm/`, `validation/`, `mcq/`). See below for how to run it. All other module folders remain stub `routes/controller/service` files; implementation follows the phased build order in `prompt.md`.

## Assessment module — Phase 1: PDF/PPTX/DOCX → MCQ pipeline

Scope: upload a document → extract text (with OCR fallback for scanned pages) → chunk it → generate MCQs per chunk via an LLM → validate → store as `draft` questions. No admin review UI, manual question entry, gamification, or leaderboards yet — those are later phases.

**Data model** (`prisma/schema.prisma`): `SourceDocument` → `Chunk` → `Question`, plus `GenerationRejection` as an audit log of everything the validation layer rejected (with a reason), so rejected generations are never silently discarded.

**Endpoints:**

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/documents` | Upload a file (`multipart/form-data`, field name `file`; PDF/PPTX/DOCX). Extracts + chunks it and returns the `SourceDocument` with its `chunks`. |
| `GET` | `/api/documents/:id` | Fetch a document and its chunks. |
| `POST` | `/api/documents/:id/generate` | Generate + validate an MCQ for every chunk of a processed document. Returns `{ generated, failedChunkIds }`. |
| `GET` | `/api/questions?documentId=&status=` | List generated questions, optionally filtered. |
| `GET` | `/api/questions/:id` | Fetch one question. |

See the **Phase 2** section below for editing, manual creation, and the approve/reject workflow.

**Run it locally with a sample PDF:**

1. `npm install`, copy `.env.example` to `.env`, fill in `DATABASE_URL`.
2. To actually call the LLM, set `SARVAM_API_KEY` and `SARVAM_ENABLED="true"` in `.env`. Without a key, ingestion/chunking still works — generation will fail per-chunk (logged to `GenerationRejection` as `"LLM call failed"`) rather than crashing.
3. `npm run prisma:migrate` to apply the schema.
4. `npm run dev`.
5. Upload a sample PDF:
   ```bash
   curl -F "file=@/path/to/sample.pdf" http://localhost:4000/api/documents
   ```
   Note the returned `id`. Check `ocrFlaggedPages` in the response — any page numbers listed there had no extractable text layer and were routed through OCR.
6. Kick off generation for that document:
   ```bash
   curl -X POST http://localhost:4000/api/documents/<id>/generate
   ```
7. List the generated (draft) questions:
   ```bash
   curl "http://localhost:4000/api/questions?documentId=<id>"
   ```

Each question stores: `question`, `options[4]`, `isNegatedStem` (whether the stem is a "NOT"/"EXCEPT" style question), `correctOption` (index, derived — never trusted directly from the model), `explanations` (`[{ optionIndex, isTrueStatement, isCorrect, text }, ...]`, index-aligned to `options`), `domain`/`skill` (stub `"TBD"` — populated by a later competency-ontology module), and `status` (`draft` / `approved` / `rejected`).

## Assessment module — Phase 2: admin review, edit, and manual question entry

Scope: let an admin list/filter AI-generated questions, edit any field of one (re-validated on save), create a question from scratch with no AI involvement, and move a question through a `draft → approved/rejected` status workflow — with every edit logged for audit. No frontend/UI here — API only. No real authentication yet either (see **Admin identity** below). The `assessments`/`attempts` modules are untouched — this phase only manages the `Question` bank they'll eventually draw from.

**Shared validation:** `src/lib/validation/validateMcq.ts` and `src/lib/mcq/deriveCorrectOption.ts` are the single code path used by generation (Phase 1), admin edits, and manual creation. An admin can never set `correctOption` directly — it's always re-derived from `optionEvaluations[].isTrueStatement` + `isNegatedStem`, and the result is re-run through `validateMcq` before saving. If that produces an inconsistent or otherwise invalid question, the request is rejected with a `422` and a clear reason — nothing is silently saved.

**Admin identity (placeholder):** there is no auth/user model yet (`src/modules/auth` is a stub). Every write endpoint below requires an `x-admin-id` header — any non-empty string — which is trusted as-is and stored verbatim in `QuestionEditLog.editedBy`. **This is not real authentication.** Once a real Auth module exists, replace `src/middleware/adminIdentity.ts` with actual session/JWT verification, and consider migrating `editedBy` to a foreign key against the real user table.

**Data model additions** (`prisma/schema.prisma`): `Question.sourceDocumentId`/`chunkId`/`chunkText` are now nullable (manual questions have none); `Question.isNegatedStem` is a real column (new — existing pre-Phase-2 rows default to `false`, which is not necessarily accurate for those, since the field wasn't persisted before now); `QuestionStatus` gained `rejected`; new `QuestionEditLog` table (`questionId`, `editedBy`, `editedAt`, `fieldChanged`, `oldValue`, `newValue`) records one row per changed field on every edit, manual creation, and status change.

**Endpoints:**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/questions?status=&documentId=&chunkId=&isNegatedStem=&page=&pageSize=` | — | List/filter questions, paginated (`pageSize` max 100, default 20). Returns `{ data, page, pageSize, total, totalPages }`. |
| `GET` | `/api/questions/:id` | — | Fetch one question. |
| `POST` | `/api/questions` | `x-admin-id` | Create a question manually (no source chunk). Runs through the same `validateMcq` as generation. Defaults to `draft` status unless `"approve": true` is passed. |
| `PATCH` | `/api/questions/:id` | `x-admin-id` | Edit any subset of: `question`, `options` (all 4), `isNegatedStem`, `optionEvaluations` (all 4, full replace), `domain`, `skill`. Re-derives `correctOption` and re-validates before saving; `422` on an invalid result. |
| `POST` | `/api/questions/:id/approve` | `x-admin-id` | Set status to `approved`. Optional `{ "reason": "..." }` in the body, recorded in the edit log. |
| `POST` | `/api/questions/:id/reject` | `x-admin-id` | Set status to `rejected` (record kept, not deleted). Optional `{ "reason": "..." }`. |

**curl examples:**

List draft questions:
```bash
curl "http://localhost:4000/api/questions?status=draft&pageSize=10"
```

Edit a question (fix an explanation's wording and correct which option is true — `correctOption` is re-derived automatically):
```bash
curl -X PATCH http://localhost:4000/api/questions/<id> \
  -H "Content-Type: application/json" -H "x-admin-id: reviewer-1" \
  -d '{
    "optionEvaluations": [
      { "optionIndex": 0, "isTrueStatement": false, "text": "Not correct — this describes a tertiary activity." },
      { "optionIndex": 1, "isTrueStatement": true,  "text": "Correct — this is the primary-sector activity." },
      { "optionIndex": 2, "isTrueStatement": false, "text": "Not correct — tertiary sector." },
      { "optionIndex": 3, "isTrueStatement": false, "text": "Not correct — tertiary sector." }
    ]
  }'
```

Create a question manually (no AI, no source chunk):
```bash
curl -X POST http://localhost:4000/api/questions \
  -H "Content-Type: application/json" -H "x-admin-id: reviewer-1" \
  -d '{
    "question": "Which of the following is a primary sector activity?",
    "options": ["Agriculture", "Banking", "Software development", "Retail trade"],
    "isNegatedStem": false,
    "optionEvaluations": [
      { "optionIndex": 0, "isTrueStatement": true,  "text": "Agriculture is a primary sector activity." },
      { "optionIndex": 1, "isTrueStatement": false, "text": "Banking is a tertiary sector activity." },
      { "optionIndex": 2, "isTrueStatement": false, "text": "Software development is a tertiary sector activity." },
      { "optionIndex": 3, "isTrueStatement": false, "text": "Retail trade is a tertiary sector activity." }
    ],
    "domain": "Economics",
    "skill": "Sector Classification"
  }'
```

Approve or reject a reviewed question:
```bash
curl -X POST http://localhost:4000/api/questions/<id>/approve \
  -H "Content-Type: application/json" -H "x-admin-id: reviewer-1" -d '{}'

curl -X POST http://localhost:4000/api/questions/<id>/reject \
  -H "Content-Type: application/json" -H "x-admin-id: reviewer-1" \
  -d '{ "reason": "Factually incorrect answer key — source passage misread." }'
```

**Known, accepted limitations carried forward from Phase 1** (not addressed in Phase 2): ~4.5% of generated questions may have a factually wrong answer key due to the model misreading a messy source passage (a grounding issue admin review is meant to catch, not something the pipeline self-corrects); negated/"EXCEPT"-stem questions are currently over-represented in generation output — a prompt-level tuning task, not in scope here.
