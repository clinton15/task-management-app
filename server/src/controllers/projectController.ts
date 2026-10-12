import { Request, Response } from "express";
import Project from "../models/Project.js";
import mongoose from "mongoose";
import User from "../models/User.js";

export const createProject = async (req: Request, res: Response) => {
    const { name, members } = req.body;

    if (!name || typeof name !== "string") {
        return res.status(400).json({
            message: "Name is required and must be a string",
        });
    }

    if (members && !Array.isArray(members)) {
        return res.status(400).json({
            message: "Members must be an array",
        });
    }

    const project = await Project.create({
        name,
        members: members || [],
    });

    return res.status(201).json(project);
};

// GET /api/projects
export const getProjects = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const filter =
            user.role === "ADMIN" ? {} : { members: user.id };

        const projects = await Project.find(filter).sort({ createdAt: -1 });

        return res.status(200).json(projects);

    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch projects" });
    }
};

// GET /api/projects/:projectId
export const getProjectById = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const isMember = project.members.some(
            (member) => member.toString() === user.id,
        );

        if (user.role !== "ADMIN" && !isMember) {
            return res.status(403).json({ message: "You cannot access this project" });
        }

        return res.status(200).json(project);

    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch project" });
    }
};

// PUT /api/projects/:projectId
export const updateProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { name, members } = req.body;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({ message: "Name must be a non-empty string" });
        }

        if (members !== undefined && !Array.isArray(members)) {
            return res.status(400).json({ message: "Members must be an array of user IDs" });
        }

        if (members !== undefined) {
            const invalidMemberId = members.some(
                (id: unknown) => typeof id !== "string" || !mongoose.isValidObjectId(id),
            );

            if (invalidMemberId) {
                return res.status(400).json({ message: "One or more member IDs are invalid" });
            }

            const uniqueMemberIds = [...new Set(members as string[])];

            if (uniqueMemberIds.length !== members.length) {
                return res.status(400).json({ message: "Duplicate project members are not allowed" });
            }

            const users = await User.find({ _id: { $in: uniqueMemberIds } }).select("_id");

            if (users.length !== uniqueMemberIds.length) {
                return res.status(400).json({ message: "One or more users do not exist" });
            }
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (name !== undefined) project.name = name.trim();

        if (members !== undefined) {
            project.members = members.map(
                (id: string) => new mongoose.Types.ObjectId(id),
            );
        }

        await project.save();

        return res.status(200).json(project);

    } catch (error) {
        return res.status(500).json({ message: "Failed to update project" });
    }
};

// DELETE /api/projects/:projectId
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;


        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await Project.findByIdAndDelete(projectId);

        return res.status(200).json({ message: "Project deleted successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Failed to delete project" });
    }
};
