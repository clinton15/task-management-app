import type { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { getAuthTokenFromRequest } from "../utils/authCookie.js";
import { verifyAuthToken } from "../utils/token.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getAuthTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
