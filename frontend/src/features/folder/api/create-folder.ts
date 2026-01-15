import axios from "axios";
import apiClient from "@/shared/api/client";
import { CreateFolderInput, Folder } from "@file-uploader/shared";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Creates a new folder.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param data - Folder creation data (name and optional parentId)
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to created folder
 * @throws {Error} If the request fails
 */
export async function createFolder(
  data: CreateFolderInput,
  token?: string
): Promise<Folder> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      const response = await axios.post<{ folder: Folder }>(
        `${config.apiUrl}/folders`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.folder;
    }

    // Client-side: use apiClient (token from cookies via interceptor)
    const response = await apiClient.post<{ folder: Folder }>("/folders", data);
    return response.data.folder;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to create folder";

    throw new Error(errorMessage);
  }
}
