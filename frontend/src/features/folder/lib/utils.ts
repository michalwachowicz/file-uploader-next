import { FolderNode } from "@file-uploader/shared";

/**
 * Recursively searches for a folder by ID in the folder tree.
 *
 * @param folders - Array of folder nodes to search through
 * @param folderId - The ID of the folder to find
 * @returns The folder node if found, undefined otherwise
 */
export function findFolderByIdInFolderTree(
  folders: FolderNode[],
  folderId: string
): FolderNode | undefined {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder;
    }
    if (folder.subfolders.length > 0) {
      const found = findFolderByIdInFolderTree(folder.subfolders, folderId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Gets the path of folder IDs from root to the target folder.
 * Returns an array of folder IDs in order from root to target.
 *
 * @param folders - Array of folder nodes to search through
 * @param targetFolderId - The ID of the target folder
 * @returns Array of folder IDs from root to target, empty if not found
 */
export function getFolderPathIds(
  folders: FolderNode[],
  targetFolderId: string
): string[] {
  for (const folder of folders) {
    if (folder.id === targetFolderId) {
      return [folder.id];
    }
    if (folder.subfolders.length > 0) {
      const path = getFolderPathIds(folder.subfolders, targetFolderId);
      if (path.length > 0) {
        return [folder.id, ...path];
      }
    }
  }
  return [];
}
