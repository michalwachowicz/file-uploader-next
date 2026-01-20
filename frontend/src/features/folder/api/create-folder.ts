import { CreateFolderInput, Folder } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

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
  token?: string,
): Promise<Folder> {
  return apiRequest<Folder>({
    method: "POST",
    path: "/folders",
    data,
    token,
    defaultErrorMessage: "Failed to create folder",
    extractData: (response) => (response.data as { folder: Folder }).folder,
  });
}
