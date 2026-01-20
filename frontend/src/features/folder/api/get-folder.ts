import { GetFolderResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

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
  return apiRequest<GetFolderResponse>({
    method: "GET",
    path: `/folders/${id}`,
    token,
    defaultErrorMessage: "Failed to fetch folder",
  });
}
