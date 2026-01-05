import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { login } from "@/features/auth/api/login";
import apiClient, { setToken } from "@/shared/api/client";

vi.mock("@/shared/api/client", () => ({
  default: {
    post: vi.fn(),
  },
  setToken: vi.fn(),
}));

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully logs in and stores token", async () => {
    const mockResponse = {
      data: {
        user: {
          id: "123",
          username: "testuser",
          createdAt: new Date(),
        },
        token: "test-token-123",
      },
    };

    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse
    );

    const result = await login({
      username: "testuser",
      password: "password123",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      username: "testuser",
      password: "password123",
    });
    expect(setToken).toHaveBeenCalledWith("test-token-123");
    expect(result).toEqual(mockResponse.data);
  });

  it("throws error with message from API response", async () => {
    const mockError: AxiosError<{ error?: string }> = {
      response: {
        data: { error: "Invalid credentials" },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      },
    } as AxiosError<{ error?: string }>;

    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(
      login({ username: "testuser", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
    expect(setToken).not.toHaveBeenCalled();
  });

  it("throws error with axios error message when no response data", async () => {
    const mockError: AxiosError = {
      message: "Network Error",
    } as AxiosError;

    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(
      login({ username: "testuser", password: "password" })
    ).rejects.toThrow("Network Error");
    expect(setToken).not.toHaveBeenCalled();
  });

  it("throws default error message when error has no message", async () => {
    const mockError = {};

    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(
      login({ username: "testuser", password: "password" })
    ).rejects.toThrow("Login failed");
    expect(setToken).not.toHaveBeenCalled();
  });
});
