import { GetFolderBreadcrumbsResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

/**
 * Fetches breadcrumbs for a folder.
 *
 * Can be used both client-side (uses apiClient with token from cookies)
 * and server-side (passes token explicitly via axios).
 *
 * @param id - The folder ID
 * @param token - Optional token to use for server-side requests. If not provided, uses apiClient (client-side)
 * @returns Promise resolving to folder breadcrumbs
 * @throws {Error} If the request fails
 */
export async function getFolderBreadcrumbs(
  id: string,
  token?: string,
): Promise<GetFolderBreadcrumbsResponse> {
  return apiRequest<GetFolderBreadcrumbsResponse>({
    method: "GET",
    path: `/folders/${id}/breadcrumbs`,
    token,
    defaultErrorMessage: "Failed to fetch folder breadcrumbs",
  });
}
