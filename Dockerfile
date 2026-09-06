# Single combined image for Hugging Face Spaces (Docker SDK): the Express backend serves both
# the REST API and the built React frontend from one origin, on the port HF Spaces requires
# (7860) — see backend/src/app.ts's static-serving block. No CORS, no separate frontend host, no
# baked-in cross-origin API URL to misconfigure.

# ---- Stage 1: build the frontend ----
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# Same-origin deployment — relative /api/... calls, nothing to bake in per-environment.
ENV VITE_API_BASE_URL=""
RUN npm run build

# ---- Stage 2: build the backend ----
FROM node:20-slim AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
# schema.prisma must exist before `npm install`, because installing @prisma/client runs its own
# `prisma generate` postinstall hook against it — without this, that hook runs with no schema
# present and the whole npm install step fails.
COPY backend/prisma ./prisma
RUN npm install
COPY backend/ ./
RUN npm run build

# ---- Stage 3: runtime ----
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=7860

COPY --from=backend-build /app/backend/package*.json ./
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 7860
# Applies any pending Prisma migrations (idempotent, non-interactive), then starts the server —
# same "start" script used everywhere else this backend runs.
CMD ["npm", "run", "start"]
