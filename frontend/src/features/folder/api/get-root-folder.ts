import { GetFolderResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

/**
 * Fetches root folder contents (root folders and root files).
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to root folder data with subfolders and files
 * @throws {Error} If the request fails
 */
export async function getRootFolder(
  token?: string,
): Promise<GetFolderResponse> {
  return apiRequest<GetFolderResponse>({
    method: "GET",
    path: "/folders/root",
    token,
    defaultErrorMessage: "Failed to fetch root folder",
  });
}
