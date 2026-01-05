import apiClient from "@/shared/api/client";
import { RegisterInput, AuthResponse } from "@file-uploader/shared";
import { AxiosError } from "axios";

/**
 * Registers a new user account.
 *
 * @param data - User registration credentials (username and password)
 * @returns Promise resolving to authentication response with user data and JWT token
 * @throws {Error} If registration fails (username already exists, validation errors, etc.)
 */
export async function register(data: RegisterInput): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Registration failed";

    throw new Error(errorMessage);
  }
}
