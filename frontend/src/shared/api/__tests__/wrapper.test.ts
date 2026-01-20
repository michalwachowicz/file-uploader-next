import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import apiClient from "@/shared/api/client";
import { apiRequest } from "@/shared/api/wrapper";
import { config } from "@/shared/lib/config";

vi.mock("@/shared/api/client", () => ({
  default: {
    request: vi.fn(),
  },
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    request: vi.fn(),
  },
}));

vi.mock("@/shared/lib/config", () => ({
  config: {
    apiUrl: "http://localhost:3001/api",
  },
}));

describe("apiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully makes GET request with token", async () => {
      const mockData = { id: "1", name: "Test" };
      (axios.request as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockData,
      });

      const result = await apiRequest({
        method: "GET",
        path: "/test",
        token: "test-token",
        defaultErrorMessage: "Request failed",
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: "GET",
        url: `${config.apiUrl}/test`,
        data: undefined,
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockData);
      expect(apiClient.request).not.toHaveBeenCalled();
    });

    it("successfully makes POST request with token and data", async () => {
      const mockData = { id: "1", name: "Created" };
      const requestData = { name: "Created" };
      (axios.request as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockData,
      });

      const result = await apiRequest({
        method: "POST",
        path: "/test",
        data: requestData,
        token: "test-token",
        defaultErrorMessage: "Request failed",
      });

      expect(axios.request).toHaveBeenCalledWith({
        method: "POST",
        url: `${config.apiUrl}/test`,
        data: requestData,
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockData);
    });

    it("successfully extracts nested data when extractData is provided", async () => {
      const mockResponse = { data: { folder: { id: "1", name: "Folder" } } };
      (axios.request as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const result = await apiRequest({
        method: "GET",
        path: "/test",
        token: "test-token",
        defaultErrorMessage: "Request failed",
        extractData: (response) =>
          (response.data as { folder: unknown }).folder,
      });

      expect(result).toEqual({ id: "1", name: "Folder" });
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Not found" },
          status: 404,
          statusText: "Not Found",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.request as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        apiRequest({
          method: "GET",
          path: "/test",
          token: "test-token",
          defaultErrorMessage: "Request failed",
        }),
      ).rejects.toThrow("Not found");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.request as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        apiRequest({
          method: "GET",
          path: "/test",
          token: "test-token",
          defaultErrorMessage: "Request failed",
        }),
      ).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};
      (axios.request as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(
        apiRequest({
          method: "GET",
          path: "/test",
          token: "test-token",
          defaultErrorMessage: "Custom error message",
        }),
      ).rejects.toThrow("Custom error message");
    });
  });

  describe("client-side (without token)", () => {
    it("successfully makes GET request using apiClient", async () => {
      const mockData = { id: "1", name: "Test" };
      (apiClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockData,
      });

      const result = await apiRequest({
        method: "GET",
        path: "/test",
        defaultErrorMessage: "Request failed",
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: "GET",
        url: "/test",
        data: undefined,
      });
      expect(result).toEqual(mockData);
      expect(axios.request).not.toHaveBeenCalled();
    });

    it("successfully makes POST request with data using apiClient", async () => {
      const mockData = { id: "1", name: "Created" };
      const requestData = { name: "Created" };
      (apiClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockData,
      });

      const result = await apiRequest({
        method: "POST",
        path: "/test",
        data: requestData,
        defaultErrorMessage: "Request failed",
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: "POST",
        url: "/test",
        data: requestData,
      });
      expect(result).toEqual(mockData);
    });

    it("successfully extracts nested data when extractData is provided", async () => {
      const mockResponse = { data: { folder: { id: "1", name: "Folder" } } };
      (apiClient.request as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockResponse,
      );

      const result = await apiRequest({
        method: "GET",
        path: "/test",
        defaultErrorMessage: "Request failed",
        extractData: (response) =>
          (response.data as { folder: unknown }).folder,
      });

      expect(result).toEqual({ id: "1", name: "Folder" });
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

      (apiClient.request as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(
        apiRequest({
          method: "GET",
          path: "/test",
          defaultErrorMessage: "Request failed",
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.request as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(
        apiRequest({
          method: "GET",
          path: "/test",
          defaultErrorMessage: "Request failed",
        }),
      ).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};
      (apiClient.request as ReturnType<typeof vi.fn>).mockRejectedValue(
        mockError,
      );

      await expect(
        apiRequest({
          method: "GET",
          path: "/test",
          defaultErrorMessage: "Custom error message",
        }),
      ).rejects.toThrow("Custom error message");
    });
  });

  describe("HTTP methods", () => {
    it.each([
      ["GET", "GET"],
      ["POST", "POST"],
      ["PUT", "PUT"],
      ["DELETE", "DELETE"],
      ["PATCH", "PATCH"],
    ])("successfully makes %s request", async (method, expectedMethod) => {
      const mockData = { success: true };
      (apiClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockData,
      });

      await apiRequest({
        method: method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        path: "/test",
        defaultErrorMessage: "Request failed",
      });

      expect(apiClient.request).toHaveBeenCalledWith({
        method: expectedMethod,
        url: "/test",
        data: undefined,
      });
    });
  });
});
