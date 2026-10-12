import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createUserSchema, updateUserSchema } from "../validators/userValidators.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema), createUser);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;
