import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { createFolder } from "@/features/folder/api/create-folder";
import { config } from "@/shared/lib/config";
import { Folder } from "@file-uploader/shared";

vi.mock("@/shared/api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock("@/shared/lib/config", () => ({
  config: {
    apiUrl: "http://localhost:3001/api",
  },
}));

describe("createFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully creates folder with token", async () => {
      const mockFolder: Folder = {
        id: "new-folder-1",
        name: "New Folder",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await createFolder(
        { name: "New Folder" },
        "test-token-123"
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/folders`,
        { name: "New Folder" },
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockFolder);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("successfully creates folder with parentId", async () => {
      const mockFolder: Folder = {
        id: "new-folder-2",
        name: "Child Folder",
        ownerId: "user-1",
        parentId: "parent-folder-1",
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await createFolder(
        { name: "Child Folder", parentId: "parent-folder-1" },
        "test-token-123"
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/folders`,
        { name: "Child Folder", parentId: "parent-folder-1" },
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockFolder);
      expect(result.parentId).toBe("parent-folder-1");
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Folder name already exists" },
          status: 409,
          statusText: "Conflict",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        createFolder({ name: "Existing Folder" }, "token")
      ).rejects.toThrow("Folder name already exists");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        createFolder({ name: "New Folder" }, "token")
      ).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        createFolder({ name: "New Folder" }, "token")
      ).rejects.toThrow("Failed to create folder");
    });
  });

  describe("client-side (without token)", () => {
    it("successfully creates folder using apiClient", async () => {
      const mockFolder: Folder = {
        id: "new-folder-3",
        name: "Client Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await createFolder({ name: "Client Folder" });

      expect(apiClient.post).toHaveBeenCalledWith("/folders", {
        name: "Client Folder",
      });
      expect(result).toEqual(mockFolder);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("successfully creates folder with parentId using apiClient", async () => {
      const mockFolder: Folder = {
        id: "new-folder-4",
        name: "Nested Folder",
        ownerId: "user-2",
        parentId: "parent-folder-2",
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await createFolder({
        name: "Nested Folder",
        parentId: "parent-folder-2",
      });

      expect(apiClient.post).toHaveBeenCalledWith("/folders", {
        name: "Nested Folder",
        parentId: "parent-folder-2",
      });
      expect(result).toEqual(mockFolder);
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Invalid parent folder" },
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        createFolder({ name: "Folder", parentId: "invalid-parent" })
      ).rejects.toThrow("Invalid parent folder");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(createFolder({ name: "New Folder" })).rejects.toThrow(
        "Request timeout"
      );
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(createFolder({ name: "New Folder" })).rejects.toThrow(
        "Failed to create folder"
      );
    });
  });
});
