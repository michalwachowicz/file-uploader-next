import axios from "axios";
import apiClient from "@/shared/api/client";
import { GetFolderBreadcrumbsResponse } from "@file-uploader/shared";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Fetches breadcrumbs for a folder.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param id - The folder ID
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to folder breadcrumbs
 * @throws {Error} If the request fails
 */
export async function getFolderBreadcrumbs(
  id: string,
  token?: string,
): Promise<GetFolderBreadcrumbsResponse> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.get<GetFolderBreadcrumbsResponse>(
        `${config.apiUrl}/folders/${id}/breadcrumbs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    }

    // Client-side: use apiClient (token from cookies via interceptor)
    const response = await apiClient.get<GetFolderBreadcrumbsResponse>(
      `/folders/${id}/breadcrumbs`,
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to fetch folder breadcrumbs";

    throw new Error(errorMessage);
  }
}
