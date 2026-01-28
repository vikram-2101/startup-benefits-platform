import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User, { IUser } from "../models/User.js";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
}

/**
 * JWT Authentication Middleware
 * Verifies access token and attaches user to request
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required. Please provide a valid token.",
        401,
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(
        "Authentication required. Please provide a valid token.",
        401,
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload;

      // Check if user still exists
      const user = await User.findById(decoded.userId).select(
        "-password -refreshTokens",
      );

      if (!user) {
        throw new AppError("User no longer exists", 401);
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token. Please log in again.", 401);
      }
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token expired. Please refresh your token.", 401);
      }
      throw error;
    }
  },
);

/**
 * Authorization Middleware
 * Checks if user is verified (for locked deals)
 */
export const requireVerified = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user?.isVerified) {
      throw new AppError(
        "Account verification required to access this resource",
        403,
      );
    }
    next();
  },
);

/**
 * Role-based Authorization Middleware
 */
export const requireRole = (...roles: string[]) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new AppError(
          "You do not have permission to perform this action",
          403,
        );
      }
      next();
    },
  );
};
