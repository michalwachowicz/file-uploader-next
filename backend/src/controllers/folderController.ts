import { Response } from "express";
import * as folderService from "@/services/folderService";
import {
  CreateFolderInput,
  RenameFolderInput,
  ShareFolderInput,
} from "@file-uploader/shared";
import { AuthRequest } from "@/middleware/authenticate";

/**
 * Gets a folder by ID with its subfolders and files.
 *
 * Access is granted if:
 * - User is the owner of the folder
 * - Folder itself has a valid share (shareExpiresAt is valid)
 * - Any ancestor folder has a valid share
 *
 * @param req - Express request with folder ID in params and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function getFolder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const folder = await folderService.getFolderById(id);

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    const isOwner = folder.ownerId === req.userId;

    if (!isOwner) {
      const isFolderShared = folderService.isValidShare(folder.shareExpiresAt);

      if (isFolderShared) {
        res.json({
          folder,
          isOwner: false,
        });
        return;
      }

      const isAncestorShared = await folderService.hasValidShareInAncestors(
        folder.id,
      );

      if (!isAncestorShared) {
        res.status(403).json({
          error: "You are not allowed to access this folder",
        });
        return;
      }
    }

    res.json({
      folder,
      isOwner,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Creates a new folder.
 *
 * @param req - Express request with folder data in body and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function createFolder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const ownerId = req.userId!;
    const data: CreateFolderInput = req.body;
    const { name, parentId } = data;

    if (parentId) {
      const parentFolder = await folderService.getFolderById(parentId);

      if (!parentFolder) {
        res.status(404).json({ error: "Parent folder not found" });
        return;
      }

      if (parentFolder.ownerId !== ownerId) {
        res.status(403).json({
          error: "You are not allowed to create a folder in this parent folder",
        });
        return;
      }
    }

    const existingFolder = await folderService.getFolderByNameInParent(
      name,
      parentId || null,
      ownerId,
    );

    if (existingFolder) {
      res.status(409).json({
        error: "A folder with this name already exists",
      });
      return;
    }

    const folder = await folderService.createFolder(ownerId, name, parentId);
    res.status(201).json({ folder });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Deletes a folder and all its contents.
 *
 * @param req - Express request with folder ID in params and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function deleteFolder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const folder = await folderService.getFolderById(id);

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    if (folder.ownerId !== req.userId) {
      res.status(403).json({
        error: "You are not allowed to delete this folder",
      });
      return;
    }

    await folderService.deleteFolder(id);
    res.status(204).send();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Renames a folder.
 *
 * @param req - Express request with folder ID in params, new name in body, and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function renameFolder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const ownerId = req.userId!;
    const { id } = req.params;
    const data: RenameFolderInput = req.body;
    const { name } = data;

    const folder = await folderService.getFolderById(id);

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    if (folder.ownerId !== ownerId) {
      res.status(403).json({
        error: "You are not allowed to rename this folder",
      });
      return;
    }

    if (folder.name === name) {
      res.status(400).json({
        error: "The new name must be different from the current name",
      });
      return;
    }

    const existingFolder = await folderService.getFolderByNameInParent(
      name,
      folder.parentId,
      ownerId,
    );

    if (existingFolder && existingFolder.id !== id) {
      res.status(409).json({
        error: "A folder with this name already exists",
      });
      return;
    }

    const updatedFolder = await folderService.renameFolder(id, name, ownerId);
    res.json({ folder: updatedFolder });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Gets root folder contents for the authenticated user.
 *
 * @param req - Express request with user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function getRootFolder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const ownerId = req.userId!;
    const rootFolder = await folderService.getRootFolderContents(ownerId);

    res.json({
      folder: rootFolder,
      isOwner: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Gets breadcrumbs for a folder.
 *
 * Returns path from root to folder for owned folders,
 * or from first shared ancestor to folder for shared folders.
 *
 * @param req - Express request with folder ID in params and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function getFolderBreadcrumbs(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const breadcrumbs = await folderService.getFolderBreadcrumbs(id, userId);
    res.json({ breadcrumbs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Gets the folder tree structure for the authenticated user.
 *
 * @param req - Express request with user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function getFolderTree(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const ownerId = req.userId!;
    const tree = await folderService.getFolderTreeForOwner(ownerId);
    res.json({ folders: tree });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}

/**
 * Shares or unshares a folder.
 *
 * @param req - Express request with folder ID in params, share data in body, and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function shareFolder(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const ownerId = req.userId!;
    const { id } = req.params;
    const data: ShareFolderInput = req.body;
    const { durationHours, indefinite } = data;

    const folder = await folderService.getFolderById(id);

    if (!folder) {
      res.status(404).json({ error: "Folder not found" });
      return;
    }

    if (folder.ownerId !== ownerId) {
      res.status(403).json({
        error: "You are not allowed to share this folder",
      });
      return;
    }

    const updatedFolder = await folderService.shareFolder(
      id,
      durationHours,
      indefinite,
      ownerId,
    );
    res.json({ folder: updatedFolder });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
