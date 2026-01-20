import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError } from "axios";
import { config } from "@/shared/lib/config";

/**
 * Deletes a folder and all its contents.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param id - The folder ID to delete
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise that resolves when the folder is deleted
 * @throws {Error} If the request fails
 */
export async function deleteFolder(id: string, token?: string): Promise<void> {
  try {
    // Server-side: use axios with explicit token
    if (token) {
      await axios.delete(`${config.apiUrl}/folders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return;
    }

    // Client-side: use apiClient (token from cookies via interceptor)
    await apiClient.delete(`/folders/${id}`);
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Failed to delete folder";

    throw new Error(errorMessage);
  }
}
