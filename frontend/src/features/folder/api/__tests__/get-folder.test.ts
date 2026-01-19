import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getFolder } from "@/features/folder/api/get-folder";
import { config } from "@/shared/lib/config";
import { GetFolderResponse } from "@file-uploader/shared";

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

describe("getFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully fetches folder with token", async () => {
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

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolder,
      });

      const result = await getFolder("folder-1", "test-token-123");

      expect(axios.get).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-1`,
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(result).toEqual(mockFolder);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it("returns folder with empty subfolders and files", async () => {
      const mockFolder: GetFolderResponse = {
        folder: {
          id: "folder-2",
          name: "Empty Folder",
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

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolder,
      });

      const result = await getFolder("folder-2", "test-token-123");

      expect(result).toEqual(mockFolder);
      expect(result.folder.subfolders).toHaveLength(0);
      expect(result.folder.files).toHaveLength(0);
    });

    it("returns folder with isOwner false for shared folders", async () => {
      const mockFolder: GetFolderResponse = {
        folder: {
          id: "folder-3",
          name: "Shared Folder",
          ownerId: "user-2",
          parentId: null,
          shareExpiresAt: new Date(Date.now() + 86400000).toISOString(), // expires in 1 day
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [],
          files: [],
        },
        isOwner: false,
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolder,
      });

      const result = await getFolder("folder-3", "test-token-123");

      expect(result.isOwner).toBe(false);
      expect(result.folder.ownerId).toBe("user-2");
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Folder not found" },
          status: 404,
          statusText: "Not Found",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolder("invalid-id", "token")).rejects.toThrow(
        "Folder not found",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolder("folder-1", "token")).rejects.toThrow(
        "Network Error",
      );
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolder("folder-1", "token")).rejects.toThrow(
        "Failed to fetch folder",
      );
    });
  });

  describe("client-side (without token)", () => {
    it("successfully fetches folder using apiClient", async () => {
      const mockFolder: GetFolderResponse = {
        folder: {
          id: "folder-4",
          name: "Client Folder",
          ownerId: "user-2",
          parentId: null,
          shareExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [],
          files: [],
        },
        isOwner: true,
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolder,
      });

      const result = await getFolder("folder-4");

      expect(apiClient.get).toHaveBeenCalledWith("/folders/folder-4");
      expect(result).toEqual(mockFolder);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("returns folder with nested subfolders and multiple files", async () => {
      const mockFolder: GetFolderResponse = {
        folder: {
          id: "folder-5",
          name: "Nested Folder",
          ownerId: "user-1",
          parentId: "parent-folder",
          shareExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [
            {
              id: "subfolder-1",
              name: "Subfolder 1",
              ownerId: "user-1",
              parentId: "folder-5",
              shareExpiresAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "subfolder-2",
              name: "Subfolder 2",
              ownerId: "user-1",
              parentId: "folder-5",
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
              folderId: "folder-5",
              shareExpiresAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "file-2",
              name: "file2.jpg",
              fileLink: "https://example.com/file2.jpg",
              sizeBytes: 2048,
              ownerId: "user-1",
              folderId: "folder-5",
              shareExpiresAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        isOwner: true,
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockFolder,
      });

      const result = await getFolder("folder-5");

      expect(result.folder.subfolders).toHaveLength(2);
      expect(result.folder.files).toHaveLength(2);
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to access this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolder("restricted-folder")).rejects.toThrow(
        "You are not allowed to access this folder",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolder("folder-1")).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolder("folder-1")).rejects.toThrow(
        "Failed to fetch folder",
      );
    });
  });
});
