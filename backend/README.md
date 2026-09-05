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

Scaffold only — module folders contain stub `routes/controller/service` files. Implementation follows the phased build order in `prompt.md`.
