import { NextRequest, NextResponse } from "next/server";
import { GET } from "@/app/auth/cleanup/route";
import { removeUserToken } from "@/features/auth/lib";
import { Routes } from "@/shared/lib/routes";

vi.mock("@/features/auth/lib", () => ({
  removeUserToken: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn(),
  },
}));

describe("GET /auth/cleanup", () => {
  it("removes user token and redirects to login page", async () => {
    const mockRequest = {
      url: "https://example.com/auth/cleanup",
    } as NextRequest;

    const mockRedirectResponse = {
      status: 302,
      headers: new Headers(),
    };

    (removeUserToken as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (NextResponse.redirect as ReturnType<typeof vi.fn>).mockReturnValue(
      mockRedirectResponse
    );

    const result = await GET(mockRequest);

    expect(removeUserToken).toHaveBeenCalledOnce();
    expect(NextResponse.redirect).toHaveBeenCalledWith(
      new URL(Routes.AUTH_LOGIN, mockRequest.url)
    );
    expect(result).toBe(mockRedirectResponse);
  });
});
