import { Request, Response, NextFunction } from "express";

/**
 * Async Handler Wrapper
 * Catches async errors and passes them to global error handler
 */
const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
