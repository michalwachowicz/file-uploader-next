import { me } from "@/features/auth/api/me";
import { apiRequest } from "@/shared/api/wrapper";
import { UserResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters for server-side", async () => {
    const mockResponse: UserResponse = {
      id: "123",
      username: "testuser",
      createdAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await me("test-token");

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/auth/me",
      token: "test-token",
      defaultErrorMessage: "Failed to fetch user",
    });
    expect(result).toEqual(mockResponse);
  });

  it("calls apiRequest with correct parameters for client-side", async () => {
    const mockResponse: UserResponse = {
      id: "123",
      username: "testuser",
      createdAt: new Date().toISOString(),
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await me();

    expect(apiRequest).toHaveBeenCalledWith({
      method: "GET",
      path: "/auth/me",
      token: undefined,
      defaultErrorMessage: "Failed to fetch user",
    });
    expect(result).toEqual(mockResponse);
  });
});
