import { Request, Response, NextFunction } from "express";
import * as authService from "@/services/authService";
import { JwtPayload } from "@/types/authTypes";

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

/**
 * Middleware to authenticate requests using JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded: JwtPayload = authService.verifyToken(token);

    // Attach user info to request
    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid or expired token";
    res.status(401).json({ error: message });
  }
};
