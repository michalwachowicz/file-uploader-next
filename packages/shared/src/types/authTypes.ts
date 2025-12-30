/**
 * Authentication response from the API.
 *
 * Returned by both register and login endpoints.
 */
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    createdAt: Date | string; // Date on backend, string (ISO) when serialized to JSON
  };
  token: string;
}
