# Postgres setup — from zero to a working backend

Companion to [`prompt.md`](prompt.md). Follow this top to bottom on Windows. Two paths are
given for step 1 (Docker — recommended, or a native install); everything after that is
identical either way.

---

## 1. Install Postgres

### Option A — Docker (recommended)

1. Install **Docker Desktop for Windows**: https://www.docker.com/products/docker-desktop/
   - Run the installer, accept the WSL2 backend prompt if asked (Docker Desktop sets up
     WSL2 automatically on modern Windows 10/11 — you don't need to configure this
     yourself).
   - Restart if the installer asks you to.
2. Launch Docker Desktop and wait for the whale icon in the system tray to stop animating
   (that means the engine is up). Confirm from a terminal:
   ```bash
   docker --version
   docker ps
   ```
   `docker ps` should print an empty table (no error) — that means the daemon is reachable.
3. Start a Postgres container matching the connection string already checked into
   `backend/.env.example`:
   ```bash
   docker run --name kartavya-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kartavya -p 5432:5432 -d postgres:16
   ```
4. Confirm it's actually running (not restarting/crashed):
   ```bash
   docker ps
   ```
   You should see `kartavya-postgres` with a status like `Up 10 seconds`. If it's not there,
   check `docker logs kartavya-postgres` for why it exited.

To stop/start it later without losing data: `docker stop kartavya-postgres` /
`docker start kartavya-postgres`. To wipe it completely and start over:
`docker rm -f kartavya-postgres` then repeat step 3.

### Option B — Native Postgres install (skip if you did Option A)

1. Download the Windows installer from https://www.postgresql.org/download/windows/
   (EnterpriseDB's installer is the standard one).
2. Run it. When prompted:
   - Superuser password: set it to `postgres` (or pick your own — just remember it for
     step 2 below).
   - Port: leave at the default `5432`.
   - Uncheck Stack Builder at the end unless you want it.
3. After install, create the database the app expects. Open **SQL Shell (psql)** from the
   Start menu (accept the defaults for host/port/user, enter your password when prompted),
   then run:
   ```sql
   CREATE DATABASE kartavya;
   ```

---

## 2. Point the backend at your Postgres

1. Open a terminal in `backend/`.
2. If you haven't already:
   ```bash
   cp .env.example .env
   ```
   (PowerShell: `copy .env.example .env`)
3. Open `.env` and check `DATABASE_URL`. If you used Docker Option A exactly as written
   above, the default already matches and you can skip editing it:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kartavya?schema=public"
   ```
   If you used a different password (native install) or a different port, edit this line
   to match: `postgresql://<user>:<password>@localhost:<port>/kartavya?schema=public`.

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

If this hangs or errors with **"Can't reach database server"**: Postgres isn't actually
up — go back to step 1 and confirm `docker ps` shows it running (or the native service is
started via Windows Services).

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
moving on.

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
| `password authentication failed for user "postgres"` | `.env`'s `DATABASE_URL` password doesn't match what the container/install actually has. Re-check step 1 vs step 2. |
| `Can't reach database server at localhost:5432` | Postgres isn't running. `docker ps` (Docker) or check the "postgresql-x64-16" service in Windows Services (native install). |
| Port `5432` already in use when starting the container | Something else is already listening on it — `docker ps -a` to find old containers, or a native Postgres service running alongside Docker. Either stop the conflicting one or map the container to a different host port (`-p 5433:5432`) and update `DATABASE_URL`'s port to match. |
| `prisma migrate dev` complains about drift or existing tables | The database isn't actually empty — probably a stale container from an earlier attempt. `docker rm -f kartavya-postgres`, redo step 1's container creation, then retry step 4. |
| Everything above works but `npm run seed` errors partway | Re-run it — it's idempotent, so it'll skip what already succeeded and can be safely retried after fixing whatever the error message points at. |

## Using a managed/cloud Postgres instead (Neon, Supabase, Railway, etc.)

Skip step 1 entirely — just paste the connection string they give you into `DATABASE_URL`
in `.env` (usually needs `?sslmode=require` appended). Steps 3 onward are identical.
