"use server";

import { cookies } from "next/headers";
import {
  FolderTreeResponse,
  GetFolderResponse,
  GetFolderBreadcrumbsResponse,
} from "@file-uploader/shared";
import {
  getFolderTree as getFolderTreeApi,
  getFolder as getFolderApi,
  getRootFolder as getRootFolderApi,
  getFolderBreadcrumbs as getFolderBreadcrumbsApi,
} from "@/features/folder/api";

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

/**
 * Fetches root folder contents (root folders and root files) from the server.
 *
 * Gets the token from cookies and makes a request to /folders/root.
 * Returns null if the request fails.
 *
 * @returns Promise resolving to root folder data or null if request fails
 */
export async function getRootFolder(): Promise<GetFolderResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    return await getRootFolderApi(token);
  } catch {
    return null;
  }
}

/**
 * Fetches a folder by ID with its subfolders and files from the server.
 *
 * Gets the token from cookies and makes a request to /folders/:id.
 * Returns null if the request fails.
 *
 * @param id - The folder ID
 * @returns Promise resolving to folder data or null if request fails
 */
export async function getFolder(id: string): Promise<GetFolderResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    return await getFolderApi(id, token);
  } catch {
    return null;
  }
}

/**
 * Fetches breadcrumbs for a folder from the server.
 *
 * Gets the token from cookies and makes a request to /folders/:id/breadcrumbs.
 * Returns null if the request fails.
 *
 * @param id - The folder ID
 * @returns Promise resolving to folder breadcrumbs or null if request fails
 */
export async function getFolderBreadcrumbs(
  id: string,
): Promise<GetFolderBreadcrumbsResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    return await getFolderBreadcrumbsApi(id, token);
  } catch {
    return null;
  }
}
