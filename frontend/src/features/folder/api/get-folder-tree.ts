import axios from "axios";
import apiClient from "@/shared/api/client";
import { FolderTreeResponse } from "@file-uploader/shared";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Fetches the folder tree structure for the authenticated user.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to folder tree response data
 * @throws {Error} If the request fails
 */
export async function getFolderTree(
  token?: string
): Promise<FolderTreeResponse> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.get<FolderTreeResponse>(
        `${config.apiUrl}/folders/tree`,
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
    const response = await apiClient.get<FolderTreeResponse>("/folders/tree");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to fetch folder tree";

    throw new Error(errorMessage);
  }
}
