import type { CookieOptions, Request, Response } from "express";
import { env, isProduction } from "../config/env.js";

export const getAuthCookieOptions = (): CookieOptions => {
  const production = isProduction();

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path: "/",
    maxAge: env.jwtExpiresDays * 24 * 60 * 60 * 1000, // 7 days
  };
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(env.authCookieName, token, getAuthCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  const { maxAge: _maxAge, ...options } = getAuthCookieOptions();
  res.clearCookie(env.authCookieName, options);
};

export const getAuthTokenFromRequest = (req: Request): string | undefined => {
  const cookieToken = req.cookies?.[env.authCookieName];

  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  const header = req.headers.authorization;

  if (header?.startsWith("Bearer ")) {
    const bearerToken = header.slice("Bearer ".length).trim();

    if (bearerToken.length > 0) {
      return bearerToken;
    }
  }

  return undefined;
};
