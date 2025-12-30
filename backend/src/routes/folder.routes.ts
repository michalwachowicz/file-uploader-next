import { Router } from "express";
import * as folderController from "@/controllers/folderController";
import { validateRequest } from "@/middleware/validateRequest";
import { authenticate } from "@/middleware/authenticate";
import { createFolderSchema, renameFolderSchema } from "@file-uploader/shared";

const router = Router();

// All folder routes require authentication
router.use(authenticate);

// Get folder tree for authenticated user
router.get("/tree", folderController.getFolderTree);

// Get folder by ID
router.get("/:id", folderController.getFolder);

// Create folder
router.post(
  "/",
  validateRequest(createFolderSchema),
  folderController.createFolder
);

// Rename folder
router.put(
  "/:id",
  validateRequest(renameFolderSchema),
  folderController.renameFolder
);

// Delete folder
router.delete("/:id", folderController.deleteFolder);

export default router;
