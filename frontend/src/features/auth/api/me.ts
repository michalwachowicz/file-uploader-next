import apiClient from "@/shared/api/client";
import { UserResponse } from "@file-uploader/shared";
import { AxiosError } from "axios";
import axios from "axios";
import { config } from "@/shared/lib/config";

/**
 * Fetches the current authenticated user's information.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to user response data
 * @throws {Error} If the request fails or user is not authenticated
 */
export async function me(token?: string): Promise<UserResponse> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.get<UserResponse>(
        `${config.apiUrl}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    }

    // Client-side: use apiClient (token from cookies via interceptor)
    const response = await apiClient.get<UserResponse>("/auth/me");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to fetch user";

    throw new Error(errorMessage);
  }
}
