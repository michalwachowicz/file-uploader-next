import axios from "axios";
import apiClient from "@/shared/api/client";
import { GetFolderResponse } from "@file-uploader/shared";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Fetches a folder by ID with its subfolders and files.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param id - The folder ID
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to folder data with subfolders and files
 * @throws {Error} If the request fails
 */
export async function getFolder(
  id: string,
  token?: string,
): Promise<GetFolderResponse> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.get<GetFolderResponse>(
        `${config.apiUrl}/folders/${id}`,
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
    const response = await apiClient.get<GetFolderResponse>(`/folders/${id}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to fetch folder";

    throw new Error(errorMessage);
  }
}
