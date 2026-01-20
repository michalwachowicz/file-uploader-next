import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { deleteFolder } from "@/features/folder/api/delete-folder";
import { config } from "@/shared/lib/config";

vi.mock("@/shared/api/client", () => ({
  default: {
    delete: vi.fn(),
  },
}));

vi.mock("axios", () => ({
  default: {
    delete: vi.fn(),
  },
}));

vi.mock("@/shared/lib/config", () => ({
  config: {
    apiUrl: "http://localhost:3001/api",
  },
}));

describe("deleteFolder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully deletes folder with token", async () => {
      (axios.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 204,
      });

      await deleteFolder("folder-1", "test-token-123");

      expect(axios.delete).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-1`,
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(apiClient.delete).not.toHaveBeenCalled();
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

      (axios.delete as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(deleteFolder("invalid-id", "token")).rejects.toThrow(
        "Folder not found",
      );
    });

    it("throws error with message for unauthorized access", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to delete this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.delete as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(deleteFolder("folder-1", "token")).rejects.toThrow(
        "You are not allowed to delete this folder",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.delete as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(deleteFolder("folder-1", "token")).rejects.toThrow(
        "Network Error",
      );
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.delete as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(deleteFolder("folder-1", "token")).rejects.toThrow(
        "Failed to delete folder",
      );
    });
  });

  describe("client-side (without token)", () => {
    it("successfully deletes folder using apiClient", async () => {
      (apiClient.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
        status: 204,
      });

      await deleteFolder("folder-1");

      expect(apiClient.delete).toHaveBeenCalledWith("/folders/folder-1");
      expect(axios.delete).not.toHaveBeenCalled();
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

      (apiClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(deleteFolder("invalid-id")).rejects.toThrow(
        "Folder not found",
      );
    });

    it("throws error with message for unauthorized access", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "You are not allowed to delete this folder" },
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (apiClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(deleteFolder("folder-1")).rejects.toThrow(
        "You are not allowed to delete this folder",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(deleteFolder("folder-1")).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.delete as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(deleteFolder("folder-1")).rejects.toThrow(
        "Failed to delete folder",
      );
    });
  });
});
