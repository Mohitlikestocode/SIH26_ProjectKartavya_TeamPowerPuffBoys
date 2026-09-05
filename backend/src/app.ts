import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { competencyRouter } from "./modules/competency/competency.routes";
import { recommendationsRouter } from "./modules/recommendations/recommendations.routes";
import { igotRouter } from "./modules/igot/igot.routes";
import { nsstaRouter } from "./modules/nssta/nssta.routes";
import { assessmentsRouter } from "./modules/assessments/assessments.routes";
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
app.use("/api/attempts", attemptsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/api/violations", violationsRouter);
app.use("/api/simulations", simulationsRouter);
app.use("/api/dashboards", dashboardsRouter);
app.use("/api/i18n", multilingualRouter);

app.use(notFoundHandler);
app.use(errorHandler);
