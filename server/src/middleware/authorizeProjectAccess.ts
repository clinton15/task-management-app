import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const getParam = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
};

const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

const isProjectMember = (
  userId: string,
  members: { toString(): string }[]
): boolean => {
  return members.some((member) => member.toString() === userId);
};

const denyAccess = (res: Response): void => {
  res.status(403).json({
    message: "You do not have permission to perform this action",
  });
};

const authorizeAgainstProject = (
  req: Request,
  res: Response,
  members: { toString(): string }[]
): boolean => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return false;
  }

  if (req.user.role === "ADMIN") {
    return true;
  }

  if (!isProjectMember(req.user.id, members)) {
    denyAccess(res);
    return false;
  }

  return true;
};

export const authorizeProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const projectId = getParam(req.params.projectId);
    const taskId = getParam(req.params.taskId);

    if (projectId) {
      if (!isValidObjectId(projectId)) {
        res.status(400).json({ message: "Invalid project id" });
        return;
      }

      const project = await Project.findById(projectId);

      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }

      if (!authorizeAgainstProject(req, res, project.members)) {
        return;
      }

      next();
      return;
    }

    if (taskId) {
      if (!isValidObjectId(taskId)) {
        res.status(400).json({ message: "Invalid task id" });
        return;
      }

      const task = await Task.findById(taskId);

      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const project = await Project.findById(task.projectId);

      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }

      if (!authorizeAgainstProject(req, res, project.members)) {
        return;
      }

      next();
      return;
    }

    res.status(400).json({ message: "Project or task id is required" });
  } catch (error) {
    next(error);
  }
};
