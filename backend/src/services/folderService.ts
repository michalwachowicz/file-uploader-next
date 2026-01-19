import { prisma } from "@/lib/prisma";
import {
  Folder,
  FolderNode,
  FolderWithSubfoldersAndFiles,
} from "@file-uploader/shared";

/**
 * Converts a Prisma Folder to a FolderNode.
 */
function folderToFolderNode(folder: Folder): FolderNode {
  return {
    id: folder.id,
    name: folder.name,
    ownerId: folder.ownerId,
    parentId: folder.parentId,
    shareExpiresAt: folder.shareExpiresAt,
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
    subfolders: [],
  };
}

/**
 * Gets the folder tree structure for a specific owner.
 *
 * @param ownerId - The ID of the folder owner
 * @returns Promise resolving to an array of root folders with nested subfolders
 */
export async function getFolderTreeForOwner(
  ownerId: string,
): Promise<FolderNode[]> {
  const folders = await prisma.folder.findMany({ where: { ownerId } });
  const idToNode = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const f of folders) {
    idToNode.set(f.id, folderToFolderNode(f));
  }
  for (const f of folders) {
    const node = idToNode.get(f.id);
    if (f.parentId) {
      const parent = idToNode.get(f.parentId);
      if (parent && node) parent.subfolders.push(node);
    } else {
      if (node) roots.push(node);
    }
  }

  const sortRec = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((n) => sortRec(n.subfolders));
  };

  sortRec(roots);
  return roots;
}

/**
 * Gets a folder by ID with its subfolders and files.
 *
 * @param id - The folder ID
 * @returns Promise resolving to the folder or null if not found
 */
export async function getFolderById(
  id: string,
): Promise<FolderWithSubfoldersAndFiles | null> {
  return await prisma.folder.findUnique({
    where: { id },
    include: {
      subfolders: { where: { parentId: id } },
      files: { where: { folderId: id } },
    },
  });
}

/**
 * Checks if a share expiration date is valid (not null and in the future).
 *
 * @param shareExpiresAt - The share expiration date
 * @returns true if the share is valid, false otherwise
 */
export function isValidShare(shareExpiresAt: Date | string | null): boolean {
  if (!shareExpiresAt) return false;
  const expiresAt =
    shareExpiresAt instanceof Date ? shareExpiresAt : new Date(shareExpiresAt);
  return expiresAt > new Date();
}

/**
 * Checks if a folder has a valid share link in any of its ancestor folders.
 *
 * @param folderId - The ID of the folder to check
 * @returns Promise resolving to true if a valid share exists in ancestors
 */
export async function hasValidShareInAncestors(
  folderId: string,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ found: boolean }>>`
    WITH RECURSIVE ancestors AS (
      SELECT "id", "parentId", "shareExpiresAt"
      FROM "Folder"
      WHERE "id" = ${folderId}::uuid
      UNION ALL
      SELECT f."id", f."parentId", f."shareExpiresAt"
      FROM "Folder" f
      JOIN ancestors a ON a."parentId" = f."id"::uuid
    )
    SELECT EXISTS (
      SELECT 1 FROM ancestors
      WHERE "shareExpiresAt" IS NOT NULL AND "shareExpiresAt" > NOW()
    ) AS found;
  `;
  return rows[0]?.found === true;
}

/**
 * Gets root folder contents (folders and files with parentId/folderId === null) for a user.
 *
 * @param ownerId - The ID of the folder owner
 * @returns Promise resolving to root folder structure with subfolders and files
 */
export async function getRootFolderContents(
  ownerId: string,
): Promise<FolderWithSubfoldersAndFiles> {
  const rootFolders = await prisma.folder.findMany({
    where: { ownerId, parentId: null },
    orderBy: { name: "asc" },
  });

  const rootFiles = await prisma.file.findMany({
    where: { folderId: null, ownerId },
    orderBy: { name: "asc" },
  });

  return {
    id: "",
    name: "My Drive",
    ownerId,
    parentId: null,
    shareExpiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subfolders: rootFolders,
    files: rootFiles,
  };
}

/**
 * Gets the full path of a folder from root to the specified folder.
 *
 * @param folderId - The folder ID
 * @returns Promise resolving to an array of folder IDs and names in path order
 */
