import axios from "axios";
import apiClient from "@/shared/api/client";
import { ShareFolderInput, Folder } from "@file-uploader/shared";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Shares or unshares a folder.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param id - The folder ID to share/unshare
 * @param data - Share data (durationHours or indefinite, or durationHours: null to unshare)
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to the updated folder
 * @throws {Error} If the request fails
 */
export async function shareFolder(
  id: string,
  data: ShareFolderInput,
  token?: string,
): Promise<Folder> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.post<{ folder: Folder }>(
        `${config.apiUrl}/folders/${id}/share`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      return response.data.folder;
    }

    // Client-side: use apiClient (token from cookies via interceptor)
    const response = await apiClient.post<{ folder: Folder }>(
      `/folders/${id}/share`,
      data,
    );
    return response.data.folder;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to share folder";

    throw new Error(errorMessage);
  }
}
