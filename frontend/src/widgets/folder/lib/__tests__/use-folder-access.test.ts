import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useFolderAccess } from "@/widgets/folder/lib/use-folder-access";
import { useUser } from "@/features/auth/lib";
import { findFolderByIdInFolderTree } from "@/features/folder/lib";
import { Routes } from "@/shared/lib/routes";
import { FolderNode } from "@file-uploader/shared";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/features/auth/lib", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/features/folder/lib", () => ({
  findFolderByIdInFolderTree: vi.fn(),
}));

describe("useFolderAccess", () => {
  const createMockFolder = (
    id: string,
    name: string,
    ownerId: string,
    subfolders: FolderNode[] = []
  ): FolderNode => ({
    id,
    name,
    ownerId,
    parentId: null,
    shareExpiresAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subfolders,
  });

  const mockFolders: FolderNode[] = [
    createMockFolder("folder-1", "Folder 1", "user-1"),
    createMockFolder("folder-2", "Folder 2", "user-2"),
    createMockFolder("folder-3", "Folder 3", "user-1", [
      createMockFolder("subfolder-1", "Subfolder 1", "user-1"),
    ]),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("root route", () => {
    it("allows access when on root route", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(Routes.HOME);
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.currentFolderId).toBeUndefined();
      expect(result.current.folder).toBeUndefined();
      expect(findFolderByIdInFolderTree).not.toHaveBeenCalled();
    });

    it("allows access on root route even without user", () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(Routes.HOME);
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(null);

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.currentFolderId).toBeUndefined();
      expect(result.current.folder).toBeUndefined();
    });
  });

  describe("folder route with ownership", () => {
    it("allows access when user owns the folder", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockFolder = createMockFolder("folder-1", "Folder 1", "user-1");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-1"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.currentFolderId).toBe("folder-1");
      expect(result.current.folder).toEqual(mockFolder);
      expect(findFolderByIdInFolderTree).toHaveBeenCalledWith(
        mockFolders,
        "folder-1"
      );
    });

    it("allows access for nested folder when user owns it", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockSubfolder = createMockFolder(
        "subfolder-1",
        "Subfolder 1",
        "user-1"
      );

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/subfolder-1"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockSubfolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.currentFolderId).toBe("subfolder-1");
      expect(result.current.folder).toEqual(mockSubfolder);
    });
  });

  describe("folder route without ownership", () => {
    it("denies access when user does not own the folder", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockFolder = createMockFolder("folder-2", "Folder 2", "user-2");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-2"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.currentFolderId).toBe("folder-2");
      expect(result.current.folder).toEqual(mockFolder);
    });

    it("denies access when no user is logged in", () => {
      const mockFolder = createMockFolder("folder-1", "Folder 1", "user-1");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-1"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.currentFolderId).toBe("folder-1");
      expect(result.current.folder).toEqual(mockFolder);
    });

    it("denies access when folder is not found", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/non-existent"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        undefined
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.currentFolderId).toBe("non-existent");
      expect(result.current.folder).toBeUndefined();
    });
  });

  describe("pathname parsing", () => {
    it("extracts folder ID from pathname correctly", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockFolder = createMockFolder("abc-123", "Folder", "user-1");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/abc-123"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.currentFolderId).toBe("abc-123");
    });

    it("handles pathname with trailing slash", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockFolder = createMockFolder("folder-1", "Folder", "user-1");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-1/"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.currentFolderId).toBe("folder-1");
    });

    it("handles pathname with additional path segments", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockFolder = createMockFolder("folder-1", "Folder", "user-1");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-1/files"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.currentFolderId).toBe("folder-1");
    });

    it("returns undefined for pathname that does not match folder pattern", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/settings");
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.currentFolderId).toBeUndefined();
      expect(result.current.folder).toBeUndefined();
      expect(findFolderByIdInFolderTree).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("handles empty folders array", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-1"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        undefined
      );

      const { result } = renderHook(() => useFolderAccess([]));

      expect(result.current.isOwner).toBe(false);
      expect(result.current.currentFolderId).toBe("folder-1");
      expect(result.current.folder).toBeUndefined();
    });

    it("handles undefined pathname", () => {
      const mockUser = {
        id: "user-1",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.currentFolderId).toBeUndefined();
      expect(result.current.folder).toBeUndefined();
      expect(findFolderByIdInFolderTree).not.toHaveBeenCalled();
    });

    it("handles user with different ID format", () => {
      const mockUser = {
        id: "user-999",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };
      const mockFolder = createMockFolder("folder-1", "Folder 1", "user-999");

      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/folders/folder-1"
      );
      (useUser as ReturnType<typeof vi.fn>).mockReturnValue(mockUser);
      (findFolderByIdInFolderTree as ReturnType<typeof vi.fn>).mockReturnValue(
        mockFolder
      );

      const { result } = renderHook(() => useFolderAccess(mockFolders));

      expect(result.current.isOwner).toBe(true);
      expect(result.current.folder).toEqual(mockFolder);
    });
  });
});
