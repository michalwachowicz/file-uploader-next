/**
 * Application configuration.
 *
 * Centralized configuration values from environment variables.
 * All environment variables should be accessed through this config object.
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  apiUrl: getEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:3001/api"),
} as const;
