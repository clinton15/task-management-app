import type { Request, Response } from "express";
import User from "../models/User.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import { signAuthToken } from "../utils/token.js";
import { toUserResponse } from "../utils/userResponse.js";
import type { LoginInput } from "../validators/authValidators.js";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = signAuthToken(user.id, user.role);
  setAuthCookie(res, token);

  res.status(200).json({
    message: "Logged in successfully",
    user: toUserResponse(user),
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  res.status(200).json({ user: toUserResponse(user) });
};
