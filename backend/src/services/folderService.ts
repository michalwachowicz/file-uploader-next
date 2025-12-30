import { prisma } from "@/lib/prisma";
import { Folder, File } from "../../generated/prisma/client";

export type FolderNode = Folder & { subfolders: FolderNode[] };
export type FolderWithSubfoldersAndFiles = Folder & {
  subfolders?: Folder[];
  files?: File[];
};

/**
 * Gets the folder tree structure for a specific owner.
 *
 * @param ownerId - The ID of the folder owner
 * @returns Promise resolving to an array of root folders with nested subfolders
 */
export async function getFolderTreeForOwner(
  ownerId: string
): Promise<FolderNode[]> {
  const folders = await prisma.folder.findMany({ where: { ownerId } });
  const idToNode = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const f of folders) idToNode.set(f.id, { ...f, subfolders: [] });
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
  id: string
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
 * Checks if a folder has a valid share link in any of its ancestor folders.
 *
 * @param folder - The folder to check
 * @returns Promise resolving to true if a valid share exists in ancestors
 */
export async function hasValidShareInAncestors(
  folder: Folder
): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ found: boolean }>>`
    WITH RECURSIVE ancestors AS (
      SELECT "id", "parentId", "shareExpiresAt"
      FROM "Folder"
      WHERE "id" = ${folder.id}::uuid
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
 * Gets the full path of a folder from root to the specified folder.
 *
 * @param folderId - The folder ID
 * @returns Promise resolving to an array of folder IDs and names in path order
 */
export async function getFolderPathWithNames(
  folderId: string
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
  parentId?: string
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
  ownerId: string
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
  ownerId: string
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
    ownerId
  );

  if (existingFolder && existingFolder.id !== id) {
    throw new Error("A folder with this name already exists");
  }

  return await prisma.folder.update({
    where: { id },
    data: { name: newName },
  });
}
