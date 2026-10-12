import { Request, Response } from "express";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { getIO } from "../socket.js";

export const createTask = async (req: Request, res: Response) => {
  // your implementation
  const projectId = req.params.projectId;

  const { title, description, assignedTo } = req.body;

  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  //find if user exists and is part of the project members if assignedTo is provided
  if (assignedTo) {
    const user = await User.findById(assignedTo);

    if (!user) {
      res.status(404).json({ message: "Assigned user not found" });
      return;
    }
    const isMember = project.members.some(
      (member) => member.toString() === assignedTo,
    );

    if (!isMember) {
      res
        .status(400)
        .json({ message: "Assigned user is not a member of the project" });
      return;
    }
  }

  const existingTasks = await Task.find({ projectId })
    .sort({ order: -1 })
    .limit(1);
  const order = existingTasks.length > 0 ? existingTasks[0].order + 1 : 0;

  const task = new Task({
    projectId,
    title,
    description,
    assignedTo,
    order,
  });

  await task.save();

  getIO()
    .to(`project:${projectId}`)
    .emit("task:created", task);

  res.status(201).json(task);
};

export const getProjectTasks = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  // Check whether the project exists
  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  // Find all tasks belonging to this project
  // Sort by order in ascending order (0, 1, 2...)
  const tasks = await Task.find({ projectId }).sort({ order: 1 });

  // Return the tasks
  res.status(200).json(tasks);
};

export const updateTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { title, description, status, assignedTo } = req.body;

  // Find the task
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  // Validate status if the client provided one
  const allowedStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"];

  if (status !== undefined && !allowedStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid task status" });
    return;
  }

  // If an assignee was provided, verify the user exists
  // and belongs to the task's project
  if (assignedTo !== undefined && assignedTo !== null) {
    const user = await User.findById(assignedTo);

    if (!user) {
      res.status(404).json({ message: "Assigned user not found" });
      return;
    }

    const project = await Project.findById(task.projectId);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const isMember = project.members.some(
      (member) => member.toString() === assignedTo
    );

    if (!isMember) {
      res.status(400).json({
        message: "Assigned user is not a member of the project",
      });
      return;
    }
  }

  // Update only the fields supplied by the client
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;

  // Save the updated document; Mongoose validates the schema
  await task.save();

  getIO()
    .to(`project:${task.projectId}`)
    .emit("task:updated", task);

  res.status(200).json(task);
};

export const deleteTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  // Find the task first
  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  // Delete the task from MongoDB
  await Task.findByIdAndDelete(taskId);

  const projectId = task.projectId.toString();

  await Task.findByIdAndDelete(taskId);

  getIO()
    .to(`project:${projectId}`)
    .emit("task:deleted", {
      taskId,
    });

  res.status(200).json({ message: "Task deleted successfully" });

};

export const reorderTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { taskIds } = req.body;

    // Validate that taskIds is an array
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ message: "taskIds must be an array" });
      return;
    }

    // Reject duplicate IDs
    if (new Set(taskIds).size !== taskIds.length) {
      res.status(400).json({ message: "Duplicate task IDs are not allowed" });
      return;
    }

    // Check that the project exists
    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    // Fetch all tasks currently belonging to this project
    const existingTasks = await Task.find({ projectId }).select("_id");

    const existingIds = existingTasks.map((task) => task._id.toString());

    // Ensure every project task appears exactly once in the requested order
    const allTasksMatch =
      existingIds.length === taskIds.length &&
      existingIds.every((id) => taskIds.includes(id));

    if (!allTasksMatch) {
      res.status(400).json({
        message: "taskIds must contain every task in this project exactly once",
      });
      return;
    }

    // Assign order values based on each task's position in the array
    const operations = taskIds.map((taskId: string, index: number) => ({
      updateOne: {
        filter: { _id: taskId, projectId },
        update: { $set: { order: index } },
      },
    }));

    // Persist all ordering changes in MongoDB
    if (operations.length > 0) {
      await Task.bulkWrite(operations);
    }

    // Return tasks in their newly saved order
    const reorderedTasks = await Task.find({ projectId }).sort({ order: 1 });

    getIO()
      .to(`project:${projectId}`)
      .emit("tasks:reordered", reorderedTasks);

    res.status(200).json(reorderedTasks);
  } catch (error) {
    console.error("Error reordering tasks:", error);
    res.status(500).json({ message: "Failed to reorder tasks" });
  }
};
