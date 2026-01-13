import { cookies } from "next/headers";
import { getCurrentUser } from "@/features/auth/lib";
import { me } from "@/features/auth/api";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/features/auth/api", () => ({
  me: vi.fn(),
}));

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when token exists and request succeeds", async () => {
    const mockUser = {
      id: "123",
      username: "testuser",
      createdAt: new Date().toISOString(),
    };

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "test-token-123" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (me as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

    const result = await getCurrentUser();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(me).toHaveBeenCalledWith("test-token-123");
    expect(result).toEqual(mockUser);
  });

  it("returns null when token does not exist", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

    const result = await getCurrentUser();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(me).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns null when token exists but cookie value is empty", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);

    const result = await getCurrentUser();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(me).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("returns null when me() throws an error", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "invalid-token" }),
    };

    (cookies as ReturnType<typeof vi.fn>).mockResolvedValue(mockCookieStore);
    (me as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Invalid token")
    );

    const result = await getCurrentUser();

    expect(cookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith("auth_token");
    expect(me).toHaveBeenCalledWith("invalid-token");
    expect(result).toBeNull();
  });

  it("returns null when cookies() throws an error", async () => {
    (cookies as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Cookie error")
    );

    const result = await getCurrentUser();

    expect(cookies).toHaveBeenCalled();
    expect(me).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
