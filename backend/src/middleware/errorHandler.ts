import { Request, Response, NextFunction } from "express";
import config from "../config/config.js";
import logger from "../utils/logger.js";

/**
 * Handle MongoDB Duplicate Key Error
 */
const handleDuplicateKeyError = (error: any) => {
  const field = Object.keys(error.keyValue)[0];
  const message = `${field} already exists. Please use a different ${field}.`;
  return { message, statusCode: 409 };
};

/**
 * Handle MongoDB Validation Error
 */
const handleValidationError = (error: any) => {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
  }));
  return { message: "Validation failed", statusCode: 400, errors };
};

/**
 * Handle MongoDB Cast Error
 */
const handleCastError = (error: any) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return { message, statusCode: 400 };
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Handle specific error types
  if (err.code === 11000) {
    const handled = handleDuplicateKeyError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
  }

  if (err.name === "ValidationError") {
    const handled = handleValidationError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
    error.errors = handled.errors;
  }

  if (err.name === "CastError") {
    const handled = handleCastError(err);
    error.message = handled.message;
    error.statusCode = handled.statusCode;
  }

  // Send error response
  const response: any = {
    success: false,
    message: error.message || "Internal server error",
  };

  // Include errors array if exists
  if (error.errors) {
    response.errors = error.errors;
  }

  // Include stack trace in development
  if (config.env === "development") {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

export default errorHandler;
