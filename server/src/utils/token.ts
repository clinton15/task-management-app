import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";
import { env } from "../config/env.js";

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export const signAuthToken = (userId: string, role: UserRole): string => {
  return jwt.sign({ sub: userId, role } satisfies AuthTokenPayload, env.jwtSecret(), {
    expiresIn: env.jwtExpiresDays * 24 * 60 * 60,
  });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret());

  if (typeof decoded !== "object" || decoded === null || typeof decoded.sub !== "string") {
    throw new Error("Invalid token payload");
  }

  const role = decoded.role;

  if (role !== "ADMIN" && role !== "USER") {
    throw new Error("Invalid token payload");
  }

  return { sub: decoded.sub, role };
};
