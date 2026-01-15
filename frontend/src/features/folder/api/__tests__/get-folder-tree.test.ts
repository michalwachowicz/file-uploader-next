import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getFolderTree } from "@/features/folder/api/get-folder-tree";
import { config } from "@/shared/lib/config";
import { FolderTreeResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("@/shared/lib/config", () => ({
  config: {
    apiUrl: "http://localhost:3001/api",
  },
}));

describe("getFolderTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully fetches folder tree with token", async () => {
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
            subfolders: [
              {
                id: "folder-1-1",
                name: "Subfolder 1",
                ownerId: "user-1",
                parentId: "folder-1",
                shareExpiresAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                subfolders: [],
              },
            ],
          },
        ],
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolderTree,
      });

      const result = await getFolderTree("test-token-123");

      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/folders/tree`, {
        headers: {
          Authorization: "Bearer test-token-123",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockFolderTree);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it("returns empty folder tree when no folders exist", async () => {
      const mockFolderTree: FolderTreeResponse = {
        folders: [],
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolderTree,
      });

      const result = await getFolderTree("test-token-123");

      expect(result).toEqual(mockFolderTree);
      expect(result.folders).toHaveLength(0);
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Unauthorized" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderTree("invalid-token")).rejects.toThrow(
        "Unauthorized"
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderTree("token")).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderTree("token")).rejects.toThrow(
        "Failed to fetch folder tree"
      );
    });
  });

  describe("client-side (without token)", () => {
    it("successfully fetches folder tree using apiClient", async () => {
      const mockFolderTree: FolderTreeResponse = {
        folders: [
          {
            id: "folder-2",
            name: "Folder 2",
            ownerId: "user-2",
            parentId: null,
            shareExpiresAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subfolders: [],
          },
        ],
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolderTree,
      });

      const result = await getFolderTree();

      expect(apiClient.get).toHaveBeenCalledWith("/folders/tree");
      expect(result).toEqual(mockFolderTree);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("returns nested folder structure", async () => {
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
                subfolders: [
                  {
                    id: "grandchild-1",
                    name: "Grandchild Folder",
                    ownerId: "user-1",
                    parentId: "child-1",
                    shareExpiresAt: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    subfolders: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolderTree,
      });

      const result = await getFolderTree();

      expect(result.folders[0].subfolders).toHaveLength(1);
      expect(result.folders[0].subfolders[0].subfolders).toHaveLength(1);
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Forbidden" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderTree()).rejects.toThrow("Forbidden");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderTree()).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderTree()).rejects.toThrow(
        "Failed to fetch folder tree"
      );
    });
  });
});
