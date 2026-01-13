import { Request, Response } from "express";
import * as authService from "@/services/authService";
import { RegisterInput, LoginInput } from "@file-uploader/shared";
import { AuthRequest } from "@/middleware/authenticate";

/**
 * Handles user registration requests.
 *
 * Validates the request body, calls the registration service,
 * and returns appropriate HTTP responses with status codes.
 *
 * @param req - Express request object containing registration credentials in body
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const data: RegisterInput = req.body;
    const result = await authService.register(data);

    res.status(201).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = message.includes("already exists")
      ? 409
      : message.includes("required") || message.includes("at least")
      ? 400
      : 500;

    res.status(statusCode).json({ error: message });
  }
}

/**
 * Handles user login requests.
 *
 * Validates the request body, authenticates the user,
 * and returns a JWT token for subsequent authenticated requests.
 *
 * @param req - Express request object containing login credentials in body
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data: LoginInput = req.body;
    const result = await authService.login(data);

    res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = message.includes("Invalid credentials")
      ? 401
      : message.includes("required")
      ? 400
      : 500;

    res.status(statusCode).json({ error: message });
  }
}

/**
 * Handles requests to get the current authenticated user's information.
 *
 * Verifies the token (via authenticate middleware) and returns
 * the user's information from the database.
 *
 * @param req - Express request object with authenticated user info (from middleware)
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await authService.getUser(req.userId);
    res.status(200).json(user);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const statusCode = message.includes("not found") ? 404 : 500;

    res.status(statusCode).json({ error: message });
  }
}
