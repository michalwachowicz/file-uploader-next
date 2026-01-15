"use client";

import { usePathname } from "next/navigation";
import { FolderNode } from "@file-uploader/shared";
import { useUser } from "@/features/auth/lib";
import { findFolderByIdInFolderTree } from "@/features/folder/lib";
import { Routes } from "@/shared/lib/routes";

/**
 * Hook that determines folder access and sidebar visibility based on the current route.
 *
 * @param folders - Array of folder nodes representing the folder tree structure
 * @returns Object containing:
 *   - isOwner: Whether the user owns the current folder or is on root route
 *   - currentFolderId: The ID of the current folder from the URL, if any
 *   - folder: The folder node if found in the tree, undefined otherwise
 */
export function useFolderAccess(folders: FolderNode[]) {
  const user = useUser();
  const pathname = usePathname();

  const isRootRoute = pathname === Routes.HOME;
  const folderMatch = pathname?.match(/\/folders\/([^\/]+)/);
  const currentFolderId = folderMatch ? folderMatch[1] : undefined;

  const folder = currentFolderId
    ? findFolderByIdInFolderTree(folders, currentFolderId)
    : undefined;

  const isOwner = !!(
    isRootRoute ||
    (user && folder && user.id === folder.ownerId)
  );

  return {
    isOwner,
    currentFolderId,
    folder,
  };
}
