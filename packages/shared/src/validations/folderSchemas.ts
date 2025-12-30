import { z } from "zod";

/**
 * Validates and sanitizes folder names.
 * Removes invalid filesystem characters and ensures the name is not empty.
 */
const folderNameValidation = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters")
  .transform((val) => val.replace(/[<>:"/\\|?*]/g, ""))
  .refine(
    (val) => val.length > 0,
    "Folder name contains only invalid characters"
  );

/**
 * Schema for creating a new folder.
 */
export const createFolderSchema = z.object({
  name: folderNameValidation,
  parentId: z.string().uuid().optional(),
});

/**
 * Schema for renaming a folder.
 */
export const renameFolderSchema = z.object({
  name: folderNameValidation,
});

/**
 * TypeScript type inferred from createFolderSchema.
 */
export type CreateFolderInput = z.infer<typeof createFolderSchema>;

/**
 * TypeScript type inferred from renameFolderSchema.
 */
export type RenameFolderInput = z.infer<typeof renameFolderSchema>;
