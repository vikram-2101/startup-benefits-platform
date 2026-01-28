import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

/**
 * Auth Service
 * Handles authentication business logic
 */
class AuthService {
  /**
   * Generate JWT Access Token
   */
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });
  }

  /**
   * Generate JWT Refresh Token
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });
  }

  /**
   * Hash Refresh Token for Storage
   */
  async hashToken(token: string): Promise<string> {
    return await bcrypt.hash(token, 10);
  }

  /**
   * Register New User
   */
  async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Hash and store refresh token
    const hashedRefreshToken = await this.hashToken(refreshToken);
    await user.addRefreshToken(hashedRefreshToken);

    // Return user data and tokens
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login User
   */
  async login(email: string, password: string) {
    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = this.generateRefreshToken(user._id.toString());

    // Hash and store refresh token
    const hashedRefreshToken = await this.hashToken(refreshToken);
    await user.addRefreshToken(hashedRefreshToken);

    // Return user data and tokens
    return {
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh Access Token
   */
  async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError("Refresh token required", 401);
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
      };

      // Find user with refresh tokens
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new AppError("User not found", 404);
      }

      // Hash incoming refresh token and check if it exists in user's tokens
      const tokenExists = await this.verifyRefreshToken(
        refreshToken,
        user.refreshTokens,
      );

      if (!tokenExists) {
        throw new AppError("Invalid refresh token", 401);
      }

      // Generate new tokens (rotation)
      const newAccessToken = this.generateAccessToken(user._id.toString());
      const newRefreshToken = this.generateRefreshToken(user._id.toString());

      // Remove old refresh token and add new one
      const oldHashedToken = await this.hashToken(refreshToken);
      await user.removeRefreshToken(oldHashedToken);

      const newHashedToken = await this.hashToken(newRefreshToken);
      await user.addRefreshToken(newHashedToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid refresh token", 401);
      }
      if (error.name === "TokenExpiredError") {
        throw new AppError("Refresh token expired. Please log in again.", 401);
      }
      throw error;
    }
  }

  /**
   * Verify Refresh Token Exists in User's Token List
   */
  async verifyRefreshToken(
    token: string,
    storedTokens: Array<{ token: string }>,
  ): Promise<boolean> {
    for (const storedToken of storedTokens) {
      const isMatch = await bcrypt.compare(token, storedToken.token);
      if (isMatch) return true;
    }
    return false;
  }

  /**
   * Logout User
   */
  async logout(userId: string, refreshToken?: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (refreshToken) {
      const hashedToken = await this.hashToken(refreshToken);
      await user.removeRefreshToken(hashedToken);
    }

    return { message: "Logged out successfully" };
  }
}

export default new AuthService();
