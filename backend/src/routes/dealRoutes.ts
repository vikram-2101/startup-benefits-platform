import express from "express";
import dealController from "../controllers/dealController.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { getDealsSchema, getDealByIdSchema } from "../validators/schemas.js";

const router = express.Router();

/**
 * Deal Routes
 * GET /deals - Get all deals (public)
 * GET /deals/:id - Get single deal (public)
 * POST /deals - Create deal (admin only)
 * PUT /deals/:id - Update deal (admin only)
 * DELETE /deals/:id - Delete deal (admin only)
 */

router.get("/", validate(getDealsSchema), dealController.getDeals);
router.get("/:id", validate(getDealByIdSchema), dealController.getDealById);

// Admin routes
router.post("/", authenticate, requireRole("admin"), dealController.createDeal);
router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  dealController.updateDeal,
);
router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  dealController.deleteDeal,
);

export default router;
