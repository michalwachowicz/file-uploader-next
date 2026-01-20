import { apiRequest } from "@/shared/api/wrapper";

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
  return apiRequest<void>({
    method: "DELETE",
    path: `/folders/${id}`,
    token,
    defaultErrorMessage: "Failed to delete folder",
  });
}
