import Deal, { DealCategory, IDeal } from "../models/Deal.js";
import AppError from "../utils/AppError.js";

interface GetDealsFilters {
  category?: DealCategory;
  isLocked?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Deal Service
 * Handles deal-related business logic
 */
class DealService {
  /**
   * Get All Deals with Filtering, Search, and Pagination
   */
  async getDeals(filters: GetDealsFilters = {}) {
    const { category, isLocked, search, page = 1, limit = 20 } = filters;

    // Build query
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (typeof isLocked === "boolean") {
      query.isLocked = isLocked;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { partnerName: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [deals, totalCount] = await Promise.all([
      Deal.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Deal.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      deals,
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
   * Get Single Deal by ID
   */
  async getDealById(dealId: string): Promise<IDeal> {
    const deal = await Deal.findById(dealId);

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    // Check if deal is expired
    if (deal.expiresAt && deal.expiresAt < new Date()) {
      throw new AppError("This deal has expired", 410);
    }

    return deal as IDeal;
  }

  /**
   * Create New Deal (Admin only)
   */
  async createDeal(dealData: Partial<IDeal>): Promise<IDeal> {
    const deal = await Deal.create(dealData);
    return deal;
  }

  /**
   * Update Deal (Admin only)
   */
  async updateDeal(dealId: string, updateData: Partial<IDeal>): Promise<IDeal> {
    const deal = await Deal.findByIdAndUpdate(dealId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    return deal;
  }

  /**
   * Delete Deal (Admin only)
   */
  async deleteDeal(dealId: string) {
    const deal = await Deal.findByIdAndDelete(dealId);

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    return { message: "Deal deleted successfully" };
  }

  /**
   * Increment Deal Claim Count
   */
  async incrementClaimCount(dealId: string): Promise<void> {
    await Deal.findByIdAndUpdate(dealId, {
      $inc: { claimCount: 1 },
    });
  }
}

export default new DealService();
