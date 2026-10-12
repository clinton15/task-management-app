import { Router } from "express";
import { createTask, deleteTask, getProjectTasks, reorderTasks, updateTask } from "../controllers/taskController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { authorizeProjectAccess } from "../middleware/authorizeProjectAccess.js";

const router = Router();

router.use(authenticate);

router.post("/projects/:projectId/tasks", authorizeProjectAccess, createTask);
router.get("/projects/:projectId/tasks", authorizeProjectAccess, getProjectTasks);
router.put("/tasks/:taskId", authorizeProjectAccess, updateTask);
router.delete(
  "/tasks/:taskId",
  authorizeProjectAccess,
  authorize("ADMIN"),
  deleteTask
);
router.patch(
  "/projects/:projectId/tasks/reorder",
  authorizeProjectAccess,
  reorderTasks
);

export default router;
