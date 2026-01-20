import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { renameFolder } from "@/features/folder/api/rename-folder";
import { config } from "@/shared/lib/config";
import { Folder } from "@file-uploader/shared";

vi.mock("@/shared/api/client", () => ({
  default: {
    put: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    put: vi.fn(),
  },
}));

vi.mock("@/shared/lib/config", () => ({
  config: {
    apiUrl: "http://localhost:3001/api",
  },
}));

describe("renameFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully renames folder with token", async () => {
      const mockFolder: Folder = {
        id: "folder-1",
        name: "Renamed Folder",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (axios.put as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await renameFolder(
        "folder-1",
        { name: "Renamed Folder" },
        "test-token-123",
      );

      expect(axios.put).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-1`,
        { name: "Renamed Folder" },
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(result).toEqual(mockFolder);
      expect(result.name).toBe("Renamed Folder");
      expect(apiClient.put).not.toHaveBeenCalled();
    });

    it("throws error with message from API response for folder not found", async () => {
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

      (axios.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("invalid-id", { name: "New Name" }, "token"),
      ).rejects.toThrow("Folder not found");
    });

    it("throws error with message for unauthorized access", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to rename this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "New Name" }, "token"),
      ).rejects.toThrow("You are not allowed to rename this folder");
    });

    it("throws error with message for duplicate name", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "A folder with this name already exists" },
          status: 409,
          statusText: "Conflict",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "Existing Name" }, "token"),
      ).rejects.toThrow("A folder with this name already exists");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "New Name" }, "token"),
      ).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "New Name" }, "token"),
      ).rejects.toThrow("Failed to rename folder");
    });
  });

  describe("client-side (without token)", () => {
    it("successfully renames folder using apiClient", async () => {
      const mockFolder: Folder = {
        id: "folder-2",
        name: "Client Renamed Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiClient.put as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await renameFolder("folder-2", {
        name: "Client Renamed Folder",
      });

      expect(apiClient.put).toHaveBeenCalledWith("/folders/folder-2", {
        name: "Client Renamed Folder",
      });
      expect(result).toEqual(mockFolder);
      expect(result.name).toBe("Client Renamed Folder");
      expect(axios.put).not.toHaveBeenCalled();
    });

    it("throws error with message from API response for folder not found", async () => {
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

      (apiClient.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("invalid-id", { name: "New Name" }),
      ).rejects.toThrow("Folder not found");
    });

    it("throws error with message for unauthorized access", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to rename this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "New Name" }),
      ).rejects.toThrow("You are not allowed to rename this folder");
    });

    it("throws error with message for duplicate name", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "A folder with this name already exists" },
          status: 409,
          statusText: "Conflict",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "Existing Name" }),
      ).rejects.toThrow("A folder with this name already exists");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "New Name" }),
      ).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.put as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        renameFolder("folder-1", { name: "New Name" }),
      ).rejects.toThrow("Failed to rename folder");
    });
  });
});
