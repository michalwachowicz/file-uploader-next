import { setToken } from "@/shared/api/client";
import { LoginInput, LoginResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

/**
 * Authenticates an existing user and retrieves a JWT token.
 *
 * @param data - User login credentials (username and password)
 * @returns Promise resolving to authentication response with user data and JWT token
 * @throws {Error} If login fails (invalid credentials, validation errors, etc.)
 */
export async function login(data: LoginInput): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>({
    method: "POST",
    path: "/auth/login",
    data,
    defaultErrorMessage: "Login failed",
  });

  setToken(response.token);

  return response;
}
