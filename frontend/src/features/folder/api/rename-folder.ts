import { RenameFolderInput, Folder } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

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
  return apiRequest<Folder>({
    method: "PUT",
    path: `/folders/${id}`,
    data,
    token,
    defaultErrorMessage: "Failed to rename folder",
    extractData: (response) => (response.data as { folder: Folder }).folder,
  });
}
