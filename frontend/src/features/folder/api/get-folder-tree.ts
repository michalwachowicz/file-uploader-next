import { FolderTreeResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

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
  token?: string,
): Promise<FolderTreeResponse> {
  return apiRequest<FolderTreeResponse>({
    method: "GET",
    path: "/folders/tree",
    token,
    defaultErrorMessage: "Failed to fetch folder tree",
  });
}
