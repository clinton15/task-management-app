import { Router } from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
} from "../controllers/projectController.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);
router.get("/:projectId", getProjectById);

router.post("/", authorize("ADMIN"), createProject);
router.put("/:projectId", authorize("ADMIN"), updateProject);
router.delete("/:projectId", authorize("ADMIN"), deleteProject);

export default router;
