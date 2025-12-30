import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware factory that validates request body against a Zod schema.
 *
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (
        error instanceof ZodError ||
        (error &&
          typeof error === "object" &&
          "errors" in error &&
          Array.isArray((error as ZodError).errors))
      ) {
        const zodError = error as ZodError;
        const errors = zodError.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
        return;
      }

      res.status(400).json({
        error: "Invalid request data",
      });
    }
  };
}
