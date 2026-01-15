import { Response } from "express";
import * as folderService from "@/services/folderService";
import { CreateFolderInput, RenameFolderInput } from "@file-uploader/shared";
import { AuthRequest } from "@/middleware/authenticate";

/**
 * Gets a folder by ID with its subfolders and files.
 *
 * @param req - Express request with folder ID in params and user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function getFolder(
  req: AuthRequest,
  res: Response
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
      const isShareValid = await folderService.hasValidShareInAncestors(
        folder.id
      );

      if (!isShareValid) {
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
  res: Response
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
      ownerId
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
  res: Response
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
  res: Response
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

    const existingFolder = await folderService.getFolderByNameInParent(
      name,
      folder.parentId,
      ownerId
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
 * Gets the folder tree structure for the authenticated user.
 *
 * @param req - Express request with user info from authenticate middleware
 * @param res - Express response object
 * @returns Promise that resolves when the response is sent
 */
export async function getFolderTree(
  req: AuthRequest,
  res: Response
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
