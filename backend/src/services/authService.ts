import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import {
  RegisterInput,
  LoginInput,
  LoginResponse,
  RegisterResponse,
  UserResponse,
} from "@file-uploader/shared";
import { JwtPayload } from "@/types/authTypes";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = "7d";

/**
 * Generates a JWT token with the provided payload.
 *
 * @param payload - The JWT payload containing userId and username
 * @returns A signed JWT token string
 * @private
 */
function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRES_IN });
}

/**
 * Verifies and decodes a JWT token.
 *
 * Validates the token signature and expiration, then returns the decoded payload.
 *
 * @param token - The JWT token string to verify
 * @returns The decoded JWT payload containing userId and username
 * @throws {Error} If the token is invalid, expired, or malformed
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Registers a new user in the system.
 *
 * Validates the input, checks for existing users, hashes the password,
 * and creates the user record. Does not return a token since users must
 * log in after registration.
 *
 * Note: Input validation is handled by Zod schema in validateRequest middleware
 *
 * @param data - User registration credentials (username and password)
 * @returns Promise resolving to a registration response with user data (no token)
 * @throws {Error} If validation fails or username already exists
 */
export async function register(data: RegisterInput): Promise<RegisterResponse> {
  const { username, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });

  return {
    user,
  };
}

/**
 * Authenticates an existing user and returns a JWT token.
 *
 * Validates credentials, verifies the password against the stored hash,
 * and returns user data with a JWT token for subsequent requests.
 *
 * Note: Input validation is handled by Zod schema in validateRequest middleware
 *
 * @param data - User login credentials (username and password)
 * @returns Promise resolving to an authentication response with user data and JWT token
 * @throws {Error} If validation fails or user not found or password is invalid
 */
export async function login(data: LoginInput): Promise<LoginResponse> {
  const { username, password } = data;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    },
    token,
  };
}

/**
 * Retrieves user information by user ID.
 *
 * Fetches the user from the database and returns their information.
 * Used for authenticated endpoints that need to return current user data.
 *
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user response data
 * @throws {Error} If user is not found
 */
export async function getUser(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
  };
}
