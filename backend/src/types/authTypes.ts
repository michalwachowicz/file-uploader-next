/**
 * JWT payload structure.
 * Used internally by the backend for token generation and verification.
 */
export interface JwtPayload {
  userId: string;
  username: string;
}
