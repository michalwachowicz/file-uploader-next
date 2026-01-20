import { ShareFolderInput, Folder } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

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
  return apiRequest<Folder>({
    method: "POST",
    path: `/folders/${id}/share`,
    data,
    token,
    defaultErrorMessage: "Failed to share folder",
    extractData: (response) => (response.data as { folder: Folder }).folder,
  });
}
