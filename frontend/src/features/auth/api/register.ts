import { RegisterInput, RegisterResponse } from "@file-uploader/shared";
import { apiRequest } from "@/shared/api/wrapper";

/**
 * Registers a new user account.
 *
 * @param data - User registration credentials (username and password)
 * @returns Promise resolving to registration response with user data (no token)
 * @throws {Error} If registration fails (username already exists, validation errors, etc.)
 */
export async function register(data: RegisterInput): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>({
    method: "POST",
    path: "/auth/register",
    data,
    defaultErrorMessage: "Registration failed",
  });
}
