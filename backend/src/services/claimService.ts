import Claim, { ClaimStatus, IClaim } from "../models/claim.js";
import Deal from "../models/Deal.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import dealService from "./dealService.js";

interface GetClaimsFilters {
  status?: ClaimStatus;
  page?: number;
  limit?: number;
}

/**
 * Claim Service
 * Handles claim-related business logic and eligibility checks
 */
class ClaimService {
  /**
   * Check Deal Eligibility for User
   * - Deal must exist and not be expired
   * - If deal is locked, user must be verified
   * - User must not have already claimed the deal
   */
  async checkEligibility(userId: string, dealId: string): Promise<boolean> {
    // Check if deal exists and is not expired
    const deal = await Deal.findById(dealId);

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    if (deal.isExpired()) {
      throw new AppError(
        "This deal has expired and can no longer be claimed",
        410,
      );
    }

    // Check if deal is locked and user is verified
    if (deal.isLocked) {
      const user = await User.findById(userId);

      if (!user?.isVerified) {
        throw new AppError(
          "This deal is restricted to verified users. Please verify your account to claim this deal.",
          403,
        );
      }
    }

    // Check if user has already claimed this deal
    const existingClaim = await Claim.findOne({ userId, dealId });

    if (existingClaim) {
      throw new AppError("You have already claimed this deal", 409);
    }

    return true;
  }

  /**
   * Create New Claim
   * Complete claim flow with eligibility verification
   */
  async createClaim(userId: string, dealId: string): Promise<any> {
    // Verify eligibility
    await this.checkEligibility(userId, dealId);

    // Create claim
    const claim = await Claim.create({
      userId,
      dealId,
      status: "pending",
    });

    // Increment deal claim count
    await dealService.incrementClaimCount(dealId);

    // Populate claim with deal and user details
    const populatedClaim = await Claim.findById(claim._id)
      .populate("dealId", "title partnerName category dealValue")
      .populate("userId", "email isVerified")
      .lean();

    return populatedClaim;
  }

  /**
   * Get All Claims for a User
   */
  async getUserClaims(userId: string, filters: GetClaimsFilters = {}) {
    const { status, page = 1, limit = 20 } = filters;

    // Build query
    const query: any = { user: userId };

    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [claims, totalCount] = await Promise.all([
      Claim.find(query)
        .populate("dealId", "title partnerName category dealValue isLocked")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      claims,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  /**
   * Get Single Claim by ID
   */
  async getClaimById(claimId: string, userId: string): Promise<any> {
    const claim = await Claim.findById(claimId)
      .populate("dealId")
      .populate("userId", "email isVerified")
      .lean();

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    // Verify claim belongs to user
    if (claim.userId._id.toString() !== userId.toString()) {
      throw new AppError("You do not have permission to view this claim", 403);
    }

    return claim;
  }

  /**
   * Update Claim Status (Admin only)
   */
  async updateClaimStatus(
    claimId: string,
    status: ClaimStatus,
    notes?: string,
  ): Promise<IClaim> {
    const claim = await Claim.findByIdAndUpdate(
      claimId,
      { status, notes },
      { new: true, runValidators: true },
    ).populate("dealId userId");

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    return claim;
  }

  /**
   * Get All Claims (Admin only)
   */
  async getAllClaims(filters: GetClaimsFilters = {}) {
    const { status, page = 1, limit = 50 } = filters;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [claims, totalCount] = await Promise.all([
      Claim.find(query)
        .populate("dealId", "title partnerName")
        .populate("userId", "email isVerified")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      claims,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    };
  }
}

export default new ClaimService();
