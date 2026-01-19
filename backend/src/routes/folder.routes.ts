import { Router } from "express";
import * as folderController from "@/controllers/folderController";
import { validateRequest } from "@/middleware/validateRequest";
import { authenticate } from "@/middleware/authenticate";
import { createFolderSchema, renameFolderSchema } from "@file-uploader/shared";

const router = Router();

router.use(authenticate);

router.get("/tree", folderController.getFolderTree);

router.get("/root", folderController.getRootFolder);

router.get("/:id/breadcrumbs", folderController.getFolderBreadcrumbs);

router.get("/:id", folderController.getFolder);

router.post(
  "/",
  validateRequest(createFolderSchema),
  folderController.createFolder,
);

router.put(
  "/:id",
  validateRequest(renameFolderSchema),
  folderController.renameFolder,
);

router.delete("/:id", folderController.deleteFolder);

export default router;
