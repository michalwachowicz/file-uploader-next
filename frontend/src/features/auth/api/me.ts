import { UserResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

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
  return apiRequest<UserResponse>({
    method: "GET",
    path: "/auth/me",
    token,
    defaultErrorMessage: "Failed to fetch user",
  });
}
