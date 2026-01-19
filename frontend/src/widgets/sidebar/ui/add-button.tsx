import { useRef } from "react";
import {
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuSeparator,
} from "@/shared/ui";
import { AddIcon, FileIcon, FolderIcon } from "@/shared/assets/icons";
import {
  CreateFolderDialog,
  UploadFileDialog,
} from "@/widgets/folder/ui/dialogs";
import { DialogRef } from "@/shared/ui/dialog";

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
 * - Handles folder creation and file uploading via dialogs
 *
 * @param props - AddButton component props
 * @returns AddButton JSX element
 */
export function AddButton({ currentFolderId }: AddButtonProps) {
  const folderDialogRef = useRef<DialogRef>(null);
  const fileDialogRef = useRef<DialogRef>(null);

  const handleOpenNewFolderDialog = () => {
    folderDialogRef.current?.open();
  };

  const handleOpenNewFileDialog = () => {
    fileDialogRef.current?.open();
  };

  return (
    <>
      <Menu>
        <MenuTrigger
          className='py-2.5 px-5 rounded-md transition-colors font-bold flex items-center gap-3 bg-primary text-white hover:bg-primary/90 shadow-xl'
          aria-label='New item'
        >
          <AddIcon className='size-6' />
          NEW
        </MenuTrigger>
        <MenuList>
          <MenuItem
            className='flex items-center gap-3'
            onSelect={handleOpenNewFolderDialog}
          >
            <FolderIcon className='size-5' />
            <span>New Folder</span>
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            onSelect={handleOpenNewFileDialog}
            className='flex items-center gap-3'
          >
            <FileIcon className='size-5' />
            New File
          </MenuItem>
        </MenuList>
      </Menu>

      <CreateFolderDialog
        ref={folderDialogRef}
        currentFolderId={currentFolderId}
      />

      <UploadFileDialog ref={fileDialogRef} currentFolderId={currentFolderId} />
    </>
  );
}
