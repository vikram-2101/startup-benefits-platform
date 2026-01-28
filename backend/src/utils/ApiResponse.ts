import { Response } from "express";

/**
 * Standardized API Response Format
 */
class ApiResponse {
  static success(
    res: Response,
    data: any,
    message: string = "Success",
    statusCode: number = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors: any = null,
  ) {
    const response: any = {
      success: false,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: any) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
}

export default ApiResponse;
