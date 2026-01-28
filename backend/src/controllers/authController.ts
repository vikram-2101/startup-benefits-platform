import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import authService from "../services/authService.js";

/**
 * Auth Controller
 * Handles HTTP request/response for authentication
 * Business logic is delegated to authService
 */
class AuthController {
  /**
   * Register New User
   * POST /auth/register
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body; // 👈 include name

    const result = await authService.register(name, email, password);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ApiResponse.success(
      res,
      {
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name, // 👈 return name
          role: result.user?.role,
          isVerified: result.user?.isVerified,
        },
        accessToken: result.accessToken,
      },
      "Registration successful",
      201,
    );
  });

  /**
   * Login User
   * POST /auth/login
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    ApiResponse.success(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successful",
    );
  });

  /**
   * Refresh Access Token
   * POST /auth/refresh
   */
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    const result = await authService.refreshAccessToken(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    ApiResponse.success(
      res,
      {
        accessToken: result.accessToken,
      },
      "Token refreshed successfully",
    );
  });

  /**
   * Logout User
   * POST /auth/logout
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id.toString();
    const refreshToken = req.cookies.refreshToken;

    if (userId) {
      await authService.logout(userId, refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    ApiResponse.success(res, null, "Logout successful");
  });

  /**
   * Get Current User
   * GET /auth/me
   */
  getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        user: {
          id: req.user?._id,
          name: req.user?.name,
          email: req.user?.email,
          isVerified: req.user?.isVerified,
          role: req.user?.role,
        },
      },
      "User retrieved successfully",
    );
  });
}

export default new AuthController();
