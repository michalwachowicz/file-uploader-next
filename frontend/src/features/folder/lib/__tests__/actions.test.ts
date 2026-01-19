import { cookies } from "next/headers";
import {
  getFolderTree,
  getRootFolder,
  getFolder,
  getFolderBreadcrumbs,
} from "@/features/folder/lib/actions";
import {
  getFolderTree as getFolderTreeApi,
  getRootFolder as getRootFolderApi,
  getFolder as getFolderApi,
  getFolderBreadcrumbs as getFolderBreadcrumbsApi,
} from "@/features/folder/api";
import {
  FolderTreeResponse,
  GetFolderResponse,
  GetFolderBreadcrumbsResponse,
} from "@file-uploader/shared";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/features/folder/api", () => ({
  getFolderTree: vi.fn(),
  getRootFolder: vi.fn(),
  getFolder: vi.fn(),
  getFolderBreadcrumbs: vi.fn(),
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
      mockFolderTree,
    );

    const result = await getFolderTree();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderTreeApi).toHaveBeenCalledWith("test-token-123");
    expect(result).toEqual(mockFolderTree);
  });

  describe.each([
    {
      description: "returns null when token does not exist",
      cookieValue: undefined,
      shouldCallApi: false,
    },
    {
      description: "returns null when token exists but cookie value is empty",
      cookieValue: { value: "" },
      shouldCallApi: false,
    },
    {
      description: "returns null when getFolderTreeApi throws an error",
      cookieValue: { value: "invalid-token" },
      shouldCallApi: true,
      apiError: new Error("API Error"),
    },
    {
      description: "returns null when cookies() throws an error",
      cookieValue: null,
      shouldCallApi: false,
      cookieError: new Error("Cookie error"),
    },
  ])(
    "$description",
    ({ cookieValue, shouldCallApi, apiError, cookieError }) => {
      it("returns null", async () => {
        if (cookieError) {
          (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(cookieError);
        } else {
          const mockCookieStore = {
            get: vi.fn().mockReturnValue(cookieValue),
          };
          (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockCookieStore,
          );
          if (apiError) {
            (getFolderTreeApi as ReturnType<typeof vi.fn>).mockRejectedValue(
              apiError,
            );
          }
        }

        const result = await getFolderTree();

        expect(cookies).toHaveBeenCalled();
        if (shouldCallApi && !cookieError) {
          expect(getFolderTreeApi).toHaveBeenCalledWith("invalid-token");
        } else {
          expect(getFolderTreeApi).not.toHaveBeenCalled();
        }
        expect(result).toBeNull();
      });
    },
  );

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
      mockFolderTree,
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
      mockFolderTree,
    );

    const result = await getFolderTree();

    expect(result).toEqual(mockFolderTree);
    expect(result?.folders).toHaveLength(0);
  });
});

