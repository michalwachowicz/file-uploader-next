import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFolder } from "@/features/folder/api";
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuSeparator,
} from "@/shared/ui";
import { AddIcon, FileIcon, FolderIcon } from "@/shared/assets/icons";

/**
 * Props for the AddButton component.
 */
interface AddButtonProps {
  /**
   * The ID of the current folder where new items will be created.
   * Undefined or empty string for root level.
   */
  currentFolderId?: string;
}

/**
 * Button component with a menu for creating new folders and files.
 *
 * Features:
 * - Displays a "NEW" button with an add icon
 * - Opens a menu with options to create folders or files
 * - Handles folder creation with user input via prompt
 * - Refreshes the page after successful folder creation
 * - Shows loading state while creating items
 * - File creation is currently a placeholder (TODO)
 *
 * @param props - AddButton component props
 * @returns AddButton JSX element
 */
export function AddButton({ currentFolderId }: AddButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Handles the creation of a new folder.
   * Prompts the user for a folder name and creates the folder in the current location.
   * Refreshes the page on success to update the folder tree.
   */
  const handleCreateFolder = async () => {
    const folderName = (prompt("Enter folder name:") || "").trim();
    if (!folderName) {
      return;
    }

    try {
      setIsCreating(true);

      await createFolder({
        name: folderName,
        parentId: currentFolderId,
      });

      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create folder";
      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handles the creation of a new file.
   * Currently a placeholder - file upload functionality to be implemented.
   */
  const handleCreateFile = () => {
    // TODO: Implement file upload functionality
  };

  return (
    <Menu>
      <MenuTrigger
        className='py-2.5 px-5 rounded-md transition-colors font-bold flex items-center gap-3 bg-primary text-white hover:bg-primary/90 shadow-xl'
        aria-label='New item'
        disabled={isCreating}
      >
        <AddIcon className='size-6' />
        NEW
      </MenuTrigger>
      <MenuList>
        <MenuItem
          onSelect={handleCreateFolder}
          disabled={isCreating}
          className='flex items-center gap-3'
        >
          <FolderIcon className='size-5' />
          New Folder
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          onSelect={handleCreateFile}
          disabled={isCreating}
          className='flex items-center gap-3'
        >
          <FileIcon className='size-5' />
          New File
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
