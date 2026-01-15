import { cookies } from "next/headers";
import { getFolderTree } from "@/features/folder/lib/actions";
import { getFolderTree as getFolderTreeApi } from "@/features/folder/api";
import { FolderTreeResponse } from "@file-uploader/shared";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/features/folder/api", () => ({
  getFolderTree: vi.fn(),
}));

describe("getFolderTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns folder tree when token exists and request succeeds", async () => {
    const mockFolderTree: FolderTreeResponse = {
      folders: [
        {
          id: "folder-1",
          name: "Folder 1",
          ownerId: "user-1",
          parentId: null,
          shareExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [],
        },
      ],
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token-123" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderTreeApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFolderTree
    );

    const result = await getFolderTree();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderTreeApi).toHaveBeenCalledWith("test-token-123");
    expect(result).toEqual(mockFolderTree);
  });

  it("returns null when token does not exist", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

    const result = await getFolderTree();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderTreeApi).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns null when token exists but cookie value is empty", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

    const result = await getFolderTree();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderTreeApi).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns null when getFolderTreeApi throws an error", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "invalid-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderTreeApi as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("API Error")
    );

    const result = await getFolderTree();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderTreeApi).toHaveBeenCalledWith("invalid-token");
    expect(result).toBeNull();
  });

  it("returns null when cookies() throws an error", async () => {
    (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Cookie error")
    );

    const result = await getFolderTree();

    expect(cookies).toHaveBeenCalled();
    expect(getFolderTreeApi).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns folder tree with nested structure", async () => {
    const mockFolderTree: FolderTreeResponse = {
      folders: [
        {
          id: "root-1",
          name: "Root Folder",
          ownerId: "user-1",
          parentId: null,
          shareExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [
            {
              id: "child-1",
              name: "Child Folder",
              ownerId: "user-1",
              parentId: "root-1",
              shareExpiresAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              subfolders: [],
            },
          ],
        },
      ],
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderTreeApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFolderTree
    );

    const result = await getFolderTree();

    expect(result).toEqual(mockFolderTree);
    expect(result?.folders[0].subfolders).toHaveLength(1);
  });

  it("returns empty folder tree when no folders exist", async () => {
    const mockFolderTree: FolderTreeResponse = {
      folders: [],
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderTreeApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFolderTree
    );

    const result = await getFolderTree();

    expect(result).toEqual(mockFolderTree);
    expect(result?.folders).toHaveLength(0);
  });
});
