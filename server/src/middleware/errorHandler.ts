import type { NextFunction, Request, Response } from "express";
import type { Error as MongooseError } from "mongoose";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);

  if (typeof err === "object" && err !== null && "code" in err && err.code === 11000) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    err.name === "ValidationError"
  ) {
    const validationError = err as MongooseError.ValidationError;
    res.status(400).json({ message: validationError.message });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
};
