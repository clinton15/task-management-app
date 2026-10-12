import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import { toUserResponse } from "../utils/userResponse.js";
import type { CreateUserInput, UpdateUserInput } from "../validators/userValidators.js";

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

const countAdmins = async (): Promise<number> => {
  return User.countDocuments({ role: "ADMIN" });
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ users: users.map(toUserResponse) });
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json({ user: toUserResponse(user) });
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as CreateUserInput;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role ?? "USER",
  });

  res.status(201).json({
    message: "User created successfully",
    user: toUserResponse(user),
  });
};

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const updates = req.body as UpdateUserInput;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const user = await User.findById(id).select("+password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (updates.email && updates.email !== user.email) {
    const emailTaken = await User.findOne({ email: updates.email, _id: { $ne: user._id } });

    if (emailTaken) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }
  }

  if (updates.role && updates.role !== user.role && user.role === "ADMIN") {
    const adminCount = await countAdmins();

    if (adminCount <= 1) {
      res.status(400).json({ message: "Cannot change the role of the last admin" });
      return;
    }
  }

  if (updates.name !== undefined) {
    user.name = updates.name;
  }

  if (updates.email !== undefined) {
    user.email = updates.email;
  }

  if (updates.role !== undefined) {
    user.role = updates.role;
  }

  if (updates.password !== undefined) {
    user.password = updates.password;
  }

  await user.save();

  res.status(200).json({
    message: "User updated successfully",
    user: toUserResponse(user),
  });
};

export const deleteUser = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const user = await User.findById(id);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (req.user?.id === user.id) {
    res.status(400).json({ message: "You cannot delete your own account" });
    return;
  }

  if (user.role === "ADMIN") {
    const adminCount = await countAdmins();

    if (adminCount <= 1) {
      res.status(400).json({ message: "Cannot delete the last admin" });
      return;
    }
  }

  await user.deleteOne();

  res.status(200).json({ message: "User deleted successfully" });
};
