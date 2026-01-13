import axios from "axios";
import apiClient from "@/shared/api/client";
import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { me } from "@/features/auth/api/me";
import { config } from "@/shared/lib/config";

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

describe("me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("server-side (with token)", () => {
    it("successfully fetches user with token", async () => {
      const mockUser = {
        id: "123",
        username: "testuser",
        createdAt: new Date().toISOString(),
      };

      (axios.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockUser,
      });

      const result = await me("test-token-123");

      expect(axios.get).toHaveBeenCalledWith(`${config.apiUrl}/auth/me`, {
        headers: {
          Authorization: "Bearer test-token-123",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(mockUser);
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it("throws error with message from API response", async () => {
      const mockError: AxiosError<{ error?: string }> = {
        response: {
          data: { error: "Invalid token" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        message: "Request failed",
      } as AxiosError<{ error?: string }>;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(me("invalid-token")).rejects.toThrow("Invalid token");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Network Error",
      } as AxiosError;

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(me("token")).rejects.toThrow("Network Error");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (axios.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(me("token")).rejects.toThrow("Failed to fetch user");
    });
  });

  describe("client-side (without token)", () => {
    it("successfully fetches user using apiClient", async () => {
      const mockUser = {
        id: "456",
        username: "clientuser",
        createdAt: new Date().toISOString(),
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockUser,
      });

      const result = await me();

      expect(apiClient.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(mockUser);
      expect(axios.get).not.toHaveBeenCalled();
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

      await expect(me()).rejects.toThrow("Unauthorized");
    });

    it("throws error with axios error message when no response data", async () => {
      const mockError: AxiosError = {
        message: "Request timeout",
      } as AxiosError;

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(me()).rejects.toThrow("Request timeout");
    });

    it("throws default error message when error has no message", async () => {
      const mockError = {};

      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(me()).rejects.toThrow("Failed to fetch user");
    });
  });
});
