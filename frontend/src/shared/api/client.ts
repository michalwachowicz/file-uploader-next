import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { config } from "@/shared/lib/config";

/**
 * Storage key for authentication token cookie.
 */
const TOKEN_COOKIE_KEY = "auth_token";

/**
 * Cookie options for token storage.
 */
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

/**
 * Get authentication token from cookies.
 *
 * @returns The JWT token or undefined if not found
 */
function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_KEY);
}

/**
 * Set authentication token in cookies.
 *
 * @param token - The JWT token to store
 */
export function setToken(token: string): void {
  Cookies.set(TOKEN_COOKIE_KEY, token, COOKIE_OPTIONS);
}

/**
 * Remove authentication token from cookies.
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_COOKIE_KEY);
}

/**
 * Configured axios instance with interceptors.
 *
 * Automatically attaches JWT token to requests via Authorization header.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach token to all requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      removeToken();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
