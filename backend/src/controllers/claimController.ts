import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import claimService from "../services/claimService.js";

/**
 * Claim Controller
 * Handles HTTP request/response for claims
 * Business logic is delegated to claimService
 */
class ClaimController {
  /**
   * Create New Claim
   * POST /claims
   */
  createClaim = asyncHandler(async (req: Request, res: Response) => {
    const { dealId } = req.body;
    const userId = req.user?._id.toString();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const claim = await claimService.createClaim(userId, dealId);

    ApiResponse.success(res, { claim }, "Deal claimed successfully", 201);
  });

  /**
   * Get User's Claims
   * GET /claims/me
   */
  getUserClaims = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const { status, page, limit } = req.query;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const result = await claimService.getUserClaims(userId, {
      status: status as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    ApiResponse.success(res, result, "Claims retrieved successfully");
  });

  /**
   * Get Single Claim by ID
   * GET /claims/:id
   */
  getClaimById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?._id.toString();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const claim = await claimService.getClaimById(id, userId);

    ApiResponse.success(res, { claim }, "Claim retrieved successfully");
  });

  /**
   * Update Claim Status (Admin only)
   * PATCH /claims/:id/status
   */
  updateClaimStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const claim = await claimService.updateClaimStatus(id, status, notes);

    ApiResponse.success(res, { claim }, "Claim status updated successfully");
  });

  /**
   * Get All Claims (Admin only)
   * GET /claims
   */
  getAllClaims = asyncHandler(async (req: Request, res: Response) => {
    const { status, page, limit } = req.query;

    const result = await claimService.getAllClaims({
      status: status as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    ApiResponse.success(res, result, "All claims retrieved successfully");
  });
}

export default new ClaimController();