export async function getFolderPathWithNames(
  folderId: string,
): Promise<Array<{ id: string; name: string }>> {
  const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
    WITH RECURSIVE ancestors AS (
      SELECT "id", "parentId", "name", 0 AS depth
      FROM "Folder"
      WHERE "id" = ${folderId}::uuid
      UNION ALL
      SELECT f."id", f."parentId", f."name", a.depth + 1 AS depth
      FROM "Folder" f
      JOIN ancestors a ON a."parentId" = f."id"::uuid
    )
    SELECT "id", "name", depth
    FROM ancestors
    ORDER BY depth DESC;
  `;
  return rows.map((row) => ({ id: row.id, name: row.name }));
}

/**
 * Gets breadcrumbs for a folder with access control.
 * - For owned folders: returns path from root to current folder
 * - For shared folders: returns path from first shared ancestor to current folder
 *
 * @param folderId - The folder ID
 * @param userId - The user ID requesting the breadcrumbs
 * @returns Promise resolving to an array of folder breadcrumbs with id, name, and shareExpiresAt
 */
export async function getFolderBreadcrumbs(
  folderId: string,
  userId: string,
): Promise<
  Array<{ id: string; name: string; shareExpiresAt: Date | string | null }>
> {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: { ownerId: true, shareExpiresAt: true, parentId: true },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  const isOwner = folder.ownerId === userId;
  const isRootLevel = folder.parentId === null;

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      parentId: string | null;
      shareExpiresAt: Date | string | null;
      depth: number;
    }>
  >`
    WITH RECURSIVE ancestors AS (
      SELECT "id", "parentId", "name", "shareExpiresAt", 0 AS depth
      FROM "Folder"
      WHERE "id" = ${folderId}::uuid
      UNION ALL
      SELECT f."id", f."parentId", f."name", f."shareExpiresAt", a.depth + 1 AS depth
      FROM "Folder" f
      JOIN ancestors a ON a."parentId" = f."id"::uuid
    )
    SELECT "id", "name", "parentId", "shareExpiresAt", depth
    FROM ancestors
    ORDER BY depth DESC;
  `;

  if (isOwner) {
    const folderBreadcrumbs = rows.map((row) => ({
      id: row.id,
      name: row.name,
      shareExpiresAt: row.shareExpiresAt,
    }));

    return [
      {
        id: "",
        name: "My Drive",
        shareExpiresAt: null,
      },
      ...folderBreadcrumbs,
    ];
  }

  let startIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    if (isValidShare(rows[i].shareExpiresAt)) {
      startIndex = i;
      break;
    }
  }

  const breadcrumbs = rows.slice(startIndex).map((row) => ({
    id: row.id,
    name: row.name,
    shareExpiresAt: row.shareExpiresAt,
  }));

  const firstSharedIsRoot =
    rows.length > startIndex && rows[startIndex].parentId === null;
  if (firstSharedIsRoot) {
    return [
      {
        id: "",
        name: "My Drive",
        shareExpiresAt: null,
      },
      ...breadcrumbs,
    ];
  }

  return breadcrumbs;
}

/**
 * Creates a new folder.
 *
 * @param ownerId - The ID of the folder owner
 * @param name - The folder name
 * @param parentId - Optional parent folder ID
 * @returns Promise resolving to the created folder
 */
export async function createFolder(
  ownerId: string,
  name: string,
  parentId?: string,
): Promise<Folder> {
  return await prisma.folder.create({
    data: { ownerId, name, parentId },
  });
}

/**
 * Gets a folder by name within a specific parent folder.
 *
 * @param name - The folder name
 * @param parentId - The parent folder ID (null for root)
 * @param ownerId - The owner ID
 * @returns Promise resolving to the folder or null if not found
 */
export async function getFolderByNameInParent(
  name: string,
  parentId: string | null,
  ownerId: string,
): Promise<Folder | null> {
  return await prisma.folder.findFirst({
    where: {
      name,
      parentId,
      ownerId,
    },
  });
}

/**
 * Deletes a folder and all its contents (cascade delete).
 *
 * @param id - The folder ID to delete
 * @returns Promise that resolves when the folder is deleted
 */
export async function deleteFolder(id: string): Promise<void> {
  await prisma.folder.delete({ where: { id } });
}

/**
 * Renames a folder.
 *
 * @param id - The folder ID
 * @param newName - The new folder name
 * @param ownerId - The owner ID (for authorization)
 * @returns Promise resolving to the updated folder
 * @throws {Error} If folder not found, unauthorized, or name already exists
 */
export async function renameFolder(
  id: string,
  newName: string,
  ownerId: string,
): Promise<Folder> {
  const folder = await prisma.folder.findUnique({
    where: { id },
  });

  if (!folder) {
    throw new Error("Folder not found");
  }

  if (folder.ownerId !== ownerId) {
    throw new Error("You are not allowed to rename this folder");
  }

  const existingFolder = await getFolderByNameInParent(
    newName,
    folder.parentId,
    ownerId,
  );

  if (existingFolder && existingFolder.id !== id) {
    throw new Error("A folder with this name already exists");
  }

  return await prisma.folder.update({
    where: { id },
    data: { name: newName },
  });
}
