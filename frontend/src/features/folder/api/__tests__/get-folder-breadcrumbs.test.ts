import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getFolderBreadcrumbs } from "@/features/folder/api/get-folder-breadcrumbs";
import { config } from "@/shared/lib/config";
import { GetFolderBreadcrumbsResponse } from "@file-uploader/shared";

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

describe("getFolderBreadcrumbs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully fetches breadcrumbs with token", async () => {
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

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("folder-2", "test-token-123");

      expect(axios.get).toHaveBeenCalledWith(
        `${config.apiUrl}/folders/folder-2/breadcrumbs`,
        {
          headers: {
            Authorization: "Bearer test-token-123",
            "Content-Type": "application/json",
          },
        },
      );
      expect(result).toEqual(mockBreadcrumbs);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

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

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("root-folder-id", "token");

      expect(result.breadcrumbs).toHaveLength(1);
      expect(result.breadcrumbs[0].id).toBe("");
      expect(result.breadcrumbs[0].name).toBe("My Drive");
    });

    it("returns breadcrumbs with shared folder information", async () => {
      const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
        breadcrumbs: [
          {
            id: "shared-folder-1",
            name: "Shared Folder",
            shareExpiresAt: new Date(Date.now() + 86400000).toISOString(), // expires in 1 day
          },
          {
            id: "folder-1",
            name: "Nested Folder",
            shareExpiresAt: null,
          },
        ],
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("folder-1", "token");

      expect(result.breadcrumbs).toHaveLength(2);
      expect(result.breadcrumbs[0].shareExpiresAt).not.toBeNull();
    });

    it("returns empty breadcrumbs array", async () => {
      const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
        breadcrumbs: [],
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("folder-id", "token");

      expect(result.breadcrumbs).toHaveLength(0);
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

      await expect(getFolderBreadcrumbs("invalid-id", "token")).rejects.toThrow(
        "Folder not found",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderBreadcrumbs("folder-1", "token")).rejects.toThrow(
        "Network Error",
      );
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderBreadcrumbs("folder-1", "token")).rejects.toThrow(
        "Failed to fetch folder breadcrumbs",
      );
    });
  });

  describe("client-side (without token)", () => {
    it("successfully fetches breadcrumbs using apiClient", async () => {
      const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
        breadcrumbs: [
          {
            id: "",
            name: "My Drive",
            shareExpiresAt: null,
          },
          {
            id: "folder-3",
            name: "Client Folder",
            shareExpiresAt: null,
          },
        ],
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("folder-3");

      expect(apiClient.get).toHaveBeenCalledWith(
        "/folders/folder-3/breadcrumbs",
      );
      expect(result).toEqual(mockBreadcrumbs);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("returns deep breadcrumb path", async () => {
      const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
        breadcrumbs: [
          {
            id: "",
            name: "My Drive",
            shareExpiresAt: null,
          },
          {
            id: "folder-1",
            name: "Level 1",
            shareExpiresAt: null,
          },
          {
            id: "folder-2",
            name: "Level 2",
            shareExpiresAt: null,
          },
          {
            id: "folder-3",
            name: "Level 3",
            shareExpiresAt: null,
          },
          {
            id: "folder-4",
            name: "Level 4",
            shareExpiresAt: null,
          },
        ],
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("folder-4");

      expect(result.breadcrumbs).toHaveLength(5);
      expect(result.breadcrumbs[result.breadcrumbs.length - 1].name).toBe(
        "Level 4",
      );
    });

    it("returns breadcrumbs for shared folder starting from first shared ancestor", async () => {
      const mockBreadcrumbs: GetFolderBreadcrumbsResponse = {
        breadcrumbs: [
          {
            id: "",
            name: "My Drive",
            shareExpiresAt: null,
          },
          {
            id: "shared-folder",
            name: "Shared Folder",
            shareExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            id: "nested-folder",
            name: "Nested Folder",
            shareExpiresAt: null,
          },
        ],
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockBreadcrumbs,
      });

      const result = await getFolderBreadcrumbs("nested-folder");

      expect(result.breadcrumbs).toHaveLength(3);
      expect(result.breadcrumbs[1].shareExpiresAt).not.toBeNull();
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

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderBreadcrumbs("folder-1")).rejects.toThrow(
        "Unauthorized",
      );
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderBreadcrumbs("folder-1")).rejects.toThrow(
        "Request timeout",
      );
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(getFolderBreadcrumbs("folder-1")).rejects.toThrow(
        "Failed to fetch folder breadcrumbs",
      );
    });
  });
});
