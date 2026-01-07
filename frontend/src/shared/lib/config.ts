/**
 * Application configuration.
 *
 * Centralized configuration values from environment variables.
 * All environment variables should be accessed through this config object.
 */

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
} as const;
