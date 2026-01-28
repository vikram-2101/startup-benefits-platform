import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import dealService from "../services/dealService.js";

/**
 * Deal Controller
 * Handles HTTP request/response for deals
 * Business logic is delegated to dealService
 */
class DealController {
  /**
   * Get All Deals
   * GET /deals
   */
  getDeals = asyncHandler(async (req: Request, res: Response) => {
    const { category, isLocked, search, page, limit } = req.query;

    const result = await dealService.getDeals({
      category: category as any,
      isLocked: isLocked as any,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    // 👇 transform DB deals to frontend Deal shape
    const transformedDeals = result.deals.map((deal: any) => ({
      _id: deal._id,
      title: deal.title,
      description: deal.description,
      category: deal.category,
      value: deal.dealValue, // DB → frontend
      discount: "N/A", // you can compute later if needed
      partner: {
        name: deal.partnerName,
        logo: deal.partnerLogo,
        website: undefined, // not in DB yet
      },
      requirements: deal.eligibilityText ? deal.eligibilityText.split(",") : [],
      isLocked: deal.isLocked,
      expiresAt: deal.expiresAt,
      createdAt: deal.createdAt,
    }));

    ApiResponse.success(
      res,
      {
        ...result,
        deals: transformedDeals,
      },
      "Deals retrieved successfully",
    );
  });

  /**
   * Get Single Deal by ID
   * GET /deals/:id
   */
  getDealById = asyncHandler(async (req: Request, res: Response) => {
    const deal = await dealService.getDealById(req.params.id);

    if (!deal) {
      return ApiResponse.error(res, "Deal not found", 404);
    }

    const transformedDeal = {
      _id: deal._id,
      title: deal.title,
      description: deal.description,
      category: deal.category,
      value: deal.dealValue,
      discount: "N/A",
      partner: {
        name: deal.partnerName,
        logo: deal.partnerLogo,
        website: undefined,
      },
      requirements: deal.eligibilityText ? deal.eligibilityText.split(",") : [],
      isLocked: deal.isLocked,
      expiresAt: deal.expiresAt,
      createdAt: deal.createdAt,
    };
    console.log("transformedDeal : ", transformedDeal);
    ApiResponse.success(res, transformedDeal, "Deal retrieved successfully");
  });

  /**
   * Create New Deal (Admin only)
   * POST /deals
   */
  createDeal = asyncHandler(async (req: Request, res: Response) => {
    const deal = await dealService.createDeal(req.body);

    ApiResponse.success(res, { deal }, "Deal created successfully", 201);
  });

  /**
   * Update Deal (Admin only)
   * PUT /deals/:id
   */
  updateDeal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deal = await dealService.updateDeal(id, req.body);

    ApiResponse.success(res, { deal }, "Deal updated successfully");
  });

  /**
   * Delete Deal (Admin only)
   * DELETE /deals/:id
   */
  deleteDeal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    await dealService.deleteDeal(id);

    ApiResponse.success(res, null, "Deal deleted successfully");
  });
}

export default new DealController();
