"use server";

import { cookies } from "next/headers";
import { FolderTreeResponse } from "@file-uploader/shared";
import { getFolderTree as getFolderTreeApi } from "@/features/folder/api";

/**
 * Fetches the folder tree structure from the server.
 *
 * Gets the token from cookies and makes a request to /folders/tree.
 * Returns null if the request fails.
 *
 * @returns Promise resolving to folder tree data or null if request fails
 */
export async function getFolderTree(): Promise<FolderTreeResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    return await getFolderTreeApi(token);
  } catch {
    return null;
  }
}
