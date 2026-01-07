/**
 * User data returned in authentication responses.
 */
export interface UserResponse {
  id: string;
  username: string;
  createdAt: Date | string; // Date on backend, string (ISO) when serialized to JSON
}

/**
 * Login response from the API.
 *
 * Returned by login endpoint.
 */
export interface LoginResponse {
  user: UserResponse;
  token: string;
}

/**
 * Registration response from the API.
 *
 * Returned by register endpoint. Does not include a token since
 * users must log in after registration.
 */
export interface RegisterResponse {
  user: UserResponse;
}
