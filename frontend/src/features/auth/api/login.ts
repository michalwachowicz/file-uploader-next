import apiClient, { setToken } from "@/shared/api/client";
import { LoginInput, LoginResponse } from "@file-uploader/shared";
import { AxiosError } from "axios";

/**
 * Authenticates an existing user and retrieves a JWT token.
 *
 * @param data - User login credentials (username and password)
 * @returns Promise resolving to authentication response with user data and JWT token
 * @throws {Error} If login fails (invalid credentials, validation errors, etc.)
 */
export async function login(data: LoginInput): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    const { token } = response.data;

    // Store token in cookies for subsequent requests
    setToken(token);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error || axiosError.message || "Login failed";

    throw new Error(errorMessage);
  }
}
