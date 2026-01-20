import axios from "axios";
import apiClient from "@/shared/api/client";
import { RenameFolderInput, Folder } from "@file-uploader/shared";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Renames a folder.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param id - The folder ID to rename
 * @param data - Folder rename data (name)
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to the renamed folder
 * @throws {Error} If the request fails
 */
export async function renameFolder(
  id: string,
  data: RenameFolderInput,
  token?: string,
): Promise<Folder> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.put<{ folder: Folder }>(
        `${config.apiUrl}/folders/${id}`,
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
    const response = await apiClient.put<{ folder: Folder }>(
      `/folders/${id}`,
      data,
    );
    return response.data.folder;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to rename folder";

    throw new Error(errorMessage);
  }
}
