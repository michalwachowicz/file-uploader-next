import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { register } from "@/features/auth/api/register";
import apiClient from "@/shared/api/client";

vi.mock("@/shared/api/client", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully registers user", async () => {
    const mockResponse = {
      data: {
        user: {
          id: "123",
          username: "newuser",
          createdAt: new Date(),
        },
      },
    };

    (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResponse
    );

    const result = await register({
      username: "newuser",
      password: "password123",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
      username: "newuser",
      password: "password123",
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("throws error with message from API response", async () => {
    const mockError: AxiosError<{ error?: string }> = {
      response: {
        data: { error: "Username already exists" },
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      },
    } as AxiosError<{ error?: string }>;

    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(
      register({ username: "existinguser", password: "password123" })
    ).rejects.toThrow("Username already exists");
  });

  it("throws error with axios error message when no response data", async () => {
    const mockError: AxiosError = {
      message: "Network Error",
    } as AxiosError;

    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(
      register({ username: "newuser", password: "password" })
    ).rejects.toThrow("Network Error");
  });

  it("throws default error message when error has no message", async () => {
    const mockError = {};

    (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    await expect(
      register({ username: "newuser", password: "password" })
    ).rejects.toThrow("Registration failed");
  });
});
