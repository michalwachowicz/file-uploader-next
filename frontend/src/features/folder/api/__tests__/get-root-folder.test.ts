import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getRootFolder } from "@/features/folder/api/get-root-folder";
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

describe("getRootFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully fetches root folder with token", async () => {
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

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockRootFolder,
      });

      const result = await getRootFolder("test-token-123");

      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/folders/root`, {
        headers: {
          Authorization: "Bearer test-token-123",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockRootFolder);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

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

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockRootFolder,
      });

      const result = await getRootFolder("test-token-123");

      expect(result).toEqual(mockRootFolder);
      expect(result.folder.subfolders).toHaveLength(0);
      expect(result.folder.files).toHaveLength(0);
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

      await expect(getRootFolder("invalid-token")).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getRootFolder("token")).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getRootFolder("token")).rejects.toThrow(
        "Failed to fetch root folder",
      );
    });
  });

  describe("client-side (without token)", () => {
    it("successfully fetches root folder using apiClient", async () => {
      const mockRootFolder: GetFolderResponse = {
        folder: {
          id: "",
          name: "My Drive",
          ownerId: "user-2",
          parentId: null,
          shareExpiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subfolders: [
            {
              id: "folder-2",
              name: "Folder 2",
              ownerId: "user-2",
              parentId: null,
              shareExpiresAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          files: [],
        },
        isOwner: true,
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockRootFolder,
      });

      const result = await getRootFolder();

      expect(apiClient.get).toHaveBeenCalledWith("/folders/root");
      expect(result).toEqual(mockRootFolder);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("returns root folder with multiple subfolders and files", async () => {
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
            {
              id: "folder-2",
              name: "Folder 2",
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
            {
              id: "file-2",
              name: "file2.jpg",
              fileLink: "https://example.com/file2.jpg",
              sizeBytes: 2048,
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

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockRootFolder,
      });

      const result = await getRootFolder();

      expect(result.folder.subfolders).toHaveLength(2);
      expect(result.folder.files).toHaveLength(2);
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

      await expect(getRootFolder()).rejects.toThrow("Forbidden");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getRootFolder()).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getRootFolder()).rejects.toThrow(
        "Failed to fetch root folder",
      );
    });
  });
});
