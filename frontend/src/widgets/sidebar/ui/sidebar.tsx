"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState, useMemo } from "react";
import { FolderNode } from "@file-uploader/shared";
import { Routes } from "@/shared/lib/routes";
import { AddButton } from "@/widgets/sidebar/ui/add-button";
import {
  ArrowDropdownIcon,
  FolderIcon,
  FolderSharedIcon,
} from "@/shared/assets/icons";
import { getFolderPathIds } from "@/features/folder/lib";

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
  /**
   * Array of folder nodes representing the folder tree structure.
   */
  folders: FolderNode[];
  /**
   * Optional ID of the currently active folder.
   */
  currentFolderId?: string;
  /**
   * Optional ID for the sidebar element (for accessibility).
   */
  id?: string;
}

/**
 * Props for the FolderItem component.
 */
interface FolderItemProps {
  /**
   * The folder node to display.
   */
  folder: FolderNode;
  /**
   * Optional ID of the currently active folder.
   */
  currentFolderId?: string;
  /**
   * The nesting level of the folder (0 for root level).
   * @default 0
   */
  level?: number;
  /**
   * Set of folder IDs that are currently expanded.
   */
  expandedFolders: Set<string>;
  /**
   * Callback function to toggle the expansion state of a folder.
   * @param folderId - The ID of the folder to toggle
   */
  onToggleFolder: (folderId: string) => void;
  /**
   * Optional custom href for the folder link. If not provided, defaults to the folder route.
   */
  href?: string;
  /**
   * Whether the parent folder is shared. If true, this folder and its children will also be marked as shared.
   * @default false
   */
  isParentShared?: boolean;
}

/**
 * Recursive component that renders a single folder item in the sidebar tree.
 *
 * Features:
 * - Displays folder name and its subfolders with appropriate icon (shared or regular)
 * - Shows expand/collapse button for folders with subfolders
 * - Highlights the active folder
 * - Handles nested folder rendering recursively
 *
 * @param props - FolderItem component props
 * @returns Folder item JSX element
 */
function FolderItem({
  folder,
  currentFolderId,
  level = 0,
  expandedFolders,
  onToggleFolder,
  href,
  isParentShared = false,
}: FolderItemProps) {
  const isActive =
    folder.id === currentFolderId || (folder.id === "" && !currentFolderId);
  const paddingLeft = level * 1.5;
  const hasSubfolders = folder.subfolders.length > 0;
  const isExpanded = expandedFolders.has(folder.id);
  const linkHref = href || `${Routes.HOME}folders/${folder.id}`;

  const isShared =
    isParentShared ||
    (folder.shareExpiresAt !== null &&
      new Date(folder.shareExpiresAt) > new Date());

  const Icon = isShared ? FolderSharedIcon : FolderIcon;

  return (
    <div>
      <div
        className={clsx("flex items-center py-2 px-4 rounded", {
          "bg-slate-700 font-semibold": isActive,
          "hover:bg-slate-800": !isActive,
        })}
        style={{ paddingLeft: `${paddingLeft + 0.5}rem` }}
      >
        {hasSubfolders && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFolder(folder.id);
            }}
            className='mr-0.5 p-0.5 hover:bg-slate-700 rounded shrink-0'
            aria-label={
              isExpanded
                ? `Collapse folder ${folder.name}`
                : `Expand folder ${folder.name}`
            }
          >
            <ArrowDropdownIcon
              className={clsx("size-4 text-slate-400 transition-transform", {
                "-rotate-90": !isExpanded,
              })}
            />
          </button>
        )}
        {!hasSubfolders && <span className='w-5.5' />}
        <Link
          href={linkHref}
          className='flex flex-1 text-slate-100 gap-2.5 items-center text-sm'
        >
          <Icon className='size-4.5' />
          {folder.name}
        </Link>
      </div>
      {hasSubfolders && isExpanded && (
        <div>
          {folder.subfolders.map((subfolder) => (
            <FolderItem
              key={subfolder.id}
              folder={subfolder}
              currentFolderId={currentFolderId}
              level={level + 1}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              isParentShared={isShared}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Sidebar component displaying the folder tree structure with expand/collapse functionality.
 *
 * Features:
 * - Displays a virtual "My Drive" folder containing all root folders
 * - Allows manual expand/collapse of folders
 * - Highlights the currently active folder
 * - Shows shared folder icons for folders with active share links
 * - Includes a "New" button for creating new folders and files
 *
 * @param props - Sidebar component props
 * @returns Sidebar JSX element
 */
export function Sidebar({ folders, currentFolderId, id }: SidebarProps) {
  const myDriveFolder: FolderNode = useMemo(
    () => ({
      id: "",
      name: "My Drive",
      ownerId: "",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subfolders: folders,
    }),
    [folders]
  );

  const requiredExpandedFolders = useMemo(() => {
    if (!currentFolderId) return new Set<string>();
    const pathIds = getFolderPathIds(folders, currentFolderId);
    return new Set(["", ...pathIds.slice(0, -1)]);
  }, [folders, currentFolderId]);

  const [userExpandedFolders, setUserExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const expandedFolders = useMemo(() => {
    const combined = new Set(requiredExpandedFolders);
    userExpandedFolders.forEach((id) => combined.add(id));
    return combined;
  }, [requiredExpandedFolders, userExpandedFolders]);

  const handleToggleFolder = (folderId: string) => {
    setUserExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  return (
    <aside
      id={id}
      className='w-64 border-slate-700 h-full overflow-y-auto flex flex-col'
      role='complementary'
      aria-label='Folder navigation'
    >
      <div className='p-4 shrink-0 pt-0'>
        <AddButton currentFolderId={currentFolderId} />
        <nav className='flex-1 overflow-y-auto my-5'>
          <FolderItem
            folder={myDriveFolder}
            currentFolderId={currentFolderId}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            href={Routes.HOME}
          />
        </nav>
      </div>
    </aside>
  );
}
