"use server";

import { cookies } from "next/headers";
import { UserResponse } from "@file-uploader/shared";
import { me } from "@/features/auth/api";

/**
 * Fetches the current authenticated user from the server.
 *
 * Gets the token from cookies and makes a request to /auth/me.
 * Returns null if the user is not authenticated or if the request fails.
 *
 * @returns Promise resolving to user data or null if not authenticated
 */
export async function getCurrentUser(): Promise<UserResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const user = await me(token);
    return user;
  } catch {
    return null;
  }
}
