import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Validation Middleware Factory
 * Validates request data against Zod schema
 */
const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next(); // ✅ add return
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return ApiResponse.validationError(res, errors); // already returning
      }

      return next(error); // ✅ add return
    }
  };
};

export default validate;
