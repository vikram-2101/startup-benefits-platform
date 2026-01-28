import express from "express";
import authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";

const router = express.Router();

/**
 * Auth Routes
 * POST /auth/register - Register new user
 * POST /auth/login - Login user
 * POST /auth/refresh - Refresh access token
 * POST /auth/logout - Logout user
 * GET /auth/me - Get current user
 */

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);

export default router;
