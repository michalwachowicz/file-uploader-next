import { FolderNode } from "@file-uploader/shared";
import {
  findFolderByIdInFolderTree,
  getFolderPathIds,
} from "@/features/folder/lib/utils";

describe("folder utils", () => {
  describe("findFolderByIdInFolderTree", () => {
    const createMockFolder = (
      id: string,
      name: string,
      subfolders: FolderNode[] = []
    ): FolderNode => ({
      id,
      name,
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subfolders,
    });

    it("finds folder at root level", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1"),
        createMockFolder("folder-2", "Folder 2"),
        createMockFolder("folder-3", "Folder 3"),
      ];

      const result = findFolderByIdInFolderTree(folders, "folder-2");

      expect(result).toBeDefined();
      expect(result?.id).toBe("folder-2");
      expect(result?.name).toBe("Folder 2");
    });

    it("finds folder in nested structure", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1", [
          createMockFolder("subfolder-1", "Subfolder 1"),
          createMockFolder("subfolder-2", "Subfolder 2"),
        ]),
        createMockFolder("folder-2", "Folder 2"),
      ];

      const result = findFolderByIdInFolderTree(folders, "subfolder-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("subfolder-1");
      expect(result?.name).toBe("Subfolder 1");
    });

    it("finds folder in deeply nested structure", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1", [
          createMockFolder("subfolder-1", "Subfolder 1", [
            createMockFolder("deep-1", "Deep Folder 1"),
            createMockFolder("deep-2", "Deep Folder 2", [
              createMockFolder("deeper-1", "Deeper Folder"),
            ]),
          ]),
        ]),
      ];

      const result = findFolderByIdInFolderTree(folders, "deeper-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("deeper-1");
      expect(result?.name).toBe("Deeper Folder");
    });

    it("returns undefined when folder is not found", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1"),
        createMockFolder("folder-2", "Folder 2"),
      ];

      const result = findFolderByIdInFolderTree(folders, "non-existent");

      expect(result).toBeUndefined();
    });

    it("finds folder when multiple folders have same name but different IDs", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Same Name"),
        createMockFolder("folder-2", "Same Name", [
          createMockFolder("subfolder-1", "Same Name"),
        ]),
      ];

      const result = findFolderByIdInFolderTree(folders, "subfolder-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("subfolder-1");
    });

    it("returns first match when multiple folders exist with same ID (edge case)", () => {
      const folder1 = createMockFolder("folder-1", "Folder 1");
      const folder2 = createMockFolder("folder-1", "Folder 1 Duplicate");
      const folders: FolderNode[] = [folder1, folder2];

      const result = findFolderByIdInFolderTree(folders, "folder-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("folder-1");
      expect(result).toBe(folder1);
    });
  });

  describe("getFolderPathIds", () => {
    const createMockFolder = (
      id: string,
      name: string,
      subfolders: FolderNode[] = []
    ): FolderNode => ({
      id,
      name,
      ownerId: "user-1",
      parentId: null,
      shareExpiresAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subfolders,
    });

    it("returns path for folder at root level", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1"),
        createMockFolder("folder-2", "Folder 2"),
      ];

      const result = getFolderPathIds(folders, "folder-1");

      expect(result).toEqual(["folder-1"]);
    });

    it("returns path for nested folder", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1", [
          createMockFolder("subfolder-1", "Subfolder 1"),
        ]),
      ];

      const result = getFolderPathIds(folders, "subfolder-1");

      expect(result).toEqual(["folder-1", "subfolder-1"]);
    });

    it("returns path for deeply nested folder", () => {
      const folders: FolderNode[] = [
        createMockFolder("root", "Root", [
          createMockFolder("level1", "Level 1", [
            createMockFolder("level2", "Level 2", [
              createMockFolder("level3", "Level 3"),
            ]),
          ]),
        ]),
      ];

      const result = getFolderPathIds(folders, "level3");

      expect(result).toEqual(["root", "level1", "level2", "level3"]);
    });

    it("returns empty array when folder is not found", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1"),
        createMockFolder("folder-2", "Folder 2"),
      ];

      const result = getFolderPathIds(folders, "non-existent");

      expect(result).toEqual([]);
    });

    it("returns empty array for empty folder array", () => {
      const folders: FolderNode[] = [];

      const result = getFolderPathIds(folders, "folder-1");

      expect(result).toEqual([]);
    });

    it("returns correct path when multiple root folders exist", () => {
      const folders: FolderNode[] = [
        createMockFolder("root-1", "Root 1", [
          createMockFolder("child-1", "Child 1"),
        ]),
        createMockFolder("root-2", "Root 2", [
          createMockFolder("child-2", "Child 2"),
        ]),
      ];

      const result = getFolderPathIds(folders, "child-2");

      expect(result).toEqual(["root-2", "child-2"]);
    });

    it("returns correct path when target is in first branch but not second", () => {
      const folders: FolderNode[] = [
        createMockFolder("root-1", "Root 1", [
          createMockFolder("child-1", "Child 1"),
          createMockFolder("child-2", "Child 2"),
        ]),
        createMockFolder("root-2", "Root 2"),
      ];

      const result = getFolderPathIds(folders, "child-2");

      expect(result).toEqual(["root-1", "child-2"]);
    });

    it("handles folder with empty subfolders array", () => {
      const folders: FolderNode[] = [
        createMockFolder("folder-1", "Folder 1", []),
      ];

      const result = getFolderPathIds(folders, "folder-1");

      expect(result).toEqual(["folder-1"]);
    });

    it("returns path in correct order from root to target", () => {
      const folders: FolderNode[] = [
        createMockFolder("a", "A", [
          createMockFolder("b", "B", [createMockFolder("c", "C")]),
        ]),
      ];

      const result = getFolderPathIds(folders, "c");

      expect(result).toEqual(["a", "b", "c"]);
      expect(result[0]).toBe("a");
      expect(result[result.length - 1]).toBe("c");
    });
  });
});
