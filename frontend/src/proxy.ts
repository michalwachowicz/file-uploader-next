import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Routes } from "@/shared/lib/routes";

/**
 * Authentication proxy for Next.js.
 *
 * - Redirects authenticated users away from auth routes (login/register)
 * - Redirects unauthenticated users away from protected routes (home)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!token;

  const authRoutes = [Routes.AUTH_LOGIN, Routes.AUTH_REGISTER] as string[];
  const isAuthRoute = authRoutes.includes(pathname);

  const protectedRoutes = [Routes.HOME] as string[];
  const isProtectedRoute = protectedRoutes.includes(pathname);

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL(Routes.HOME, request.url));
  }

  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL(Routes.AUTH_LOGIN, request.url));
  }

  return NextResponse.next();
}

/**
 * Configure which routes the proxy should run on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
