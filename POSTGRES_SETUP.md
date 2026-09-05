# Postgres setup — from zero to a working backend

Companion to [`prompt.md`](prompt.md). Native Postgres install (no Docker, no
virtualization/WSL2 needed) — follow top to bottom on Windows.

---

## 1. Install Postgres

1. Download the Windows installer from https://www.postgresql.org/download/windows/
   (EnterpriseDB's installer is the standard one — click "Download the installer").
2. Run it. When prompted:
   - Components: leave everything checked (PostgreSQL Server, pgAdmin 4, Command Line
     Tools) — you don't strictly need pgAdmin but it's a handy GUI later if you want one.
   - Data directory / port: leave at the defaults (port `5432`).
   - **Superuser password**: set it to `postgres` (or pick your own — just remember it
     for step 2 below, since it has to match `DATABASE_URL` exactly).
   - Locale: leave at default.
   - Uncheck "Launch Stack Builder" at the end unless you want it (not needed here).
3. Let it finish. The installer also registers a Windows service (something like
   `postgresql-x64-16`) that starts Postgres automatically on boot — you shouldn't need
   to start anything manually.
4. Create the database the app expects. Open **SQL Shell (psql)** from the Start menu:
   - It'll prompt `Server [localhost]:`, `Database [postgres]:`, `Port [5432]:`,
     `Username [postgres]:` — just press Enter through all of these to accept the
     defaults.
   - `Password for user postgres:` — enter the password you set in step 2.
   - At the `postgres=#` prompt, run:
     ```sql
     CREATE DATABASE kartavya;
     ```
   - You should see `CREATE DATABASE`. Type `\q` to exit.

---

## 2. Point the backend at your Postgres

1. Open a terminal in `backend/`.
2. If you haven't already:
   ```bash
   cp .env.example .env
   ```
   (PowerShell: `copy .env.example .env`)
3. Open `.env` and check `DATABASE_URL`. If your superuser password is `postgres` (as
   set in step 1), the default already matches and you can skip editing it:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kartavya?schema=public"
   ```
   If you chose a different password, edit this line to match:
   `postgresql://postgres:<your-password>@localhost:5432/kartavya?schema=public`.

---

## 3. Install dependencies + generate the Prisma client

```bash
npm install
npm run prisma:generate
```
`prisma:generate` reads `prisma/schema.prisma` and produces the typed database client the
backend imports everywhere (`@prisma/client`). Safe to re-run any time the schema changes.

---

## 4. Create the actual tables (first real migration)

```bash
npm run prisma:migrate
```
This is the **first migration ever run against this schema** — no `prisma/migrations/`
folder exists yet. Prisma will:
- ask you to name the migration (anything works, e.g. `init`)
- create `prisma/migrations/<timestamp>_init/migration.sql`
- apply it to your `kartavya` database, creating every table in `schema.prisma`
  (`User`, `CompetencyDomain`, `SubSkill`, `TargetRole`, `Assessment`, `Attempt`,
  `Session`, `Course`, `TrainingProgramme`, etc.)

If this hangs or errors with **"Can't reach database server"**: the Postgres service
isn't actually running — open Windows **Services** (Win+R → `services.msc`), find
`postgresql-x64-<version>`, and confirm its status is "Running" (right-click → Start if
not).

---

## 5. Seed it with real data

```bash
npm run seed
```
Idempotent — safe to re-run any time (e.g. to reset back to a clean demo state). Populates:
- the 4-domain / 28-sub-skill competency ontology
- 8 target roles with required-competency vectors
- ~146 mock iGOT courses + 26 NSSTA/TPAC training programmes
- 3 demo users, one per role, all with password `password123`:
  - `learner@kartavya.gov.in`
  - `trainer@kartavya.gov.in`
  - `admin@kartavya.gov.in`
- the baseline diagnostic assessment
- 40 synthetic learners with deliberately-gapped competency scores and attempt
  history (so the dashboards/heatmap have real data instead of an empty grid)

---

## 6. Verify the data is actually there

```bash
npm run prisma:studio
```
Opens a browser GUI (usually `http://localhost:5555`) where you can click through every
table and see real rows. Fastest way to confirm migrate+seed genuinely worked before
moving on. (pgAdmin 4, installed alongside Postgres in step 1, works too if you prefer it.)

---

## 7. Start the backend for real

```bash
npm run dev
```
Then, from another terminal:
```bash
curl http://localhost:4000/health
```
should return `{"status":"ok"}` — this always worked, even without a database, so it
doesn't prove much on its own. The real test is a call that actually touches Postgres:
```bash
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"learner@kartavya.gov.in\",\"password\":\"password123\"}"
```
If this returns a JWT (`{"token":"...", "user": {...}}`) instead of
`{"error":"Internal server error"}`, the database is genuinely wired up end to end.

---

## 8. Walk the real end-to-end flow

With **both** servers running (`npm run dev` in `backend/`, and `npm run dev` in
`frontend/` on port 5173):

1. Go to **http://localhost:5173/live-demo**
2. Sign in as the trainer, create a test (toggle "Proctored" on or off)
3. It generates a real QR code — click the join link it shows (or scan the QR with a
   phone on the same network)
4. Sign in as the learner on the join page
5. Answer the questions; if proctored, the camera harness runs live
6. Submit — see the real score the backend computed

Also import `backend/postman/Kartavya.postman_collection.json` into Postman or Thunder
Client and run through every folder to exercise each endpoint at least once.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `password authentication failed for user "postgres"` | `.env`'s `DATABASE_URL` password doesn't match the one you set during install. Re-check step 1 vs step 2. |
| `Can't reach database server at localhost:5432` | The Postgres Windows service isn't running — `services.msc`, find `postgresql-x64-<version>`, start it. |
| Port `5432` already in use | Something else is already listening on it (another Postgres install, a leftover WSL/Docker instance from earlier attempts). Check what's bound to the port (`netstat -ano \| findstr 5432` in PowerShell) and stop it, or change Postgres's port in its config and update `DATABASE_URL` to match. |
| `prisma migrate dev` complains about drift or existing tables | The `kartavya` database already has tables in it from an earlier attempt. Easiest fix: drop and recreate it — back in `psql`, run `DROP DATABASE kartavya;` then `CREATE DATABASE kartavya;`, then retry step 4. |
| Everything above works but `npm run seed` errors partway | Re-run it — it's idempotent, so it'll skip what already succeeded and can be safely retried after fixing whatever the error message points at. |

## Using a managed/cloud Postgres instead (Neon, Supabase, Railway, etc.)

Skip step 1 entirely — just paste the connection string they give you into `DATABASE_URL`
in `.env` (usually needs `?sslmode=require` appended). Steps 3 onward are identical.
