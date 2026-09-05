import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { competencyRouter } from "./modules/competency/competency.routes";
import { recommendationsRouter } from "./modules/recommendations/recommendations.routes";
import { igotRouter } from "./modules/igot/igot.routes";
import { nsstaRouter } from "./modules/nssta/nssta.routes";
import { assessmentsRouter } from "./modules/assessments/assessments.routes";
import { documentsRouter } from "./modules/documents/documents.routes";
import { questionsRouter } from "./modules/questions/questions.routes";
import { attemptsRouter } from "./modules/attempts/attempts.routes";
import { sessionsRouter } from "./modules/sessions/sessions.routes";
import { violationsRouter } from "./modules/violations/violations.routes";
import { simulationsRouter } from "./modules/simulations/simulations.routes";
import { dashboardsRouter } from "./modules/dashboards/dashboards.routes";
import { multilingualRouter } from "./modules/multilingual/multilingual.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/competency", competencyRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/courses/igot", igotRouter);
app.use("/api/courses/nssta", nsstaRouter);
app.use("/api/assessments", assessmentsRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/questions", questionsRouter);
app.use("/api/attempts", attemptsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/violations", violationsRouter);
app.use("/api/simulations", simulationsRouter);
app.use("/api/dashboards", dashboardsRouter);
app.use("/api/i18n", multilingualRouter);

// Serves the built frontend from the same container/origin as the API (used by the combined
// Hugging Face Docker Space image — see /Dockerfile) so there's no separate frontend host, no
// cross-origin calls, and no baked-in API URL to get wrong at build time. `backend/public` only
// exists once the frontend has actually been built into it; in local dev (`npm run dev`, no
// public/ present) this whole block is skipped and behavior is unchanged from before.
const publicDir = path.join(__dirname, "../public");
const indexHtmlPath = path.join(publicDir, "index.html");
if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(publicDir));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") return next();
    res.sendFile(indexHtmlPath);
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
