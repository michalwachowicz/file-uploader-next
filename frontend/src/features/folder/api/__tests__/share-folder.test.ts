import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { shareFolder } from "@/features/folder/api/share-folder";
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

describe("shareFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully shares folder with duration using token", async () => {
      const mockFolder: Folder = {
        id: "folder-1",
        name: "Shared Folder",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await shareFolder(
        "folder-1",
        { durationHours: 24 },
        "test-token-123",
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-1/share`,
        { durationHours: 24 },
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(result).toEqual(mockFolder);
      expect(result.shareExpiresAt).toBeTruthy();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("successfully shares folder indefinitely using token", async () => {
      const mockFolder: Folder = {
        id: "folder-1",
        name: "Shared Folder",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await shareFolder(
        "folder-1",
        { indefinite: true },
        "test-token-123",
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-1/share`,
        { indefinite: true },
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(result).toEqual(mockFolder);
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it("successfully unshares folder using token", async () => {
      const mockFolder: Folder = {
        id: "folder-1",
        name: "Unshared Folder",
        ownerId: "user-1",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (axios.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await shareFolder(
        "folder-1",
        { durationHours: null },
        "test-token-123",
      );

      expect(axios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-1/share`,
        { durationHours: null },
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(result).toEqual(mockFolder);
      expect(result.shareExpiresAt).toBeNull();
      expect(apiClient.post).not.toHaveBeenCalled();
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

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("invalid-id", { durationHours: 24 }, "token"),
      ).rejects.toThrow("Folder not found");
    });

    it("throws error with message for unauthorized access", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to share this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("folder-1", { durationHours: 24 }, "token"),
      ).rejects.toThrow("You are not allowed to share this folder");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("folder-1", { durationHours: 24 }, "token"),
      ).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("folder-1", { durationHours: 24 }, "token"),
      ).rejects.toThrow("Failed to share folder");
    });
  });

  describe("client-side (without token)", () => {
    it("successfully shares folder with duration using apiClient", async () => {
      const mockFolder: Folder = {
        id: "folder-2",
        name: "Client Shared Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await shareFolder("folder-2", { durationHours: 48 });

      expect(apiClient.post).toHaveBeenCalledWith("/folders/folder-2/share", {
        durationHours: 48,
      });
      expect(result).toEqual(mockFolder);
      expect(result.shareExpiresAt).toBeTruthy();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("successfully shares folder indefinitely using apiClient", async () => {
      const mockFolder: Folder = {
        id: "folder-2",
        name: "Client Shared Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await shareFolder("folder-2", { indefinite: true });

      expect(apiClient.post).toHaveBeenCalledWith("/folders/folder-2/share", {
        indefinite: true,
      });
      expect(result).toEqual(mockFolder);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it("successfully unshares folder using apiClient", async () => {
      const mockFolder: Folder = {
        id: "folder-2",
        name: "Client Unshared Folder",
        ownerId: "user-2",
        parentId: null,
        shareExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { folder: mockFolder },
      });

      const result = await shareFolder("folder-2", { durationHours: null });

      expect(apiClient.post).toHaveBeenCalledWith("/folders/folder-2/share", {
        durationHours: null,
      });
      expect(result).toEqual(mockFolder);
      expect(result.shareExpiresAt).toBeNull();
      expect(axios.post).not.toHaveBeenCalled();
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

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("invalid-id", { durationHours: 24 }),
      ).rejects.toThrow("Folder not found");
    });

    it("throws error with message for unauthorized access", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to share this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("folder-1", { durationHours: 24 }),
      ).rejects.toThrow("You are not allowed to share this folder");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("folder-1", { durationHours: 24 }),
      ).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        shareFolder("folder-1", { durationHours: 24 }),
      ).rejects.toThrow("Failed to share folder");
    });
  });
});
