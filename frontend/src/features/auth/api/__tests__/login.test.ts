import { login } from "@/features/auth/api/login";
import { apiRequest } from "@/shared/api/wrapper";
import { setToken } from "@/shared/api/client";
import { LoginResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/shared/api/client", () => ({
  setToken: vi.fn(),
}));

describe("login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest and stores token", async () => {
    const mockResponse: LoginResponse = {
      user: {
        id: "123",
        username: "testuser",
        createdAt: new Date().toISOString(),
      },
      token: "test-token-123",
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await login({
      username: "testuser",
      password: "password123",
    });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/login",
      data: {
        username: "testuser",
        password: "password123",
      },
      defaultErrorMessage: "Login failed",
    });
    expect(setToken).toHaveBeenCalledWith("test-token-123");
    expect(result).toEqual(mockResponse);
  });
});
