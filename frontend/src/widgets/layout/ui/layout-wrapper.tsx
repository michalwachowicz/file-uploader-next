"use client";

import { FolderNode } from "@file-uploader/shared";
import { useFolderAccess } from "@/widgets/folder/lib";
import { Sidebar, SidebarToggler } from "@/widgets/sidebar/ui";
import { useId, useState } from "react";

/**
 * Props for the LayoutWrapper component.
 */
interface LayoutWrapperProps {
  /**
   * Array of folder nodes representing the folder tree structure.
   */
  folders: FolderNode[];
  /**
   * Navigation component to display in the header (e.g., Header component).
   */
  navigation: React.ReactNode;
  /**
   * Page content to display in the main area.
   */
  children: React.ReactNode;
}

/**
 * CSS classes for the main wrapper container.
 */
const WRAPPER_CLASSES = "flex h-[calc(100vh-5rem)]";

/**
 * CSS classes for the main content area.
 */
const MAIN_CLASSES =
  "flex-1 p-6 overflow-y-auto bg-slate-900 rounded-lg m-5 mt-0";

/**
 * CSS classes for the navigation/header area.
 */
const NAVIGATION_CLASSES = "flex items-center py-7 px-6 gap-4";

/**
 * Layout component that displays content without a sidebar.
 * Used when the user doesn't have access to the current folder or is on an unauthorized route.
 *
 * @param navigation - Navigation component to display in the header
 * @param children - Page content to display in the main area
 */
const NoSidebarLayout = ({
  navigation,
  children,
}: {
  navigation: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className={NAVIGATION_CLASSES}>
        <div className='flex-1'>{navigation}</div>
      </div>
      <div className={WRAPPER_CLASSES}>
        <main className={MAIN_CLASSES}>{children}</main>
      </div>
    </>
  );
};

/**
 * Layout wrapper component that conditionally displays a sidebar based on route and folder ownership.
 *
 * Features:
 * - Shows sidebar for root route and folders owned by the current user
 * - Hides sidebar for unauthorized folder access
 * - Provides toggle button to show/hide sidebar
 * - Automatically detects current folder from URL path
 *
 * @param folders - Array of folder nodes representing the folder tree structure
 * @param navigation - Navigation component to display in the header
 * @param children - Page content to display in the main area
 * @returns Layout with conditional sidebar display
 */
export function LayoutWrapper({
  folders,
  navigation,
  children,
}: LayoutWrapperProps) {
  const sidebarId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const { isOwner, currentFolderId } = useFolderAccess(folders);

  if (!isOwner) {
    return (
      <NoSidebarLayout navigation={navigation}>{children}</NoSidebarLayout>
    );
  }

  return (
    <>
      <div className={NAVIGATION_CLASSES}>
        <SidebarToggler
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          ariaControls={sidebarId}
        />
        <div className='flex-1'>{navigation}</div>
      </div>

      <div className={WRAPPER_CLASSES}>
        {isOpen && (
          <Sidebar
            id={sidebarId}
            folders={folders}
            currentFolderId={currentFolderId}
          />
        )}
        <main className={MAIN_CLASSES}>{children}</main>
      </div>
    </>
  );
}