describe("getRootFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns root folder when token exists and request succeeds", async () => {
    const mockRootFolder: GetFolderResponse = {
      folder: {
        id: "",
        name: "My Drive",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subfolders: [
          {
            id: "folder-1",
            name: "Folder 1",
            ownerId: "user-1",
            parentId: null,
            shareExpiresAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        files: [
          {
            id: "file-1",
            name: "file1.pdf",
            fileLink: "https://example.com/file1.pdf",
            sizeBytes: 1024,
            ownerId: "user-1",
            folderId: null,
            shareExpiresAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      isOwner: true,
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token-123" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getRootFolderApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRootFolder,
    );

    const result = await getRootFolder();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getRootFolderApi).toHaveBeenCalledWith("test-token-123");
    expect(result).toEqual(mockRootFolder);
  });

  describe.each([
    {
      description: "returns null when token does not exist",
      cookieValue: undefined,
      shouldCallApi: false,
    },
    {
      description: "returns null when token exists but cookie value is empty",
      cookieValue: { value: "" },
      shouldCallApi: false,
    },
    {
      description: "returns null when getRootFolderApi throws an error",
      cookieValue: { value: "invalid-token" },
      shouldCallApi: true,
      apiError: new Error("API Error"),
    },
    {
      description: "returns null when cookies() throws an error",
      cookieValue: null,
      shouldCallApi: false,
      cookieError: new Error("Cookie error"),
    },
  ])(
    "$description",
    ({ cookieValue, shouldCallApi, apiError, cookieError }) => {
      it("returns null", async () => {
        if (cookieError) {
          (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(cookieError);
        } else {
          const mockCookieStore = {
            get: vi.fn().mockReturnValue(cookieValue),
          };
          (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockCookieStore,
          );
          if (apiError) {
            (getRootFolderApi as ReturnType<typeof vi.fn>).mockRejectedValue(
              apiError,
            );
          }
        }

        const result = await getRootFolder();

        expect(cookies).toHaveBeenCalled();
        if (shouldCallApi && !cookieError) {
          expect(getRootFolderApi).toHaveBeenCalledWith("invalid-token");
        } else {
          expect(getRootFolderApi).not.toHaveBeenCalled();
        }
        expect(result).toBeNull();
      });
    },
  );

  it("returns empty root folder when no folders or files exist", async () => {
    const mockRootFolder: GetFolderResponse = {
      folder: {
        id: "",
        name: "My Drive",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subfolders: [],
        files: [],
      },
      isOwner: true,
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getRootFolderApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRootFolder,
    );

    const result = await getRootFolder();

    expect(result).toEqual(mockRootFolder);
    expect(result?.folder.subfolders).toHaveLength(0);
    expect(result?.folder.files).toHaveLength(0);
  });
});

describe("getFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns folder when token exists and request succeeds", async () => {
    const mockFolder: GetFolderResponse = {
      folder: {
        id: "folder-1",
        name: "Folder 1",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subfolders: [
          {
            id: "subfolder-1",
            name: "Subfolder 1",
            ownerId: "user-1",
            parentId: "folder-1",
            shareExpiresAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        files: [
          {
            id: "file-1",
            name: "file1.pdf",
            fileLink: "https://example.com/file1.pdf",
            sizeBytes: 1024,
            ownerId: "user-1",
            folderId: "folder-1",
            shareExpiresAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      isOwner: true,
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token-123" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await getFolder("folder-1");

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderApi).toHaveBeenCalledWith("folder-1", "test-token-123");
    expect(result).toEqual(mockFolder);
  });

  describe.each([
    {
      description: "returns null when token does not exist",
      cookieValue: undefined,
      shouldCallApi: false,
    },
    {
      description: "returns null when token exists but cookie value is empty",
      cookieValue: { value: "" },
      shouldCallApi: false,
    },
    {
      description: "returns null when getFolderApi throws an error",
      cookieValue: { value: "invalid-token" },
      shouldCallApi: true,
      apiError: new Error("API Error"),
    },
    {
      description: "returns null when cookies() throws an error",
      cookieValue: null,
      shouldCallApi: false,
      cookieError: new Error("Cookie error"),
    },
  ])(
    "$description",
    ({ cookieValue, shouldCallApi, apiError, cookieError }) => {
      it("returns null", async () => {
        const folderId = "folder-1";
        if (cookieError) {
          (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(cookieError);
        } else {
          const mockCookieStore = {
            get: vi.fn().mockReturnValue(cookieValue),
          };
          (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockCookieStore,
          );
          if (apiError) {
            (getFolderApi as ReturnType<typeof vi.fn>).mockRejectedValue(
              apiError,
            );
          }
        }

        const result = await getFolder(folderId);

        expect(cookies).toHaveBeenCalled();
        if (shouldCallApi && !cookieError) {
          expect(getFolderApi).toHaveBeenCalledWith(folderId, "invalid-token");
        } else {
          expect(getFolderApi).not.toHaveBeenCalled();
        }
        expect(result).toBeNull();
      });
    },
  );

  it("returns folder with isOwner false for shared folders", async () => {
    const mockFolder: GetFolderResponse = {
      folder: {
        id: "folder-2",
        name: "Shared Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subfolders: [],
        files: [],
      },
      isOwner: false,
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderApi as ReturnType<typeof vi.fn>).mockResolvedValue(mockFolder);

    const result = await getFolder("folder-2");

    expect(result).toEqual(mockFolder);
    expect(result?.isOwner).toBe(false);
  });
});

describe("getFolderBreadcrumbs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns breadcrumbs when token exists and request succeeds", async () => {
    const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
      breadcrumbs: [
        {
          id: "",
          name: "My Drive",
          shareExpiresAt: null,
        },
        {
          id: "folder-1",
          name: "Folder 1",
          shareExpiresAt: null,
        },
        {
          id: "folder-2",
          name: "Folder 2",
          shareExpiresAt: null,
        },
      ],
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token-123" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderBreadcrumbsApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockBreadcrumbs,
    );

    const result = await getFolderBreadcrumbs("folder-2");

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(getFolderBreadcrumbsApi).toHaveBeenCalledWith(
      "folder-2",
      "test-token-123",
    );
    expect(result).toEqual(mockBreadcrumbs);
  });

  describe.each([
    {
      description: "returns null when token does not exist",
      cookieValue: undefined,
      shouldCallApi: false,
    },
    {
      description: "returns null when token exists but cookie value is empty",
      cookieValue: { value: "" },
      shouldCallApi: false,
    },
    {
      description: "returns null when getFolderBreadcrumbsApi throws an error",
      cookieValue: { value: "invalid-token" },
      shouldCallApi: true,
      apiError: new Error("API Error"),
    },
    {
      description: "returns null when cookies() throws an error",
      cookieValue: null,
      shouldCallApi: false,
      cookieError: new Error("Cookie error"),
    },
  ])(
    "$description",
    ({ cookieValue, shouldCallApi, apiError, cookieError }) => {
      it("returns null", async () => {
        const folderId = "folder-1";
        if (cookieError) {
          (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(cookieError);
        } else {
          const mockCookieStore = {
            get: vi.fn().mockReturnValue(cookieValue),
          };
          (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockCookieStore,
          );
          if (apiError) {
            (
              getFolderBreadcrumbsApi as ReturnType<typeof vi.fn>
            ).mockRejectedValue(apiError);
          }
        }

        const result = await getFolderBreadcrumbs(folderId);

        expect(cookies).toHaveBeenCalled();
        if (shouldCallApi && !cookieError) {
          expect(getFolderBreadcrumbsApi).toHaveBeenCalledWith(
            folderId,
            "invalid-token",
          );
        } else {
          expect(getFolderBreadcrumbsApi).not.toHaveBeenCalled();
        }
        expect(result).toBeNull();
      });
    },
  );

  it("returns breadcrumbs for root folder", async () => {
    const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
      breadcrumbs: [
        {
          id: "",
          name: "My Drive",
          shareExpiresAt: null,
        },
      ],
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderBreadcrumbsApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockBreadcrumbs,
    );

    const result = await getFolderBreadcrumbs("root-folder-id");

    expect(result).toEqual(mockBreadcrumbs);
    expect(result?.breadcrumbs).toHaveLength(1);
    expect(result?.breadcrumbs[0].id).toBe("");
    expect(result?.breadcrumbs[0].name).toBe("My Drive");
  });

  it("returns breadcrumbs with shared folder information", async () => {
    const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
      breadcrumbs: [
        {
          id: "shared-folder-1",
          name: "Shared Folder",
          shareExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          id: "folder-1",
          name: "Nested Folder",
          shareExpiresAt: null,
        },
      ],
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (getFolderBreadcrumbsApi as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockBreadcrumbs,
    );

    const result = await getFolderBreadcrumbs("folder-1");

    expect(result).toEqual(mockBreadcrumbs);
    expect(result?.breadcrumbs[0].shareExpiresAt).not.toBeNull();
  });
});
