import { Router } from "express";
import { getCurrentUser, login, logout } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/authValidators.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, getCurrentUser);

export default router;
