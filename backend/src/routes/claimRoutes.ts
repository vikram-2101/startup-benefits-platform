import express from "express";
import claimController from "../controllers/claimController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createClaimSchema } from "../validators/schemas.js";

const router = express.Router();

/**
 * Claim Routes
 * POST /claims - Create claim (authenticated)
 * GET /claims/me - Get user's claims (authenticated)
 * GET /claims/:id - Get single claim (authenticated)
 * GET /claims - Get all claims (admin only)
 * PATCH /claims/:id/status - Update claim status (admin only)
 */

router.post(
  "/",
  authenticate,
  validate(createClaimSchema),
  claimController.createClaim,
);
router.get("/me", authenticate, claimController.getUserClaims);
router.get("/:id", authenticate, claimController.getClaimById);

// Admin routes
router.get(
  "/",
  authenticate,
  requireRole("admin"),
  claimController.getAllClaims,
);
router.patch(
  "/:id/status",
  authenticate,
  requireRole("admin"),
  claimController.updateClaimStatus,
);

export default router;
