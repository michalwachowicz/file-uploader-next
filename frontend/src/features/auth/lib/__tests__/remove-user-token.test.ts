import { cookies } from "next/headers";
import { removeUserToken } from "@/features/auth/lib";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("removeUserToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the auth_token cookie", async () => {
    const mockDelete = vi.fn();
    const mockCookieStore = {
      delete: mockDelete,
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

    await removeUserToken();

    expect(cookies).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith("auth_token");
  });

  it("handles errors gracefully", async () => {
    (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Cookie error")
    );

    await expect(removeUserToken()).rejects.toThrow("Cookie error");
  });
});
