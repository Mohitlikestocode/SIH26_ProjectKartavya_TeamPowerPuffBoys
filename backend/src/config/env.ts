import "dotenv/config";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  sessionJoinTokenSecret: required("SESSION_JOIN_TOKEN_SECRET"),
  sessionJoinTokenTtlMinutes: Number(process.env.SESSION_JOIN_TOKEN_TTL_MINUTES ?? 120),
  sarvamApiKey: process.env.SARVAM_API_KEY ?? "",
  sarvamEnabled: (process.env.SARVAM_ENABLED ?? "false") === "true",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
