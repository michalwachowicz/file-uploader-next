import { register } from "@/features/auth/api/register";
import { apiRequest } from "@/shared/api/wrapper";
import { RegisterResponse } from "@file-uploader/shared";

vi.mock("@/shared/api/wrapper", () => ({
  apiRequest: vi.fn(),
}));

describe("register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls apiRequest with correct parameters", async () => {
    const mockResponse: RegisterResponse = {
      user: {
        id: "123",
        username: "newuser",
        createdAt: new Date().toISOString(),
      },
    };

    (apiRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await register({
      username: "newuser",
      password: "password123",
    });

    expect(apiRequest).toHaveBeenCalledWith({
      method: "POST",
      path: "/auth/register",
      data: {
        username: "newuser",
        password: "password123",
      },
      defaultErrorMessage: "Registration failed",
    });
    expect(result).toEqual(mockResponse);
  });
});
