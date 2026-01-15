/**
 * Base folder type matching the database schema.
 */
export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  shareExpiresAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Folder node type representing a folder with nested subfolders.
 */
export interface FolderNode extends Folder {
  subfolders: FolderNode[];
}

/**
 * Response from the folder tree API endpoint.
 */
export interface FolderTreeResponse {
  folders: FolderNode[];
}

/**
 * Folder with subfolders and files.
 */
export interface FolderWithSubfoldersAndFiles {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  shareExpiresAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  subfolders?: Array<Folder>;
  files?: Array<{
    id: string;
    name: string;
    fileLink: string;
    sizeBytes: number | null;
    ownerId: string;
    folderId: string | null;
    shareExpiresAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>;
}

/**
 * Response from the get folder API endpoint.
 */
export interface GetFolderResponse {
  folder: FolderWithSubfoldersAndFiles;
  isOwner: boolean;
}
