import Cookies from "js-cookie";
import { setToken, removeToken } from "@/shared/api/client";

vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("client token management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setToken", () => {
    it("sets token in cookies with correct options", () => {
      const token = "test-token-123";
      setToken(token);

      expect(Cookies.set).toHaveBeenCalledWith(
        "auth_token",
        token,
        expect.objectContaining({
          expires: 7,
          sameSite: "strict",
          secure: expect.any(Boolean),
        })
      );
    });
  });

  describe("removeToken", () => {
    it("removes token from cookies", () => {
      removeToken();

      expect(Cookies.remove).toHaveBeenCalledWith("auth_token");
    });
  });
});
