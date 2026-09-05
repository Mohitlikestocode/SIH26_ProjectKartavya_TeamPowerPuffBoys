import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { ApiError } from "../../middleware/errorHandler";

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: "learner" | "trainer" | "org_admin";
  designation?: string;
  department?: string;
  cadre?: string;
  state?: string;
  experienceYears?: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

function signToken(user: { id: string; role: string }) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  designation: string | null;
  department: string | null;
  cadre: string | null;
  state: string | null;
  targetRoleId: string | null;
}) {
  const { ...rest } = user;
  return rest;
}

// Mock OAuth-style SSO: no real government IdP integration, but the shape
// (credential exchange -> signed token -> role claim) mirrors how a real
// Parichay/SSO handoff would slot in later.
export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      role: input.role ?? "learner",
      designation: input.designation,
      department: input.department,
      cadre: input.cadre,
      state: input.state,
      experienceYears: input.experienceYears,
    },
  });

  return { token: signToken(user), user: toPublicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  return { token: signToken(user), user: toPublicUser(user) };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");
  return toPublicUser(user);
}
